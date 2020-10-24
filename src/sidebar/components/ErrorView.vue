<template functional>
  <div class="sidebar--error">
    <Icon type="md-warning" :size="40" class="sidebar--error__icon" />
    <div class="sidebar--error__text">{{ props.message }}</div>
  </div>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  name: "ErrorView"
});
</script>

<style lang="less">
.sidebar--error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: @theme-white;
  max-width: 200px;

  &__text {
    margin-top: 10px;
    font-size: 15px;
    white-space: pre-wrap;
  }
}
</style>
