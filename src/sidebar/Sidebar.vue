<template>
  <div class="sidebar">
    <ServerConnectionLoadIndicator v-if="serverConnecting" />
    <PartyUI v-if="!serverConnecting" />
  </div>
</template>

<script>
import ServerConnectionLoadIndicator from "@/sidebar/components/ServerConnectionLoadIndicator.vue";
import PartyUI from "@/sidebar/components/PartyUI.vue";

export default {
  name: "Sidebar",
  components: {
    ServerConnectionLoadIndicator,
    PartyUI
  },
  data() {
    return {
      serverConnecting: false
    };
  }
};
</script>

<style lang="less">
@primary-dark: #242c34;

html,
body {
  height: 100%;
  width: 100%;
  border: 0px;
  margin: 0px;
}

.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: @primary-dark;
}
</style>
