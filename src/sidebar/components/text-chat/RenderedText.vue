<template>
  <span>{{ content }}</span>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "RenderedText",
  props: ["content"]
});
</script>

<style lang="less" scoped></style>
