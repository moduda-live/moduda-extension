<template>
  <div id="app">
    <AppHeader id="movens-logo" />
    <div class="hide-if-loading" v-if="!connecting">
      <Alert type="error" v-show="error">{{ error }}</Alert>
      <h1>Let's get started. 🚀</h1>
      <p>
        Please ensure that you are on a page with the video you want to watch
      </p>
      <Input
        v-model="username"
        v-if="!connecting && !error"
        autofocus
        class="mt-1em"
        :maxlength="17"
        placeholder="Enter username (optional)"
      />
      <Button
        v-if="!connecting && !error"
        @click="createParty"
        type="primary"
        size="large"
        long
        class="create-party-btn"
      >
        Create a new party
      </Button>
    </div>
    <div v-if="connecting" class="show-if-loading-wrapper">
      <Spin>
        <Icon type="ios-loading" size="40" class="demo-spin-icon-load"></Icon>
        <div>Connecting to server...</div>
      </Spin>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import AppHeader from "@/shared/AppHeader.vue";
import "tippy.js/animations/scale.css";
import { CreatePartyMessage } from "@/shared/types";

export default Vue.extend({
  name: "Popup",
  components: {
    AppHeader
  },
  mounted() {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "CONNECTED") {
        this.connecting = false;
        window.close();
      }
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

        const createPartyMessage: CreatePartyMessage = {
          type: "CREATE_PARTY",
          payload: {
            username: this.username,
            partyId: "" // create new party
          }
        };

        browser.tabs.sendMessage(currentTabId, createPartyMessage);
      } catch (err) {
        this.error = "Failed to create party. Try later!";
      }
    }
  }
});
</script>

<style lang="less" scoped>
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  color: @theme-primary-brighter;
  width: 350px;
  padding: 1.4rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  background: rgb(129, 95, 224);
  background: linear-gradient(
    174deg,
    rgba(129, 95, 224, 0.10307072829131656) 0%,
    rgba(227, 80, 54, 0.10587184873949583) 100%
  );
}

.mt-1em {
  margin-top: 1em;
}

.ivu-alert {
  display: flex;
}

#movens-logo {
  position: absolute;
  top: 10px;
  right: 10px;
}

.create-party-btn {
  margin-top: 0.3em;
  border: 0;
}

.show-if-loading-wrapper {
  height: 140px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
