<template>
  <div class="error-msg-container">
    <p v-if="isUnknownError">
      For some reason, we failed to create your room. Please try again later.
    </p>
    <p v-if="cannotFindVideo">
      We could not locate a video on the current web page.
      <b
        >Make sure you are on the page that contains the video you want to watch
        with others</b
      >. If you are sure there is a video, please submit an issue (stating the
      name of the website and preferrably a screenshot as well) on our
      <a href="https://github.com/movens-app/movens-extension" target="_blank"
        >Github repo</a
      >.
    </p>
    <p v-if="cannotConnect">
      We could not reach the server at this moment. Please try again later.
    </p>
  </div>
</template>

<script>
import Vue from "vue";
import { ErrorType } from "./Popup.vue";

export default Vue.extend({
  name: "ErrorView",
  props: {
    errorType: ErrorType
  },
  computed: {
    isUnknownError() {
      return this.errorType === ErrorType.UNKNOWN;
    },
    cannotFindVideo() {
      return this.errorType === ErrorType.FAILED_VID;
    },
    cannotConnect() {
      return this.errorType === ErrorType.FAILED_CONNECT;
    }
  }
});
</script>

<style lang="less">
.error-msg-container {
  padding: 1em 0;
}
</style>
