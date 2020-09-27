<template>
  <div id="popup">
    <AppHeader />
    <div class="popup-guide">
      Please ensure that you are on a page with the video you want to watch
    </div>
    <Alert type="error" v-show="error">{{ error }}</Alert>
    <Input
      v-model="username"
      v-if="!connecting && !error"
      style="width: 200px; margin-bottom: 12px;"
      autofocus
      class="username-input"
      prefix="ios-contact"
      maxlength="17"
      placeholder="Enter username to join with"
    />
    <Button v-if="!connecting && !error" @click="createParty"
      >Create a new party!</Button
    >
    <Spin v-if="connecting">
      <Icon type="ios-loading" size="18" class="demo-spin-icon-load"></Icon>
      <div>Connecting to server...</div>
    </Spin>
    <AppLogoButton id="info-btn" icon="ios-information-circle-outline" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import AppHeader from "@/shared/AppHeader.vue";
import AppLogoButton from "@/shared/AppLogoButton.vue";
import tippy from "tippy.js";
import "tippy.js/animations/scale.css";

export default Vue.extend({
  name: "Popup",
  components: {
    AppHeader,
    AppLogoButton
  },
  mounted() {
    tippy("#info-btn", {
      content:
        "If you are the host, click the button to get started! Otherwise, join directly using an invite link.",
      placement: "left-end",
      animation: "scale",
      maxWidth: 200,
      theme: "info"
    });
  },
  data() {
    return {
      connecting: false,
      username: "",
      error: ""
    };
  },
  methods: {
    async createParty() {
      this.connecting = true;

      try {
        const tabs = await browser.tabs.query({
          active: true,
          currentWindow: true
        });

        const currentTabId = tabs[0].id as number;

        await browser.tabs.executeScript({
          file: "js/content-script.js"
        });

        browser.tabs.sendMessage(currentTabId, {
          username: this.username
        });
      } catch (err) {
        this.error = "Failed to create party. Try later!";
      }
    }
  }
});
</script>

<style lang="less">
@light-border-color: #cccecf;

html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#popup {
  border: 1px solid @light-border-color;
  color: @theme-primary-color;
  width: 360px;
  margin: 5px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.popup-guide {
  width: 230px;
  margin-bottom: 15px;
  text-align: center;
}

.ivu-alert {
  display: flex;
}

#info-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

.tippy-box[data-theme~="info"] {
  background-color: @theme-primary-color;
  color: @theme-white-color;
  padding: 6px;
  border-radius: 2px;
  font-size: 11px;
  display: flex;
}
</style>
