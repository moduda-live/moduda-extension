<template>
  <div class="topbar">
    <AppHeader :color="primaryWhiteColor" />
    <CellGroup ref="menu">
      <Cell title="Notifications">
        <SwitchBtn size="small" v-model="showNotifications" slot="extra" />
      </Cell>
      <Cell
        title="Github"
        to="https://github.com/movens-app/movens-extension"
        target="_blank"
      >
        <Icon slot="arrow" type="logo-github" size="18" />
      </Cell>
    </CellGroup>
    <AppLogoButton
      id="settingsBtn"
      :color="primaryWhiteColor"
      icon="ios-options-outline"
      :size="18"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import AppHeader from "@/shared/AppHeader.vue";
import AppLogoButton from "@/shared/AppLogoButton.vue";
import tippy from "tippy.js";
import "tippy.js/animations/shift-away-subtle.css";

export default Vue.extend({
  name: "Topbar",
  components: {
    AppHeader,
    AppLogoButton
  },
  mounted() {
    tippy("#settingsBtn", {
      content: (this.$refs.menu as Vue).$el,
      placement: "bottom-end",
      theme: "settings",
      animation: "shift-away-subtle",
      maxWidth: 300,
      interactive: true,
      offset: [0, -1],
      trigger: "click"
    });
  },
  data() {
    return {
      primaryWhiteColor: "#c9c9c9",
      showNotifications: false
    };
  }
});
</script>

<style lang="less">
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tippy-box[data-theme~="settings"] {
  background-color: @theme-primary-dark;
  border-radius: 5px;
  padding: 7px;

  .tippy-content {
    .ivu-cell-group {
      width: 150px;
    }

    .ivu-cell {
      border-radius: 5px;
      color: @theme-white;
      padding: 6px 10px;

      &:hover,
      &:active {
        background-color: @theme-menu-item-hover;
      }
    }

    .ivu-switch-checked {
      border-color: @theme-orange;
      background-color: @theme-orange;
    }
  }
}
</style>
