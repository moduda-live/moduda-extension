<template>
  <div class="textChat">
    <AppLogoButton id="sendMsgBtn" icon="ios-happy" />
    <ChatInputArea v-model="message" @sendMsg="sendMessage" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import AppLogoButton from "@/shared/AppLogoButton.vue";
import ChatInputArea from "./ChatInputArea.vue";

export default Vue.extend({
  name: "TextChat",
  components: {
    AppLogoButton,
    ChatInputArea
  },
  data() {
    return {
      message: ""
    };
  },
  methods: {
    sendMessage() {
      if (!this.message) {
        return;
      }
      console.log("send message: ", this.message);
      this.message = "";
    }
  }
});
</script>

<style lang="less" scoped>
.textChat {
  margin-top: auto;
  position: relative;
  display: flex;
  flex-direction: column;
}

#sendMsgBtn {
  position: absolute;
  right: 5px;
  height: 28px;
  width: 28px;
  z-index: 2;
  color: @theme-grey-color;
  transition: all 0.4s ease-in-out;

  :hover {
    color: @theme-white-color;
    transform: scale(1.1);
  }
}
</style>
