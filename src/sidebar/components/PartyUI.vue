<template>
  <div class="party">
    <Topbar />
    <div class="divider" />
    <InviteLink />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Topbar from "./Topbar.vue";
import InviteLink from "./InviteLink.vue";

export default Vue.extend({
  name: "PartyUI",
  components: {
    Topbar,
    InviteLink
  },
  data() {
    return {};
  }
});
</script>

<style lang="less" scoped>
.party {
  width: 100%;
  height: 100%;
}

.divider {
  height: 1px;
  width: 100%;
  background-color: @theme-muted-dark-color;
  margin-bottom: 10px;
}
</style>
