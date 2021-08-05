<template>
  <div class="sidebar">
    <ErrorView :message="videoNotFoundErrorMsg" v-if="videoNotFound" />
    <SetupView v-if="!videoNotFound && serverBeforeConnect" />
    <ServerConnectionLoadIndicator v-if="serverConnecting" />
    <PartyUI v-if="serverConnected" />
  </div>
</template>

<script>
import ServerConnectionLoadIndicator from "@/sidebar/components/ServerConnectionLoadIndicator.vue";
import PartyUI from "./components/PartyUI.vue";
import SetupView from "./components/SetupView.vue";
import ErrorView from "./components/ErrorView.vue";
import { mapState, mapGetters } from "vuex";

export default {
  name: "Sidebar",
  components: {
    ServerConnectionLoadIndicator,
    PartyUI,
    SetupView,
    ErrorView
  },
  created() {
    this.serverConnectErrorMsg =
      "Could not connect to server.\nTry again later.";
    this.videoNotFoundErrorMsg = "Video not found.\nTry again in another page.";
  },
  computed: {
    ...mapState(["videoNotFound"]),
    ...mapGetters([
      "serverBeforeConnect",
      "serverConnecting",
      "serverConnected",
      "serverDisconnected"
    ])
  }
};
</script>

<style lang="less">
* {
  box-sizing: border-box;
  > * {
    &::-webkit-scrollbar {
      background-color: transparent;
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: transparent;
      border-radius: 2px;
    }

    &:hover {
      &::-webkit-scrollbar-thumb {
        background-color: @theme-primary-dark;
      }
    }
  }
}

html,
body {
  height: 100%;
  width: 100%;
  border: 0px;
  margin: 0px;
  overflow: hidden;
}

// global tippy styles
.tippy-box {
  outline: none;
}

.tippy-box[data-theme~="dark"] {
  background-color: @theme-primary-dark;
  color: @theme-white;
  padding: 3px 5px;
  border-radius: 2px;
  font-size: 11px;
}

.tippy-box[data-reference-hidden],
.tippy-box[data-escaped] {
  opacity: 0;
}
</style>

<style lang="less" scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: @theme-primary-color;
  overflow: hidden;
}
</style>
