<template>
  <div class="topbar">
    <Icon
      id="hide-sidebar"
      class="icon--hoverable"
      :size="19"
      type="ios-log-out"
      @click="hideSidebar"
    />
    <AppHeader :color="primaryWhiteColor" />
    <CellGroup ref="menu">
      <Cell title="Notifications">
        <SwitchBtn
          size="small"
          :value="showToast"
          slot="extra"
          @on-change="toggleToast"
        />
      </Cell>
      <Cell
        title="Github"
        to="https://github.com/movens-app/movens-extension"
        target="_blank"
      >
        <Icon slot="arrow" type="logo-github" :size="18" />
      </Cell>
    </CellGroup>
    <Icon
      id="show-settings"
      class="icon--hoverable"
      :size="19"
      type="ios-options-outline"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import AppHeader from "@/shared/AppHeader.vue";
import tippy from "tippy.js";
import "tippy.js/animations/shift-away-subtle.css";
import { mapMutations, mapState } from "vuex";

export default Vue.extend({
  name: "Topbar",
  components: {
    AppHeader
  },
  methods: {
    ...mapMutations({ setToastShow: "SET_TOAST_SHOW" }),
    hideSidebar() {
      this.$party.parentCommunicator.hideSidebar();
    },
    toggleToast(isSwitchOn: boolean) {
      this.setToastShow(isSwitchOn);
    }
  },
  mounted() {
    tippy("#show-settings", {
      content: (this.$refs.menu as Vue).$el,
      placement: "bottom-end",
      theme: "settings",
      animation: "shift-away-subtle",
      maxWidth: 300,
      interactive: true,
      offset: [0, 3],
      trigger: "click"
    });

    tippy("#hide-sidebar", {
      content: "Hide sidebar",
      placement: "bottom-start",
      animation: "shift-away-subtle",
      offset: [0, 5],
      theme: "dark"
    });
  },
  data() {
    return {
      primaryWhiteColor: "#c9c9c9"
    };
  },
  computed: {
    ...mapState(["showToast"])
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

      .ivu-cell-title {
        font-size: 13px;
      }
    }

    .ivu-switch-checked {
      border-color: @theme-orange;
      background-color: @theme-orange;
    }
  }
}

.icon--hoverable {
  padding: 3px;
  border-radius: 3px;
  transition: 0.2s all ease;
  cursor: pointer;
  color: @theme-grey;

  &:hover {
    background-color: @theme-primary-brighter;
    color: @theme-white;
  }
}
</style>
