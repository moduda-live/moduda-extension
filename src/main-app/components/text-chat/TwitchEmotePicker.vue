<template>
  <div class="picker-container">
    <div class="emote-grid" ref="emoteGrid" v-if="emotes.length !== 0">
      <Emote
        v-for="(emote, index) in emotes"
        :key="index"
        :emoteInfo="emote"
        class="emote"
        @click="emitEmoteNameToParent"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { emoteInfoMap } from "@/util/constants";
import Emote from "./Emote.vue";

export type EmoteInfo = {
  name: string;
  id: string;
};

export default Vue.extend({
  name: "TwitchEmotePicker",
  components: {
    Emote
  },
  data() {
    return {
      emotes: Array.from(emoteInfoMap.values()) as EmoteInfo[],
      errorMsg: ""
    };
  },
  methods: {
    emitEmoteNameToParent(emoteName: string) {
      this.$emit("emote-clicked", emoteName);
    }
  }
});
</script>

<style lang="less" scoped>
.picker-container {
  background-color: @theme-primary-dark-medium;
  border-radius: 5px;
  width: 200px;
  height: 220px;
  border: 1px solid black;
  box-shadow: 0px 4px 10px -5px rgba(0, 0, 0, 1);

  &:focus {
    outline: none !important;
  }
}

.emote-grid {
  padding: 10px 15px;
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(4, 1fr);
  gap: 2px;
  overflow-x: hidden;
  overflow-y: auto;
  justify-items: center;
  align-items: center;
}

// for the child
.emote {
  height: 1.5rem;
  width: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.2rem;
  border-radius: 3px;
  transition: all 0.3s ease-in-out;
  cursor: pointer;

  &:hover {
    background-color: @theme-primary-brighter;
  }
}
</style>
