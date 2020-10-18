import { Module } from "vuex";
import { RootState } from "../types";
import { Message, ChatState } from "./types";
import { MAX_NUM_CHAT_MESSAGES } from "@/util/constants";

export const chat: Module<ChatState, RootState> = {
  namespaced: true,
  state: {
    chatMessages: [],
    chatHidden: false,
    chatAnchored: false,
    chatScrollPosition: 0
  },
  actions: {
    addMessage({ commit }, msg: Message) {
      commit("ADD_CHAT_MESSAGE", msg);
    }
  },
  mutations: {
    ADD_CHAT_MESSAGE(state, msg: Message) {
      if (state.chatMessages.length >= MAX_NUM_CHAT_MESSAGES) {
        // O(N), but for small array size, Chrome's V8 takes it to constant time
        // https://bugs.chromium.org/p/v8/issues/detail?id=3059
        // if the size was bigger, I'd consider using a CircularBuffer-based implementation of Queue
        state.chatMessages.shift();
      }
      state.chatMessages.push(msg);
    },
    CLEAR_CHAT(state) {
      state.chatScrollPosition = 0;
      state.chatMessages = [];
    },
    HIDE_CHAT(state, currentScrollPosition: number) {
      state.chatScrollPosition = currentScrollPosition;
      state.chatHidden = true;
    },
    SHOW_CHAT(state) {
      state.chatHidden = false;
    },
    ACTIVATE_CHAT_ANCHOR(state) {
      state.chatAnchored = true;
    },
    DEACTIVATE_CHAT_ANCHOR(state) {
      state.chatAnchored = false;
    }
  }
};
