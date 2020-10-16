<template>
  <div class="chat-area">
    <div class="chat-welcome">
      Welcome to the room!
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
.chat-area {
  flex: 1;
  margin: 15px 0 10px 0;
  border-radius: 5px;
  padding: 12px 15px;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: @theme-primary-dark-less;
}

.chat-welcome {
  margin-bottom: 6px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>
