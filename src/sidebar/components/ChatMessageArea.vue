<template>
  <div class="chatMessageContainer">
    <div class="welcomeTxt">
      <div>Welcome to the room!</div>
      <Icon type="ios-settings" :size="18" />
    </div>
    <ChatMessage
      v-for="(message, index) in chatMessages"
      :key="index"
      :message="message"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";
import ChatMessage from "./ChatMessage.vue";

export default Vue.extend({
  name: "ChatMessageArea",
  components: {
    ChatMessage
  },
  computed: {
    ...mapState(["chatMessages"])
  }
});
</script>

<style lang="less" scoped>
.chatMessageContainer {
  background-color: @theme-less-darker;
  flex: 1;
  margin: 15px 0 10px 0;
  border-radius: 5px;
  padding: 12px 15px;
  overflow-x: hidden;
  overflow-y: auto;
}

.welcomeTxt {
  margin-bottom: 6px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>
