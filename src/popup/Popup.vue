<template>
  <div id="app">
    <AppHeader id="moduda-logo" />
    <div class="join-wrapper" v-if="this.sessionState === SessionState.ERROR">
      <h1>Oops. 𓀒 𓀓</h1>
      <ErrorView :errorType="errorType" />
      <Button @click="createParty" type="primary" size="large" long>
        Click here to retry
      </Button>
    </div>
    <div class="join-wrapper" v-show="sessionState === SessionState.DEFAULT">
      <h1>Let's get started. 🚀</h1>
      <p>
        Please ensure that you are on a page with the video you want to watch.
      </p>
      <Input
        style="margin-top: 1em;"
        v-model="username"
        autofocus
        :maxlength="15"
        placeholder="Enter username (optional)"
      />
      <Button @click="createParty" type="primary" size="large" long>
        Create a new room
      </Button>
    </div>
    <div
      v-show="sessionState === SessionState.FINDING_VID"
      class="join-loading-wrapper"
    >
      <Spin>
        <Icon type="ios-loading" size="40" class="demo-spin-icon-load"></Icon>
        <div>Finding video on the page...</div>
      </Spin>
    </div>
    <div
      v-show="sessionState === SessionState.CONNECTING"
      class="join-loading-wrapper"
    >
      <Spin>
        <Icon type="ios-loading" size="40" class="demo-spin-icon-load"></Icon>
        <div>Connecting to server...</div>
      </Spin>
    </div>
    <div
      v-show="sessionState === SessionState.CONNECTED"
      class="join-wrapper post-join-wrapper"
    >
      <h1 style="font-weight: 400;">
        Hello, <b>{{ username }}</b> 👋
      </h1>
      <p class="current-party-info">
        You are currently connected to a room with ID:
        <span class="blue">
          <b> {{ partyId }}</b>
        </span>
        {{ !isMovensActiveInThisTab ? " on another tab" : "" }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import AppHeader from "@/shared/AppHeader.vue";
import "tippy.js/animations/scale.css";
import { CreatePartyMessage } from "@/shared/types";
import ErrorView from "./ErrorView.vue";

enum SessionState {
  DEFAULT, // state before anything happens
  FINDING_VID,
  CONNECTING,
  CONNECTED,
  ERROR
}

export enum ErrorType {
  FAILED_VID,
  UNKNOWN,
  FAILED_CONNECT,
  NONE // indicates, well, no error
}

export default Vue.extend({
  name: "Popup",
  components: {
    AppHeader,
    ErrorView
  },
  mounted() {
    // get initial state from browser's storage
    browser.storage.local
      .get(["modudaCurrentState"])
      .then(res => {
        const currentMovensState = res.modudaCurrentState; // current state of the extension
        if (currentMovensState) {
          this.partyId = currentMovensState.currentPartyId;
          this.videolink = currentMovensState.videolink;
          this.username = currentMovensState.username;

          if (this.partyId) {
            // if partyId === "", extension is not currently running
            this.sessionState = SessionState.CONNECTED;
          }
          return currentMovensState.tabId;
        }
      })
      .then(modudaRunningTabId => {
        browser.tabs
          .query({ active: true, lastFocusedWindow: true })
          .then(tabs => {
            if (!tabs || !tabs.length || !tabs[0]) {
              this.isMovensActiveInThisTab = false;
              return;
            }
            this.isMovensActiveInThisTab = tabs[0].id === modudaRunningTabId;
          });
      });

    // subscribe to updates
    browser.storage.onChanged.addListener((changes, namespace) => {
      for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
        const newPartyId = newValue?.currentPartyId;

        if (key === "modudaCurrentState" && newPartyId) {
          // a setting has changed
          this.partyId = newValue.currentPartyId;

          this.videolink = newValue.videolink;
          this.username = newValue.username;
          this.sessionState = SessionState.CONNECTED;
          this.isMovensActiveInThisTab = true;
        }
      }
    });

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!message.type) return;

      switch (message.type) {
        case "FOUND_VID": {
          this.sessionState = SessionState.CONNECTING;
          break;
        }
        case "FAILED_VID": {
          this.errorType = ErrorType.FAILED_VID;
          this.sessionState = SessionState.ERROR;
          break;
        }
        case "FAILED_CONNECT": {
          this.errorType = ErrorType.FAILED_CONNECT;
          this.sessionState = SessionState.ERROR;
          console.log("this.errorType :>> ", this.errorType);
          break;
        }
        default: {
          // ignore, probably for background script, since popups and background scripts run on the same env
        }
      }
    });
  },
  data() {
    return {
      SessionState,
      ErrorType,
      sessionState: SessionState.DEFAULT,
      videolink: null,
      partyId: null,
      username: "",
      errorType: ErrorType.NONE,
      isMovensActiveInThisTab: false
    };
  },
  methods: {
    async createParty() {
      this.sessionState = SessionState.FINDING_VID;

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
        this.errorType = ErrorType.UNKNOWN;
        this.sessionState = SessionState.ERROR;
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
  padding: 1.7rem 1.4rem 1.4rem;
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

  h1 {
    margin-bottom: 0.1em;
  }
}

.ivu-alert {
  display: flex;
}

#moduda-logo {
  position: absolute;
  top: 10px;
  right: 10px;
}

.join-wrapper {
  line-height: 1.5;

  button {
    margin-top: 0.5em;
    border: 0;
  }
}

.join-loading-wrapper {
  height: 140px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.current-party-info {
  padding-top: 0.6rem;

  span {
    color: #4467e6;
  }
}
</style>
