import Vue from "vue";
import Vuex, { StoreOptions } from "vuex";
import { RootState, ConnectionStatus } from "./types";

Vue.use(Vuex);

const store: StoreOptions<RootState> = {
  state: {
    id: "",
    chatMessages: [],
    serverConnectionStatus: ConnectionStatus.DISCONNECTED
  },
  actions: {
    setId({ commit }, id) {
      commit("SET_ID", id);
    },
    addMessage({ commit }, msg) {
      commit("ADD_CHAT_MESSAGE", msg);
    },
    connectingToServer({ commit }) {
      commit("SET_CONNECTION_STATUS", ConnectionStatus.CONNECTING);
    },
    connectedToServer({ commit }) {
      commit("SET_CONNECTION_STATUS", ConnectionStatus.CONNECTED);
    },
    disconnectedFromServer({ commit }) {
      commit("SET_CONNECTION_STATUS", ConnectionStatus.DISCONNECTED);
    }
  },
  mutations: {
    SET_ID(state, id) {
      state.id = id;
    },
    ADD_CHAT_MESSAGE(state, msg) {
      state.chatMessages.push(msg);
    },
    SET_CONNECTION_STATUS(state, status) {
      state.serverConnectionStatus = status;
    }
  }
};

export default new Vuex.Store<RootState>(store);
