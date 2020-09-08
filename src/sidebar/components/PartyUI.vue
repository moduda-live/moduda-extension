<template>
  <div class="party">
    <Topbar />
    <div class="divider" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Topbar from "@/sidebar/components/Topbar.vue";

export default Vue.extend({
  name: "PartyUI",
  components: {
    Topbar
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
