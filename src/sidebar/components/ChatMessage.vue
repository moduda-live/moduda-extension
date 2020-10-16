<template>
  <div class="message-container">
    <Icon
      type="logo-angular"
      color="#B42000"
      class="admin-icon"
      v-if="message.isSenderAdmin"
      id="admin-icon"
    />
    <div class="username">{{ message.senderUsername }}</div>
    <span style="white-space: pre-wrap;">:&nbsp;&nbsp;</span>
    <span class="content">{{ message.content }}</span>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import tippy from "tippy.js";
import "tippy.js/animations/scale.css";

export default Vue.extend({
  name: "ChatMessage",
  props: ["message", "isAdmin"],
  mounted() {
    tippy("#admin-icon", {
      content: "Admin",
      placement: "top",
      animation: "scale",
      offset: [0, 3],
      maxWidth: 50,
      theme: "dark"
    });
  }
});
</script>

<style lang="less" scoped>
.message-container {
  color: @theme-white;
  margin-bottom: 5px;
}

.admin-icon {
  margin-right: 4px;
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
