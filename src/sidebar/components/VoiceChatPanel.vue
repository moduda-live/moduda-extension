<template>
  <div>
    <h3>{{ participantCount }}</h3>
    <UserView v-for="user in users" :key="user.id" :user="user" />
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
  mounted() {
    console.log("RENDERED AGAIN");
  },
  computed: {
    ...mapState(["users"]),
    participantCount() {
      console.log("users: ", Array.from(this.users));
      const noOfUsers = Array.from(this.users).length;
      return noOfUsers + (noOfUsers <= 1 ? " Participant" : " Participants");
    }
  }
});
</script>

<style lang="less" scoped></style>
