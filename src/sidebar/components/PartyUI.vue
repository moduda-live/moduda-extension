<template>
  <div class="party">
    <Topbar />
    <div class="divider" />
    <InviteLink />
    <VoiceChatPanel />
    <TextChat />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Topbar from "./Topbar.vue";
import InviteLink from "./InviteLink.vue";
import VoiceChatPanel from "./VoiceChatPanel.vue";
import TextChat from "./TextChat.vue";

export default Vue.extend({
  name: "PartyUI",
  components: {
    Topbar,
    InviteLink,
    VoiceChatPanel,
    TextChat
  },
  data() {
    return {};
  }
});
</script>

<style lang="less" scoped>
.party {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.divider {
  height: 1px;
  width: 100%;
  background-color: @theme-muted-dark-color;
  margin-bottom: 10px;
}
</style>
