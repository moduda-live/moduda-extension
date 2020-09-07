<template>
  <Button class="icon-btn" shape="circle" :icon="icon" :style="cssProps" />
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "AppLogoButton",
  props: {
    color: {
      type: String,
      required: false
    },
    hoverColor: {
      type: String,
      required: false
    },
    icon: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      default: 20
    }
  },
  computed: {
    cssProps() {
      return {
        "--icon-size": this.size + "px",
        "--icon-color": this.color,
        "--icon-hover-color": this.hoverColor
      };
    }
  }
});
</script>

<style scoped lang="less">
.icon-btn {
  border: none !important;
  color: var(--icon-color);
  font-size: var(--icon-size) !important;
  background-color: transparent !important;

  &:active,
  &:focus {
    box-shadow: none !important;
  }
}
</style>
