<template>
  <div class="message-container">
    <AdminIcon v-if="message.isSenderAdmin" class="admin-icon" />
    <div class="username">{{ message.senderUsername }}</div>
    <span style="white-space: pre-wrap;">:&nbsp;&nbsp;</span>
    <span class="content">
      <component
        v-for="(partition, index) in parsedMessagePartition"
        :key="index"
        :is="partition.type"
        :content="partition.content"
      />
    </span>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { emoteInfoMap } from "@/util/constants";
import RenderedEmote from "./RenderedEmote.vue";
import RenderedText from "./RenderedText.vue";
import AdminIcon from "../AdminIcon.vue";

type MessagePartitionComponent = "RenderedEmote" | "RenderedText";
interface ParsedPartitionInfo {
  type: MessagePartitionComponent;
  content: string;
}

export default Vue.extend({
  name: "ChatMessage",
  props: ["message", "isAdmin"],
  components: {
    RenderedEmote,
    RenderedText,
    AdminIcon
  },
  computed: {
    parsedMessagePartition(): Array<ParsedPartitionInfo> {
      return this.parseMsg(this.message.content);
    }
  },
  methods: {
    parseMsg(content: string): Array<ParsedPartitionInfo> {
      const contentSplit = content.split(/\s+/);
      const parsed = contentSplit.map(word => {
        const match: RegExpMatchArray | null = word.match(/:(.+?):/);
        if (match !== null && match.length !== 0) {
          const emoteName = match[1];
          console.log("emoteName from parsing:", emoteName);
          const emoteInfo = emoteInfoMap.get(emoteName);

          return emoteInfo
            ? {
                type: "RenderedEmote" as const,
                content: `https://cdn.betterttv.net/emote/${emoteInfo.id}/1x`
              }
            : {
                type: "RenderedText" as const,
                content: emoteName
              };
        } else {
          return {
            type: "RenderedText" as const,
            content: word
          };
        }
      });

      const parsedWithWhiteSpace = parsed.flatMap(
        (currentVal, index, array) => {
          const whiteSpaceExtra = {
            type: "RenderedText" as const,
            content: "  "
          };
          const whiteSpace = {
            type: "RenderedText" as const,
            content: " "
          };
          return index === array.length - 1
            ? currentVal
            : currentVal.type === "RenderedEmote"
            ? [currentVal, whiteSpaceExtra]
            : [currentVal, whiteSpace];
        }
      );

      return parsedWithWhiteSpace;
    }
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
