<template>
  <div class="loading-indicator">
    <Spin>
      <Icon type="ios-loading" size="18" class="demo-spin-icon-load"></Icon>
      <div class="load-msg">Connecting to server...</div>
    </Spin>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ServerConnectionLoadIndicator"
});
</script>

<style lang="less" scoped>
.loading-indicator {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;

  .ivu-icon {
    font-size: 30px !important;
  }

  .load-msg {
    font-size: 15px;
  }
}
</style>
