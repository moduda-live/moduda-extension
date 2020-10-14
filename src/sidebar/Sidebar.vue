<template>
  <div class="sidebar">
    <ServerConnectionLoadIndicator v-if="serverConnecting" />
    <PartyUI v-if="serverConnected" />
    <div v-if="serverDisconnected" class="serverConnectError">
      <Icon type="md-warning" />
      <div class="connectErrorText">
        Could not connect to server. Try again later.
      </div>
    </div>
  </div>
</template>

<script>
import ServerConnectionLoadIndicator from "@/sidebar/components/ServerConnectionLoadIndicator.vue";
import PartyUI from "@/sidebar/components/PartyUI.vue";
import { mapGetters } from "vuex";

export default {
  name: "Sidebar",
  components: {
    ServerConnectionLoadIndicator,
    PartyUI
  },
  computed: {
    ...mapGetters(["serverConnecting", "serverConnected", "serverDisconnected"])
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
        background-color: @theme-darker-primary-color;
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

.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: @theme-primary-color;
  overflow: hidden;
}

.serverConnectError {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #fff;
  font-size: 25px;
  max-width: 200px;

  .connectErrorText {
    margin-top: 5px;
    font-size: 15px;
  }
}
</style>
