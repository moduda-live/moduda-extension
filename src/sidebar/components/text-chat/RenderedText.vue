<template functional>
  <span>{{ props.content }}</span>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "RenderedText"
});
</script>

<style lang="less" scoped></style>
