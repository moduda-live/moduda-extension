<template>
  <div>
    <h4 :class="{ isMyself: user.isOwn }">{{ user.id }}</h4>
    <audio autoplay ref="userAudio" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "VoiceChatPanel",
  props: ["user"],
  watch: {
    user: {
      deep: true,
      handler(oldVal, newVal) {
        if (newVal.isOwn) {
          return;
        }

        const userAudio = this.$refs.userAudio as HTMLAudioElement;
        userAudio.srcObject = newVal.stream;
      }
    }
  }
});
</script>

<style lang="less" scoped>
.isMyself {
  color: red;
}
</style>
