import { Store } from "vuex";
import { RootState } from "../store/types";
import { Party } from "./Party";
import { PartyEvent } from "./types";
import { User } from "../models/User";

export default function syncStoreAndParty(
  store: Store<RootState>,
  party: Party
) {
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
    .on(PartyEvent.SET_USERS, (users: User[]) => {
      store.dispatch("setUsers", users);
    })
    .on(PartyEvent.USER_JOINED, (user: User) => {
      store.dispatch("addUser", user);
    })
    .on(PartyEvent.USER_LEFT, (user: User) => {
      store.dispatch("removeUser", user);
    })
    .on(
      PartyEvent.UPDATE_USER_STREAM,
      (userId: string, stream: MediaStream) => {
        store.dispatch("updateUserStream", { userId, stream });
      }
    );
}
