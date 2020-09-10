import { Store } from "vuex";
import { ConnectionStatus, RootState } from "../types";
import Party from "@/sidebar/services/Party";
import { PartyEvent } from "@/sidebar/services/types";

export default function createPeerConnection(partyId?: string) {
  const party = new Party("ws://localhost:8080", partyId);

  return (store: Store<RootState>) => {
    store.dispatch("setPartyId", party.id);

    store.subscribe((mutation, state) => {
      if (state.serverConnectionStatus !== ConnectionStatus.CONNECTED) {
        return;
      }

      if (
        mutation.type === "ADD_CHAT_MSG" &&
        mutation.payload.senderId === state.userId
      ) {
        // messsage from current user, emit to others in party
      }
    });

    party.on(PartyEvent.CONNECTING, () => {
      store.dispatch("connectingToServer");
    });

    party.on(PartyEvent.CONNECTED, () => {
      store.dispatch("connectedToServer");
    });

    party.on(PartyEvent.DISCONNECTED, () => {
      store.dispatch("disconnectedFromServer");
    });

    party.on(PartyEvent.ADD_CHAT_MSG, msg => {
      store.dispatch("addMessage", msg);
    });

    party.on(PartyEvent.SET_USER_ID, userId => {
      store.dispatch("setUserId", userId);
    });

    party.connect();
  };
}
