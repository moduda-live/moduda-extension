<template>
  <div class="voicechat-panel">
    <div class="channel">
      <Icon size="18" type="md-bonfire" />
      <h3 class="channel-usercount">
        {{ `${participantCount} currently in the room` }}
      </h3>
    </div>
    <div class="channel-users">
      <UserView v-for="user in users" :key="user.id" :user="user" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";
import UserView from "./UserView.vue";

export default Vue.extend({
  name: "VoiceChatPanel",
  components: {
    UserView
  },
  updated() {
    console.log("updated");
  },
  computed: {
    ...mapState(["users"]),
    participantCount() {
      console.log("users: ", Object.values(this.users));
      const noOfUsers = Object.keys(this.users).length;
      return noOfUsers + (noOfUsers <= 1 ? " user" : " users");
    }
  }
});
</script>

<style lang="less" scoped>
@maxUsersBeforeScroll: 5;

.channel-users {
  max-height: calc(36px * @maxUsersBeforeScroll);
  overflow-y: auto;
}

.voicechat-panel {
  margin-top: 18px;
}

.channel {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 6px;
  color: @theme-orange;
  cursor: pointer;
}

.channel-usercount {
  margin-left: 4px;
  font-weight: 500;
  font-size: 12px;
}
</style>
