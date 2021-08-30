<template>
  <div class="input-container">
    <div class="chat-side">
      <TwitchEmotePicker ref="emotePicker" @emote-clicked="onEmoteClicked" />
      <AppLogoButton
        ref="emoteBtn"
        id="emote-btn"
        icon="ios-happy"
        :size="19"
      />
      <div class="char-count" v-show="showCharCount">
        {{ `${value.length}/1k` }}
      </div>
    </div>
    <div class="input-area">
      <textarea
        :maxlength="MAX_CHAR_COUNT"
        :placeholder="defaultPlaceholderTxt"
        :value="value"
        @input="$emit('input', $event.target.value)"
        ref="textArea"
      ></textarea>
      <textarea
        :maxlength="MAX_CHAR_COUNT"
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
import TwitchEmotePicker from "./TwitchEmotePicker.vue";
import tippy from "tippy.js";
import "tippy.js/animations/shift-away-subtle.css";

// messages per ten seconds before triggering wait
const MAX_NUM_MESSAGES_PAST_TEN_SEC = 15;
// count messages duration
const COUNT_DURATION_MS = 10 * 1000;

const COOLDOWN_PERIOD_MS = 2000;
const MAX_CHAR_COUNT = 1000;
const CHAR_COUNT_DIFF_THRESHOLD = 100;

// Adapted from https://www.scottstadt.com/2019/06/03/vue-autosize-textarea.html
export default Vue.extend({
  name: "ChatInputArea",
  components: {
    AppLogoButton,
    TwitchEmotePicker
  },
  props: ["value"],
  data() {
    return {
      defaultPlaceholderTxt: "Start typing your message...",
      allowUserMsg: true,
      lastTimeMsgSent: new Date(),
      numMessagesPastTenSeconds: 0,
      countingMessages: false,
      countingTimeout: -1,
      showCharCount: false,
      MAX_CHAR_COUNT
    };
  },
  watch: {
    allowUserMsg() {
      // by default, immediate: false, which is the behaviour we want
      const textArea = this.$refs.textArea as HTMLTextAreaElement;
      if (this.allowUserMsg) {
        textArea.placeholder = this.defaultPlaceholderTxt;
        textArea.classList.remove("js-warning-placeholder");
      }
    },
    value() {
      if (
        this.MAX_CHAR_COUNT - this.value.length <=
        CHAR_COUNT_DIFF_THRESHOLD
      ) {
        this.showCharCount = true;
      } else {
        this.showCharCount = false;
      }
    }
  },
  mounted() {
    this.setUpEmotePicker();
    const textArea = this.$refs.textArea as HTMLTextAreaElement;
    textArea.addEventListener("keydown", this.handleKeydown);
    textArea.addEventListener("input", () => {
      this.resizeInputHeight();
      this.scrollToBottom(textArea);
    });

    // init
    this.resizeInputHeight();
  },
  methods: {
    onEmoteClicked(emoteName: string) {
      const textArea = this.$refs.textArea as HTMLTextAreaElement;
      const hiddenArea = this.$refs.hiddenArea as HTMLTextAreaElement;
      const textAreaIsEmpty = this.value.length === 0;

      const textToAdd = textAreaIsEmpty ? `:${emoteName}:` : ` :${emoteName}:`;
      hiddenArea.value += textToAdd;
      // manually sync since we are not triggering emit on input
      this.$emit("input", this.value + textToAdd);

      // manually trigger resize and scroll
      this.resizeInputHeight();
      this.scrollToBottom(textArea);
    },
    scrollToBottom(textArea: HTMLTextAreaElement) {
      textArea.scrollTop = textArea.scrollHeight;
    },
    setUpEmotePicker() {
      const emoteBtn = (this.$refs.emoteBtn as Vue).$el;
      tippy("#emote-btn", {
        content: (this.$refs.emotePicker as Vue).$el,
        placement: "top-end",
        appendTo: () => document.body,
        animation: "shift-away-subtle",
        interactive: true,
        offset: [0, 13],
        trigger: "click",
        onShow: () => {
          emoteBtn.classList.add("scaled-white-btn");
        },
        onHide: () => {
          emoteBtn.classList.remove("scaled-white-btn");
        }
      });
    },
    handleKeydown(e: KeyboardEvent) {
      const textArea = this.$refs.textArea as HTMLTextAreaElement;
      if (e.keyCode === 13 && !e.shiftKey) {
        e.preventDefault();
        if (textArea.value.trim().length === 0) {
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
          } else {
            // start counting
            this.countingMessages = true;
            this.numMessagesPastTenSeconds = 1;
            this.countingTimeout = window.setTimeout(() => {
              this.countingMessages = false;
              this.numMessagesPastTenSeconds = 0;
            }, COUNT_DURATION_MS);
          }
        } else {
          const msLeft =
            COOLDOWN_PERIOD_MS - (+new Date() - +this.lastTimeMsgSent);
          const secondsLeft = (msLeft / 1000).toFixed(1);
          textArea.placeholder = `Messaging too quick! Wait ${secondsLeft}s...`;
          textArea.classList.add("js-warning-placeholder");
          textArea.value = "";
        }
      }
    },
    resizeInputHeight() {
      const textArea = this.$refs.textArea as HTMLTextAreaElement;
      const hiddenArea = this.$refs.hiddenArea as HTMLTextAreaElement;
      textArea.style.height = `${hiddenArea.scrollHeight}px`;
    }
  }
});
</script>

<style lang="less" scoped>
.input-container {
  position: relative;
  display: flex;
  flex-direction: column;
}

.input-area {
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
    color: @theme-white;
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

.chat-side {
  display: flex;
  flex-direction: column;
  position: absolute;
  align-items: center;
  right: 5px;
  z-index: 2;
  width: 32px;
}

.char-count {
  font-size: 8px;
  color: @theme-orange;
}

#emote-btn {
  height: 28px;
  width: 28px;
  color: @theme-grey;
  transition: all 0.4s ease-in-out;
}

#emote-btn:hover,
.scaled-white-btn {
  color: @theme-white !important;
  transform: scale(1.1);
}

.js-warning-placeholder {
  &::placeholder {
    color: @theme-white;
  }
}
</style>
