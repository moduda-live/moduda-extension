import { Party } from "@/sidebar/services/Party";
import { PartyEvent } from "@/sidebar/services/types";
import { Store, MutationPayload } from "vuex";
import { ConnectionStatus, RootState } from "../types";
import { User } from "@/sidebar/models/User";

export default function createSyncPartyAndStorePlugin(party: Party) {
  return (store: Store<RootState>) => {
    // Sync party -> store
    party
      .on(PartyEvent.CONNECTING, () => {
        store.dispatch("connectingToServer");
      })
      .on(PartyEvent.CONNECTED, () => {
        store.dispatch("connectedToServer");
      })
      .on(PartyEvent.DISCONNECTED, () => {
        store.dispatch("disconnectedFromServer");
      })
      .on(PartyEvent.ADD_CHAT_MSG, msg => {
        store.dispatch("addMessage", msg);
      })
      .on(PartyEvent.SET_MY_USER_ID, userId => {
        store.dispatch("setUserId", userId);
      })
      .on(PartyEvent.SET_USERS, (users: Record<string, User>) => {
        store.dispatch("setUsers", users);
      })
      .on(PartyEvent.USER_JOINED, (user: User) => {
        store.dispatch("addUser", user);
      })
      .on(PartyEvent.USER_LEFT, (userId: string) => {
        store.dispatch("removeUser", userId);
      })
      .on(
        PartyEvent.UPDATE_USER_STREAM,
        (userId: string, stream: MediaStream) => {
          store.dispatch("updateUserStream", { userId, stream });
        }
      );

    // Now sync the other way: store -> party
    store.dispatch("setPartyId", party.id);

    store.subscribe((mutation: MutationPayload, state: RootState) => {
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
  };
}
