import Vue from "vue";
import Vuex, { StoreOptions } from "vuex";
import { RootState, ConnectionStatus } from "./types";
import createPeerConnection from "./plugins/peerConnection";

Vue.use(Vuex);

const store: StoreOptions<RootState> = {
  state: {
    partyId: "",
    userId: "",
    chatMessages: [],
    serverConnectionStatus: ConnectionStatus.DISCONNECTED
  },
  getters: {
    serverConnecting: state =>
      state.serverConnectionStatus === ConnectionStatus.CONNECTING,
    serverConnected: state =>
      state.serverConnectionStatus === ConnectionStatus.CONNECTED,
    serverDisconnected: state =>
      state.serverConnectionStatus === ConnectionStatus.DISCONNECTED
  },
  actions: {
    setPartyId({ commit }, partyId) {
      commit("SET_PARTY_ID", partyId);
    },
    setUserId({ commit }, userId) {
      commit("SET_USER_ID", userId);
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
    SET_PARTY_ID(state, partyId) {
      state.partyId = partyId;
    },
    SET_USER_ID(state, userId) {
      state.userId = userId;
    },
    ADD_CHAT_MESSAGE(state, msg) {
      state.chatMessages.push(msg);
    },
    SET_CONNECTION_STATUS(state, status) {
      state.serverConnectionStatus = status;
    }
  }
};

export default function createStore(partyId?: string) {
  store.plugins = [createPeerConnection(partyId)];
  return new Vuex.Store<RootState>(store);
}
