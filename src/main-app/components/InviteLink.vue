<template>
  <div>
    <div class="link-header">
      <h3>Invite link</h3>
      <Icon size="large" type="md-help-circle" id="help-icon" />
    </div>
    <div class="link-container">
      <Icon type="ios-link" class="link-icon" />
      <div ref="invitelink" class="link">{{ inviteLink }}</div>
      <button class="copy-button" @click="copyLink">
        {{ copyButtonMessage }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import tippy from "tippy.js";
import "tippy.js/animations/scale.css";

export default Vue.extend({
  name: "InviteLink",
  data() {
    return {
      copyButtonMessage: "Copy",
      copiedMsgTimeout: 0
    };
  },
  mounted() {
    tippy("#help-icon", {
      content: "Share this link with your friends!",
      placement: "right",
      animation: "scale",
      maxWidth: 240,
      theme: "dark"
    });
  },
  computed: {
    inviteLink() {
      const baseUrl = new URL("https://moduda.live/join");
      const searchParams = new URLSearchParams(window.location.search);
      const videolink = searchParams.get("videolink") ?? "";
      baseUrl.searchParams.append("redirectUrl", videolink);
      const partyId = this.$store.state.partyId;
      baseUrl.searchParams.append("partyId", partyId);
      return baseUrl.toString();
    }
  },
  methods: {
    resetCopyButtonMessage() {
      if (this.copiedMsgTimeout) {
        window.clearTimeout(this.copiedMsgTimeout);
      }
      this.copiedMsgTimeout = window.setTimeout(() => {
        this.copyButtonMessage = "Copy";
      }, 1000);
    },
    copyLink() {
      const range = document.createRange();
      range.selectNodeContents(this.$refs.invitelink as HTMLElement);
      document.getSelection()?.removeAllRanges();
      document.getSelection()?.addRange(range);
      try {
        const didCopy = document.execCommand("copy");
        if (didCopy) {
          this.copyButtonMessage = "Copied!";
        } else {
          this.copyButtonMessage = "Error!";
        }
        this.resetCopyButtonMessage();
      } catch (err) {
        this.copyButtonMessage = "Error!";
        this.resetCopyButtonMessage();
      }
      document.getSelection()?.removeAllRanges();
    }
  }
});
</script>

<style lang="less" scoped>
@border-radius: 5px;
::-webkit-scrollbar {
  height: 1px;
}

.link-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  color: @theme-white;
}

.link-container {
  display: flex;
  align-items: center;
  border-radius: @border-radius;
  background-color: @theme-primary-dark-less;
  color: @theme-dark-text;
  height: 2em;
  width: 100%;
}

.link-icon {
  border-radius: @border-radius;
  padding: 3px;
  margin-left: 3px;
  margin-right: 0px;
  color: @theme-white;
  flex: 1 1 auto;
}

.link {
  padding: 7px 8px 7px 4px;
  white-space: nowrap;
  overflow-x: scroll;
  overflow-y: hidden;

  &:hover {
    &::-webkit-scrollbar-thumb {
      background-color: transparent;
    }
  }
}

button {
  cursor: pointer;
  border: none;
  box-shadow: none;

  &:active,
  &:focus {
    outline: none;
  }
  &::-moz-focus-inner {
    border: 0;
  }
}

.copy-button {
  border-radius: 0 @border-radius @border-radius 0;
  color: @theme-white;
  //background-color: darken(@theme-primary-color, 8%);
  background-image: linear-gradient(
    to right,
    @theme-primary-dark-less,
    @theme-primary-dark-medium 55%
  );
  height: 100%;
  flex: 0 0 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px 5px;
}

// tippy related
#help-icon {
  margin-left: 6px;
  font-size: 13px;
}
</style>
