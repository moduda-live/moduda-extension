<template>
  <div class="chat-options__container">
    <Icon
      size="13"
      class="chat-options__icons"
      :class="{ active: chatAnchored }"
      type="md-funnel"
      :data-tippy-content="anchorChatContent"
      ref="anchorChat"
      @click="toggleChatAnchor"
    />
    <Icon
      size="13"
      class="chat-options__icons"
      type="md-eye"
      :data-tippy-content="hideChatContent"
      ref="hideChat"
      @click="hideChat"
      v-show="!chatHidden"
    />
    <Icon
      size="13"
      class="chat-options__icons"
      type="md-eye-off"
      :data-tippy-content="showChatContent"
      ref="showChat"
      @click="showChat"
      v-show="chatHidden"
    />
    <Icon
      size="13"
      class="chat-options__icons"
      type="md-trash"
      :data-tippy-content="clearChatContent"
      ref="clearChat"
      @click="clearChat"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapMutations } from "vuex";
import tippy from "tippy.js";

declare module "vue/types/vue" {
  interface Vue {
    anchorChatContent: string;
    hideChatContent: string;
    showChatContent: string;
    clearChatContent: string;
  }
}

export default Vue.extend({
  name: "ChatOptionsBar",
  created() {
    this.anchorChatContent = "Anchor chat to bottom";
    this.hideChatContent = "Hide chat";
    this.showChatContent = "Show chat";
    this.clearChatContent = "Clear chat";
  },
  computed: {
    ...mapState(["chatHidden", "chatAnchored"])
  },
  mounted() {
    tippy(".chat-options__icons", {
      theme: "dark",
      animation: "shift-away-subtle",
      offset: [0, 1],
      onShow: instance => {
        if (
          this.chatAnchored &&
          (instance.reference as HTMLElement).dataset.tippyContent ===
            this.anchorChatContent
        ) {
          return false;
        }
      },
      content: reference =>
        (reference as HTMLElement).dataset.tippyContent ?? "No content"
    });
  },
  methods: {
    ...mapMutations({
      showChat: "SHOW_CHAT",
      hideChat: "HIDE_CHAT",
      clearChat: "CLEAR_CHAT",
      activateAnchor: "ACTIVATE_CHAT_ANCHOR",
      deactivateAnchor: "DEACTIVATE_CHAT_ANCHOR"
    }),
    toggleChatAnchor() {
      if (this.chatAnchored) {
        this.deactivateAnchor();
      } else {
        this.activateAnchor();
      }
    }
  }
});
</script>

<style lang="less" scoped>
.chat-options__container {
  display: flex;
  justify-content: flex-end;
  // background-color: darken(@theme-primary-dark-less, 2%);
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  flex: 0 0 17px;
  color: @theme-white;
  padding: 5px 10px 5px 15px;
}

.chat-options__icons {
  padding: 3px;
  border-radius: 3px;
  transition: 0.2s all ease;
  cursor: pointer;
  color: @theme-grey;
  margin-left: 3px;
}

.chat-options__icons.active,
.chat-options__icons:hover {
  background-color: @theme-primary-brighter;
  color: @theme-white;
}
</style>
