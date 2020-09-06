<template>
  <div id="popup">
    <Header />
    <div class="popup-guide">
      Please ensure that you are on a page with the video you want to watch
    </div>
    <Alert type="error" show-icon v-if="noVideo">
      <Icon type="ios-warning-outline" slot="icon"></Icon>No video detected. Try
      in another page!
    </Alert>
    <Button v-if="!connecting && !noVideo" @click="createParty"
      >Create a new party!</Button
    >
    <Spin v-if="connecting">
      <Icon type="ios-loading" size="18" class="demo-spin-icon-load"></Icon>
      <div>Connecting to server...</div>
    </Spin>
    <TransparentHeaderButton
      id="infoBtn"
      class="popup-info-btn"
      icon="ios-information-circle-outline"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Header from "@/shared/Header.vue";
import TransparentHeaderButton from "@/shared/TransparentLogoButton.vue";
import tippy from "tippy.js";
import "tippy.js/animations/scale.css";

export default Vue.extend({
  name: "Popup",
  components: {
    Header,
    TransparentHeaderButton
  },
  mounted() {
    tippy("#infoBtn", {
      content:
        "If you are the host, click the button to get started! Otherwise, join directly using an invite link.",
      placement: "left-end",
      animation: "scale",
      maxWidth: 200,
      theme: "info"
    });
  },
  data() {
    return {
      connecting: false,
      noVideo: false
    };
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

.popup-guide {
  width: 230px;
  margin-bottom: 15px;
  text-align: center;
}

.ivu-alert {
  display: flex;
}

.popup-info-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

.tippy-box[data-theme~="info"] {
  background-color: @navy;
  color: #fff;
  padding: 6px;
  border-radius: 2px;
  font-size: 11px;
  display: flex;
}
</style>
