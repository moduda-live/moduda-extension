<template>
  <div class="partyUser" :class="{ userSpeaking: user.isSpeaking }">
    <Avatar
      style="color: #f56a00;background-color: #fde3cf"
      size="small"
      class="userAvatar"
      >{{ usernameFirstChar }}</Avatar
    >
    <h4 class="userName">{{ user.username }}</h4>
    <audio autoplay ref="userAudio" />
    <div class="mic">
      <Icon
        size="17"
        class="userSpeakingIndicator icon"
        type="md-megaphone"
        v-show="user.isSpeaking"
      />
      <Icon
        size="17"
        class="icon"
        type="md-mic"
        v-show="!user.isMuted"
        @click="toggleMute"
      />
      <Icon
        size="17"
        class="icon"
        type="md-mic-off"
        v-show="user.isMuted"
        @click="toggleMute"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import throttle from "lodash.throttle";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import volumeProcessorWorklet from "worklet-loader!../../worklet/volumeProcessorWorklet";

const TIMEOUT_RESET_WINDOW = 750;
const THROTTLE_RATE = 150;
const USER_SPEAKING_VOLUME_THRESHOLD = 0.05;

export default Vue.extend({
  name: "VoiceChatPanel",
  props: ["user"],
  mounted() {
    // is this user is our own, call analyseAudio ourself since the watcher wont be triggered
    if (this.user.isOwn) {
      this.analyseAudio(this.user.stream);
    }
  },
  computed: {
    usernameFirstChar() {
      return this.user.username.charAt(0).toUpperCase();
    },
    isThereTimeout(): boolean {
      return this.timeout !== -1;
    }
  },
  data() {
    return {
      timeout: -1
    };
  },
  watch: {
    "user.stream": {
      handler(newVal: MediaStream, oldVal: MediaStream) {
        console.log("Change from: ", oldVal);
        console.log("Change to: ", newVal);

        if (newVal) {
          this.analyseAudio(newVal);
        }

        const userAudio = this.$refs.userAudio as HTMLAudioElement;
        userAudio.srcObject = newVal;
      }
    }
  },
  created() {
    this.detectUserSpeaking = throttle(this.detectUserSpeaking, THROTTLE_RATE);
  },
  methods: {
    toggleMute() {
      this.$store.commit("TOGGLE_MUTE_USER", this.user.id);
    },
    detectUserSpeaking(event: MessageEvent) {
      const volume = event.data.volume;
      if (volume > USER_SPEAKING_VOLUME_THRESHOLD) {
        this.user.isSpeaking = true;
        if (this.isThereTimeout) {
          clearTimeout(this.timeout);
          this.timeout = -1;
        }
      } else {
        if (this.isThereTimeout) {
          return;
        }

        this.timeout = window.setTimeout(
          () => (this.user.isSpeaking = false),
          TIMEOUT_RESET_WINDOW
        );
      }
    },
    async analyseAudio(stream: MediaStream) {
      const audioCtx = new AudioContext();
      await audioCtx.audioWorklet.addModule(volumeProcessorWorklet);

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.5;

      const streamAudioSrc = audioCtx.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioCtx, "volumeProcessor");

      workletNode.port.onmessage = this.detectUserSpeaking;

      // mediastreamsrc -> analyser -> processor / worklet -> destination
      streamAudioSrc.connect(analyser);
      analyser.connect(workletNode);
      workletNode.connect(audioCtx.destination);
    }
  }
});
</script>

<style lang="less" scoped>
.partyUser {
  color: @theme-grey;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  padding: 6px 13px;
  border-radius: 4px;
  height: 36px;
  cursor: pointer;
  transition: background-color 0.3s ease-out;

  &:hover {
    background-color: darken(@theme-primary-color, 2%);
  }
}

.userAvatar {
  margin-right: 8px;
  box-sizing: border-box;
}

.userSpeaking {
  .userName {
    color: @theme-white;
  }
}

.userName {
  font-size: 13px;
  font-weight: 400;
  display: flex;
  align-items: center;
}

.mic {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.userSpeakingIndicator {
  margin-right: 5px;
}

.icon {
  padding: 3px;
  border-radius: 3px;
  transition: 0.2s all ease;

  &:hover {
    background-color: @theme-primary-dark-less;
  }
}
</style>
