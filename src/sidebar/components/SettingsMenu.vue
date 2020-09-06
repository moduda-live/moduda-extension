<template>
  <Popper>
    <TransparentLogoButton
      :color="primaryWhiteColor"
      icon="ios-options-outline"
      :size="18"
    />

    <div slot="tooltip" class="settings-menu">
      <CellGroup>
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
    </div>
  </Popper>
</template>

<script lang="ts">
import Vue from "vue";
import Popper from "@/shared/Popper.vue";
import TransparentLogoButton from "@/shared/TransparentLogoButton.vue";

export default Vue.extend({
  name: "SettingsMenu",
  components: {
    Popper,
    TransparentLogoButton
  },
  data() {
    return {
      showNotifications: false,
      primaryWhiteColor: "#c9c9c9"
    };
  }
});
</script>

<style lang="less" scoped>
@menu-background: #181b21;
@primary-white: #c9c9c9;
@switch-color: #e35036;
@menu-item-hover: #2c3e50;

.settings-menu {
  background-color: @menu-background;
  border-radius: 5px;
  padding: 7px;
  width: 170px;

  .ivu-cell {
    border-radius: 5px;
    color: @primary-white;
    padding: 7px 12px;

    &:hover,
    &:active {
      background-color: @menu-item-hover;
    }
  }
}

.ivu-switch-checked {
  border-color: @switch-color;
  background-color: @switch-color;
}
</style>
