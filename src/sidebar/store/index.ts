import Vue from "vue";
import Vuex, { StoreOptions } from "vuex";
import { Message, RootState, ConnectionStatus } from "./types";
import { User } from "../models/User";
import { MAX_NUM_CHAT_MESSAGES } from "@/util/constants";

Vue.config.devtools = process.env.NODE_ENV === "development";
Vue.use(Vuex);

const store: StoreOptions<RootState> = {
  state: {
    partyId: "",
    userId: "",
    chatMessages: [],
    serverConnectionStatus: ConnectionStatus.CONNECTING,
    users: {}
  },
  getters: {
    serverConnecting: state =>
      state.serverConnectionStatus === ConnectionStatus.CONNECTING,
    serverConnected: state =>
      state.serverConnectionStatus === ConnectionStatus.CONNECTED,
    serverDisconnected: state =>
      state.serverConnectionStatus === ConnectionStatus.DISCONNECTED,
    otherUsers: state => Object.values(state.users).filter(user => !user.isOwn),
    myUser: state => Object.values(state.users).filter(user => user.isOwn)[0]
  },
  actions: {
    setPartyId({ commit }, partyId: string) {
      commit("SET_PARTY_ID", partyId);
    },
    setUserId({ commit }, userId: string) {
      commit("SET_USER_ID", userId);
    },
    addMessage({ commit }, msg: Message) {
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
    },
    setUsers({ commit }, users: Record<string, User>) {
      commit("SET_USERS", users);
    },
    addUser({ commit }, user: User) {
      commit("ADD_USER", user);
    },
    removeUser({ commit }, userId: string) {
      commit("REMOVE_USER", userId);
    },
    updateUserStream(
      { commit },
      data: { userId: string; stream: MediaStream }
    ) {
      commit("UPDATE_USER_STREAM", data);
    }
  },
  mutations: {
    SET_PARTY_ID(state, partyId: string) {
      state.partyId = partyId;
    },
    SET_USER_ID(state, userId: string) {
      state.userId = userId;
    },
    ADD_CHAT_MESSAGE(state, msg: Message) {
      if (state.chatMessages.length >= MAX_NUM_CHAT_MESSAGES) {
        // O(N), but for small array size, Chrome's V8 takes it to constant time
        // https://bugs.chromium.org/p/v8/issues/detail?id=3059
        // if the size was bigger, I'd consider using a CircularBuffer-based implementation of Queue
        state.chatMessages.shift();
      }
      state.chatMessages.push(msg);
    },
    SET_CONNECTION_STATUS(state, status) {
      state.serverConnectionStatus = status;
    },
    SET_USERS(state, users: Record<string, User>) {
      state.users = users;
    },
    ADD_USER(state, user) {
      Vue.set(state.users, user.id, user);
    },
    REMOVE_USER(state, userId: string) {
      delete state.users[userId];
    },
    UPDATE_USER_STREAM(state, { userId, stream }) {
      const user = state.users[userId];
      if (user) {
        const userWithStream = { ...user, stream };
        Vue.set(state.users, userId, userWithStream);
      }
    },
    TOGGLE_MUTE_USER(state, userId) {
      const user = state.users[userId];
      if (user) {
        user.stream
          .getAudioTracks()
          .forEach(track => (track.enabled = !track.enabled));
        user.isMuted = !user.isMuted;
        user.isSpeaking = false;
      }
    }
  }
};

export default new Vuex.Store<RootState>(store);
