<template>
  <div class="header" :style="{ color: color }">
    <img height="20px" width="20px" :src="logo" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "AppHeader",
  props: {
    color: {
      type: String,
      required: false
    }
  },
  data() {
    return {
      logo: browser.extension.getURL("icons/128.png")
    };
  }
});
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  margin-bottom: 2px;
  margin-left: -10px;
}
</style>
