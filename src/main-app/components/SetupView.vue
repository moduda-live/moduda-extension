<template>
  <div class="setup-view">
    <Spin>
      <Icon type="ios-loading" size="30" class="demo-spin-icon-load"></Icon>
      <div class="load-msg">Auto-selecting video...</div>
    </Spin>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "SetupView"
});
</script>

<style lang="less" scoped>
.setup-view {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;

  .setup__text {
    color: @theme-white;
    font-size: 1.4em;
    margin-bottom: 15px;
  }

  .load-msg {
    font-size: 15px;
  }
}
</style>
