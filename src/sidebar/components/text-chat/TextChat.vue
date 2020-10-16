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
    ...mapActions(["addMessage"]),
    sendMessage() {
      if (!this.message) {
        return;
      }

      const trimmedMsg = this.message.trim();
      console.log("send message: ", trimmedMsg);
      const messageObj = {
        isSenderAdmin: this.myUser.isAdmin,
        senderUsername: this.myUser.username,
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
