<template>
  <div class="message-container">
    <!-- <Icon
      type="logo-angular"
      color="#B42000"
      class="admin-logo"
      v-if="isAdmin"
      ref="adminLogo"
    /> -->
    <div class="username">{{ message.senderUsername }}</div>
    <span style="white-space: pre-wrap;">:&nbsp;&nbsp;</span>
    <span class="content">{{ message.content }}</span>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ChatMessage",
  props: ["message"]
});
</script>

<style lang="less" scoped>
.message-container {
  color: @theme-white-color;
  margin-bottom: 5px;
}

.username {
  font-weight: 700;
  display: inline-block;
}

.content {
  word-break: break-word;
  white-space: pre-wrap;
}
</style>
