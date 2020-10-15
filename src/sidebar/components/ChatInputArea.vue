<template>
  <div class="chatInputContainer">
    <AppLogoButton id="sendMsgBtn" icon="ios-happy" />
    <div class="chatInputArea">
      <textarea
        :placeholder="defaultPlaceholderTxt"
        :value="value"
        @input="$emit('input', $event.target.value)"
        ref="textArea"
      ></textarea>
      <textarea
        :value="value"
        class="hidden"
        tabindex="0"
        ref="hiddenArea"
      ></textarea>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import AppLogoButton from "@/shared/AppLogoButton.vue";

// messages per ten seconds before triggering wait
const MAX_NUM_MESSAGES_PAST_TEN_SEC = 15;
// count messages duration
const COUNT_DURATION_MS = 10 * 1000;

const COOLDOWN_PERIOD_MS = 2000;

// Adapted from https://www.scottstadt.com/2019/06/03/vue-autosize-textarea.html
export default Vue.extend({
  name: "ChatInputArea",
  components: {
    AppLogoButton
  },
  props: ["value"],
  data() {
    return {
      defaultPlaceholderTxt: "Start typing your message...",
      allowUserMsg: true,
      lastTimeMsgSent: new Date(),
      numMessagesPastTenSeconds: 0,
      countingMessages: false,
      countingTimeout: -1
    };
  },
  watch: {
    allowUserMsg() {
      // by default, immediate: false, which is the behaviour we want
      const textArea = this.$refs.textArea as HTMLTextAreaElement;
      if (this.allowUserMsg) {
        textArea.placeholder = this.defaultPlaceholderTxt;
        textArea.classList.remove("warning-placeholder");
      }
    }
  },
  mounted() {
    const textArea = this.$refs.textArea as HTMLTextAreaElement;

    textArea.addEventListener("keydown", e => {
      if (e.keyCode === 13 && !e.shiftKey) {
        e.preventDefault();
        if (this.value.trim().length === 0) {
          return;
        }

        if (this.numMessagesPastTenSeconds >= MAX_NUM_MESSAGES_PAST_TEN_SEC) {
          // Reset so that this branch isnt triggered everytime after max threshold breached
          this.numMessagesPastTenSeconds = 0;

          // reset countingTimeout and countingMessages
          if (this.countingTimeout !== -1) {
            clearTimeout(this.countingTimeout);
            this.countingTimeout = -1;
            this.countingMessages = false;
          }

          // Start preventing user from sending for 2s
          this.allowUserMsg = false;
          this.lastTimeMsgSent = new Date();
          setTimeout(() => {
            this.allowUserMsg = true;
          }, COOLDOWN_PERIOD_MS);
        }

        if (this.allowUserMsg) {
          this.$emit("sendMsg");
          textArea.style.height = `28px`;
          if (this.countingMessages) {
            this.numMessagesPastTenSeconds += 1;
            console.log("Count: ", this.numMessagesPastTenSeconds);
          } else {
            // start counting
            this.countingMessages = true;
            console.log("Counting started: ");
            this.numMessagesPastTenSeconds = 1;
            this.countingTimeout = window.setTimeout(() => {
              console.log("Counting ended: ");
              this.countingMessages = false;
              this.numMessagesPastTenSeconds = 0;
            }, COUNT_DURATION_MS);
          }
        } else {
          const msLeft =
            COOLDOWN_PERIOD_MS - (+new Date() - +this.lastTimeMsgSent);
          const secondsLeft = (msLeft / 1000).toFixed(1);
          textArea.placeholder = `Messaging too quick! Wait ${secondsLeft}s...`;
          textArea.classList.add("warning-placeholder");
          this.$emit("clearMsg");
        }
      }
    });

    textArea.addEventListener("input", () => {
      this.resizeInputHeight();
    });

    // init
    this.resizeInputHeight();
  },
  methods: {
    resizeInputHeight() {
      const textArea = this.$refs.textArea as HTMLTextAreaElement;
      const hiddenArea = this.$refs.hiddenArea as HTMLTextAreaElement;
      textArea.style.height = `${hiddenArea.scrollHeight}px`;
    }
  }
});
</script>

<style lang="less" scoped>
.chatInputContainer {
  position: relative;
  display: flex;
  flex-direction: column;
}

.chatInputArea {
  position: relative;
  height: 100%;

  textarea {
    padding: 5px 35px 5px 10px;
    width: 100%;
    border: 0;
    outline: 0;
    resize: none;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: @theme-primary-brighter;
    border-radius: 5px;
    color: @theme-white-color;
    height: 0;
    max-height: 100px;
    cursor: text;

    &.hidden {
      position: absolute;
      top: 0;
      left: 0;
      max-height: 0;
      pointer-events: none;
      opacity: 0;
      margin: 0;
    }
  }
}

#sendMsgBtn {
  position: absolute;
  right: 5px;
  height: 28px;
  width: 28px;
  z-index: 2;
  color: @theme-grey-color;
  transition: all 0.4s ease-in-out;

  :hover {
    color: @theme-white-color;
    transform: scale(1.1);
  }
}

.warning-placeholder {
  &::placeholder {
    color: @theme-white-color;
  }
}
</style>
