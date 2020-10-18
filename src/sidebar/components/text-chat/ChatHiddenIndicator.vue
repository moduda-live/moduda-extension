<template functional>
  <div class="chat-hidden">
    <Icon size="35" type="md-eye-off" class="chat-hidden__icon" />
    <div class="chat-hidden__header">Chat hidden</div>
    <Button @click="parent.$store.commit('SHOW_CHAT')" ghost size="small"
      >Show again</Button
    >
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ChatHiddenIndicator.vue"
});
</script>

<style lang="less" scoped>
.chat-hidden {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: @theme-grey;

  &__icon {
    margin-bottom: 3px;
  }

  &__header {
    margin-bottom: 10px;
    font-size: 1.2em;
  }
}
</style>
