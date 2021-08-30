<template functional>
  <div class="chat-emote__container">
    <img class="chat-emote__image" :src="props.content" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "RenderedTextEmote"
});
</script>

<style lang="less" scoped>
.chat-emote__container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 1.5rem;
  width: 1.5rem;
  vertical-align: middle;
}
</style>
