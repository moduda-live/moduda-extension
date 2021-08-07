<template>
  <div class="sidebar">
    <SetupView v-if="serverBeforeConnect" />
    <ServerConnectionLoadIndicator v-if="serverConnecting" />
    <PartyUI v-if="serverConnected" />
  </div>
</template>

<script>
import ServerConnectionLoadIndicator from "@/sidebar/components/ServerConnectionLoadIndicator.vue";
import PartyUI from "./components/PartyUI.vue";
import SetupView from "./components/SetupView.vue";
import { mapState, mapGetters } from "vuex";

export default {
  name: "Sidebar",
  components: {
    ServerConnectionLoadIndicator,
    PartyUI,
    SetupView
  },
  computed: {
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
