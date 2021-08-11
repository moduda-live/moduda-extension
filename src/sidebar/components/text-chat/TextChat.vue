<template>
  <div class="text-chat-section">
    <ChatMessageArea />
    <ChatInputArea v-model="message" @sendMsg="sendMessage" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapGetters, mapActions } from "vuex";
import ChatMessageArea from "./ChatMessageArea.vue";
import ChatInputArea from "./ChatInputArea.vue";
import { Message } from "../../store/chat/types";

export default Vue.extend({
  name: "TextChat",
  components: {
    ChatMessageArea,
    ChatInputArea
  },
  data() {
    return {
      message: ""
    };
  },
  computed: {
    ...mapGetters(["myUser"])
  },
  methods: {
    ...mapActions("chat", ["addMessage"]),
    sendMessage() {
      if (!this.message) {
        return;
      }

      const trimmedMsg = this.message.trim();
      const messageObj: Message = {
        isSenderAdmin: this.myUser.isAdmin,
        senderUsername: this.myUser.username,
        senderId: this.myUser.id,
        content: trimmedMsg
      };

      this.addMessage(messageObj);

      this.message = "";
    }
  }
});
</script>

<style lang="less" scoped>
.text-chat-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
