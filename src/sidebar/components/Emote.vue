<template>
  <div ref="emote">
    <img class="emote-img" :src="imageUrl" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import tippy, { Instance, Props } from "tippy.js";
import { EmoteInfo } from "./TwitchEmotePicker.vue";

declare module "vue/types/vue" {
  interface Vue {
    tippyInstance: Instance<Props>;
  }
}

export default Vue.extend({
  name: "Emote",
  props: {
    emoteInfo: {
      type: Object as () => EmoteInfo,
      required: true
    }
  },
  computed: {
    imageUrl(): string {
      return `https://cdn.betterttv.net/emote/${this.emoteInfo.id}/1x`;
    }
  },
  mounted() {
    this.tippyInstance = tippy(this.$refs.emote as HTMLDivElement, {
      content: this.emoteInfo.name,
      offset: [0, 1],
      theme: "dark",
      placement: "top",
      animation: "shift-away-subtle",
      appendTo: "parent"
    });
  }
});
</script>

<style lang="less" scoped></style>
