<template>
  <div class="chat-area__container">
    <ChatOptionsBar @hideChat="hideChatAndSaveScroll" />
    <div class="chat-area" ref="chatArea">
      <div v-show="chatHidden" class="chat-area__content--hidden">
        <ChatHiddenIndicator />
      </div>
      <div class="chat-welcome" v-show="!chatHidden">
        Welcome to the room!
      </div>
      <ChatMessage
        v-show="!chatHidden"
        v-for="(message, index) in chatMessages"
        :key="index"
        :message="message"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { createNamespacedHelpers } from "vuex";
import ChatMessage from "./ChatMessage.vue";
import ChatOptionsBar from "./ChatOptionsBar.vue";
import ChatHiddenIndicator from "./ChatHiddenIndicator.vue";

const { mapState, mapMutations } = createNamespacedHelpers("chat");

// # of pixels from the bottom of the .chat-area div for chat area to auto scroll to bottom upon new messages (if anchor enabled)
const OFFSET_FROM_BOTTOM_TO_TRIGGER_ANCHOR = 80;

export default Vue.extend({
  name: "ChatMessageArea",
  components: {
    ChatMessage,
    ChatOptionsBar,
    ChatHiddenIndicator
  },
  computed: {
    ...mapState([
      "chatMessages",
      "chatHidden",
      "chatAnchored",
      "chatScrollPosition"
    ])
  },
  watch: {
    chatMessages() {
      const chatArea = this.$refs.chatArea as HTMLDivElement;
      // only anchor chat to bottom if chatAnchored is true and user is near bottom of the chat within offset
      const userNearBottom =
        chatArea.scrollTop +
          chatArea.clientHeight +
          OFFSET_FROM_BOTTOM_TO_TRIGGER_ANCHOR >=
        chatArea.scrollHeight;
      if (this.chatAnchored && userNearBottom) {
        this.$nextTick(() => this.scrollToBottom(chatArea));
      }
    },
    chatHidden(newVal, oldVal) {
      if (!newVal && oldVal) {
        // text is being shown again, let's restore prev scrolling position
        const chatArea = this.$refs.chatArea as HTMLDivElement;
        console.log("chatScrollPosition: ", this.chatScrollPosition);
        this.$nextTick(() => (chatArea.scrollTop = this.chatScrollPosition));
      }
    }
  },
  methods: {
    ...mapMutations({
      hideChat: "HIDE_CHAT"
    }),
    scrollToBottom(el: HTMLElement) {
      el.scrollTop = el.scrollHeight;
    },
    hideChatAndSaveScroll() {
      const chatArea = this.$refs.chatArea as HTMLDivElement;
      const currentChatScrollPosition = chatArea.scrollTop;
      console.log("storing scroll pos:", currentChatScrollPosition);
      this.hideChat(currentChatScrollPosition);
    }
  }
});
</script>

<style lang="less" scoped>
.chat-area__container {
  flex: 1;
  margin: 15px 0 10px 0;
  border-radius: 5px;
  background-color: @theme-primary-dark-less;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-area {
  overflow-x: hidden;
  overflow-y: scroll;
  padding: 0px 15px 12px 15px;
  flex: 1;

  &__content--hidden {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.chat-welcome {
  margin-bottom: 6px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>
