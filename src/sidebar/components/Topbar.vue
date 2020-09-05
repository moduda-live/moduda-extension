<template>
  <div class="topbar">
    <Header :color="primaryWhiteColor" />
    <TransparentLogoButton
      @click="triggerSettingsMenu"
      :color="primaryWhiteColor"
      icon="ios-options-outline"
      :size="18"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Header from "@/shared/Header.vue";
import TransparentLogoButton from "@/shared/TransparentLogoButton.vue";

export default Vue.extend({
  name: "Topbar",
  components: {
    Header,
    TransparentLogoButton
  },
  data() {
    return {
      primaryWhiteColor: "#c9c9c9",
      showSettingsMenu: false
    };
  },
  methods: {
    triggerSettingsMenu() {
      this.showSettingsMenu = true;
    }
  }
});
</script>

<style lang="less" scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
