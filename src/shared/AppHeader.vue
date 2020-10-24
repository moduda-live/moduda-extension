<template>
  <div class="header" :style="{ color: color }">
    <Icon type="ios-ionitron-outline" size="24" />
    <h1 style="margin-left: 5px; margin-bottom: 2px;">movens</h1>
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
