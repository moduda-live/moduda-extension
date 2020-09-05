<template>
  <div class="party">
    <Topbar />
    <div class="divider" />
    <SettingsMenu />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Topbar from "@/sidebar/components/Topbar.vue";
import SettingsMenu from "@/sidebar/components/SettingsMenu.vue";

export default Vue.extend({
  name: "PartyUI",
  components: {
    Topbar,
    SettingsMenu
  },
  data() {
    return {};
  }
});
</script>

<style lang="less" scoped>
@muted-dark: #2c3e50;

.divider {
  height: 1px;
  width: 100%;
  background-color: @muted-dark;
}
</style>
