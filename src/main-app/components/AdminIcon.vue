<template>
  <Icon type="logo-angular" color="#B42000" ref="adminIcon" />
</template>

<script lang="ts">
import Vue from "vue";
import tippy from "tippy.js";

export default Vue.extend({
  name: "AdminIcon",
  mounted() {
    const adminIcon = (this.$refs.adminIcon as Vue).$el;
    tippy(adminIcon, {
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

<style lang="less"></style>
