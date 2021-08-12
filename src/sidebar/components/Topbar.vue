<template>
  <div class="topbar">
    <Icon
      id="hide-sidebar"
      class="icon--hoverable"
      :size="19"
      type="ios-log-out"
      @click="hideSidebar"
    />
    <Modal
      v-model="openLeaveConfirmModal"
      title="Leave room?"
      @on-ok="leaveRoom"
    >
      <p>Click "OK" to proceed.</p>
    </Modal>
    <CellGroup ref="menu" @on-click="handleClick">
      <Cell title="Notifications">
        <SwitchBtn
          size="small"
          :value="showToast"
          slot="extra"
          @on-change="toggleToast"
        />
      </Cell>
      <Cell title="Admin-only Controls" :disabled="!enableAdminToggle">
        <SwitchBtn
          size="small"
          :value="adminControlsOnly"
          slot="extra"
          :disabled="!enableAdminToggle"
          @on-change="toggleAdminOnlyControls"
        />
      </Cell>
      <Cell
        title="Github"
        to="https://github.com/moduda-live/moduda-extension"
        target="_blank"
      >
        <Icon slot="arrow" type="logo-github" :size="18" />
      </Cell>
      <Cell name="leave-cell" title="Disconnect" id="leave-cell"> </Cell>
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
import tippy from "tippy.js";
import "tippy.js/animations/shift-away-subtle.css";
import { mapGetters, mapMutations, mapState } from "vuex";

export default Vue.extend({
  name: "Topbar",
  methods: {
    ...mapMutations({
      setToastShow: "SET_TOAST_SHOW",
      setAdminOnlyControls: "SET_ADMIN_ONLY_CONTROLS"
    }),
    hideSidebar() {
      this.$party.parentCommunicator.hideSidebar();
    },
    toggleToast(isSwitchOn: boolean) {
      this.setToastShow(isSwitchOn);
    },
    toggleAdminOnlyControls(isSwitchOn: boolean) {
      this.setAdminOnlyControls({
        fromSelf: true,
        adminControlsOnly: isSwitchOn
      });
    },
    handleClick(name: string | number) {
      if (name === "leave-cell") {
        this.showSettingsTippy[0].hide();
        this.openLeaveConfirmModal = true;
      }
    },
    leaveRoom() {
      this.$party.leaveParty();
    }
  },
  mounted() {
    this.showSettingsTippy = tippy("#show-settings", {
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
      showSettingsTippy: (null as unknown) as any,
      enableAdminToggle: false,
      primaryWhiteColor: "#c9c9c9",
      openLeaveConfirmModal: false
    };
  },
  watch: {
    myUser(updatedUser) {
      if (updatedUser) {
        this.enableAdminToggle = updatedUser.isAdmin;
      }
    },
    adminControlsOnly(val) {
      console.log("New value from vuex:", val);
    }
  },
  computed: {
    ...mapState(["showToast", "adminControlsOnly"]),
    ...mapGetters(["myUser"])
  }
});
</script>

<style lang="less">
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

#leave-cell div.ivu-cell-title {
  color: @theme-orange;
}

.tippy-box[data-theme~="settings"] {
  background-color: darken(@theme-primary-dark-medium, 1%);
  box-shadow: 0px 4px 10px -5px rgba(0, 0, 0, 1);
  border-radius: 5px;
  padding: 7px;

  .tippy-content {
    .ivu-cell-group {
      width: 190px;
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

    .ivu-cell-disabled {
      color: @theme-grey;
      &:hover,
      &:active {
        background-color: initial;
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
