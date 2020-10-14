<template>
  <div class="chatInputArea">
    <textarea
      placeholder="Your message"
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
</template>

<script lang="ts">
import Vue from "vue";

// Adapted from https://www.scottstadt.com/2019/06/03/vue-autosize-textarea.html
export default Vue.extend({
  name: "ChatInputArea",
  props: ["value"],
  mounted() {
    const textArea = this.$refs.textArea as HTMLTextAreaElement;

    textArea.addEventListener("keydown", e => {
      if (e.keyCode === 13 && !e.shiftKey) {
        e.preventDefault();
        this.$emit("sendMsg");
        textArea.style.height = `28px`;
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
</style>
