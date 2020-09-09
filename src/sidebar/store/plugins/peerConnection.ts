import { Store } from "vuex";
import { ConnectionStatus, RootState } from "../types";
import Party from "@/sidebar/services/Party";
import { PartyEvent } from "@/sidebar/services/types";

const party = new Party("ws://localhost:8080");

export default function createPeerConnection() {
  return (store: Store<RootState>) => {
    store.subscribe((mutation, state) => {
      if (state.serverConnectionStatus !== ConnectionStatus.CONNECTED) {
        return;
      }

      if (
        mutation.type === "ADD_NEW_MSG" &&
        mutation.payload.senderId === state.id
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

    party.connect();
  };
}
