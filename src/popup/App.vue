<template>
  <div id="popup">
    <div class="popup-header">
      <Icon type="ios-ionitron-outline" size="24" />
      <h1 style="margin-left: 5px">movens</h1>
    </div>
    <div class="popup-guide">Please ensure that you are on a page with the video you want to watch</div>
    <Alert type="error" show-icon v-if="noVideo">
      <Icon type="ios-warning-outline" slot="icon"></Icon>No video detected. Try
      in another page!
    </Alert>
    <Button v-if="!connecting && !noVideo" @click="createParty">Create a new party!</Button>
    <Spin v-if="connecting">
      <Icon type="ios-loading" size="18" class="demo-spin-icon-load"></Icon>
      <div>Connecting to server...</div>
    </Spin>
    <Button
      ref="icon"
      class="info-icn"
      type="text"
      shape="circle"
      icon="ios-information-circle-outline"
    />
    <div class="tooltip" ref="tooltip">
      If you are the host, click the button to get started! Otherwise, join
      directly using an invite link.
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { createPopper } from "@popperjs/core";

export default Vue.extend({
  name: "App",
  data() {
    return {
      connecting: false,
      noVideo: false
    };
  },
  mounted() {
    this.registerTooltip();
  },
  methods: {
    async checkForVideo() {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true
      });

      const res = await browser.tabs.executeScript(tabs[0].id as number, {
        code: `document.querySelectorAll("video").length`
      });
      console.log("response: ", res);

      if (res === undefined) {
        return false;
      }

      const numOfVideos: number | null = res[0];
      return !!numOfVideos;
    },
    async createParty() {
      const hasVideo = await this.checkForVideo();

      if (hasVideo) {
        this.connecting = true;
        await browser.tabs.executeScript({
          file: "js/content-script.js"
        });
      } else {
        this.noVideo = true;
      }
    },
    registerTooltip() {
      const iconBtn = (this.$refs.icon as Vue).$el;
      const tooltip = this.$refs.tooltip as HTMLElement;

      createPopper(iconBtn, tooltip, {
        placement: "left-start"
      });

      function show() {
        tooltip.setAttribute("data-show", "");
      }

      function hide() {
        tooltip.removeAttribute("data-show");
      }

      const showEvents = ["mouseenter", "focus"];
      const hideEvents = ["mouseleave", "blur"];

      showEvents.forEach(event => {
        iconBtn.addEventListener(event, show);
      });

      hideEvents.forEach(event => {
        iconBtn.addEventListener(event, hide);
      });
    }
  }
});
</script>

<style lang="less">
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@navy: #2c3e50;

#popup {
  border: 1px solid #cccecf;
  color: @navy;
  width: 360px;
  margin: 5px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.popup {
  &-header {
    display: flex;
    align-items: center;
    margin-bottom: 2px;
  }

  &-guide {
    width: 230px;
    margin-bottom: 15px;
    text-align: center;
  }
}

.info-icn {
  position: absolute;
  top: 10px;
  right: 10px;

  &:active,
  &:focus {
    box-shadow: none !important;
  }

  .ivu-icon {
    font-size: 20px !important;
  }
}

.tooltip {
  width: 200px;
  color: #fff;
  background-color: @navy;
  opacity: 0.95;
  padding: 6px;
  border-radius: 2px;
  display: none;
  font-size: 11px;
}

.tooltip[data-show] {
  display: flex;
}

.ivu-alert {
  display: flex;
}
</style>
