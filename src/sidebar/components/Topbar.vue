<template>
  <div class="topbar">
    <Header :color="primaryWhiteColor" />
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
    <TransparentLogoButton
      id="settingsBtn"
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
import tippy from "tippy.js";
import "tippy.js/animations/shift-away-subtle.css";

export default Vue.extend({
  name: "Topbar",
  components: {
    Header,
    TransparentLogoButton
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
@menu-background: #181b21;
@primary-white: #c9c9c9;
@switch-color: #e35036;
@menu-item-hover: #2c3e50;

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tippy-box[data-theme~="settings"] {
  background-color: @menu-background;
  border-radius: 5px;
  padding: 7px;

  .tippy-content {
    .ivu-cell-group {
      width: 150px;
    }

    .ivu-cell {
      border-radius: 5px;
      color: @primary-white;
      padding: 6px 10px;

      &:hover,
      &:active {
        background-color: @menu-item-hover;
      }
    }

    .ivu-switch-checked {
      border-color: @switch-color;
      background-color: @switch-color;
    }
  }
}
</style>
