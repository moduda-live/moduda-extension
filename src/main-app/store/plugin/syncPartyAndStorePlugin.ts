import { Party } from "../../models/Party";
import { PartyEvent } from "../../models/types";
import { Store, MutationPayload } from "vuex";
import { ConnectionStatus, RootState } from "../types";
import { User } from "../../models/User";
import { Message } from "../chat/types";

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
      .on(PartyEvent.ADD_CHAT_MSG, (msg: Message) => {
        store.dispatch("chat/addMessage", msg);
      })
      .on(PartyEvent.SET_MY_USER_ID, (userId: string) => {
        store.dispatch("setUserId", userId);
      })
      .on(PartyEvent.SET_USERS, (users: Record<string, User>) => {
        store.dispatch("setUsers", users);
      })
      .on(PartyEvent.SET_USER_MUTE, (user: User, mute: boolean) => {
        if (mute) {
          store.commit("MUTE_USER", user.id);
        } else {
          store.commit("UNMUTE_USER", user.id);
        }
      })
      .on(PartyEvent.SET_ADMIN_ONLY_CONTROLS, (adminControlsOnly: boolean) => {
        store.commit("SET_ADMIN_ONLY_CONTROLS", {
          fromSelf: false,
          adminControlsOnly
        });
      })
      .on(PartyEvent.USER_JOINED, (user: User) => {
        const userJoinedMessage: Message = {
          isSenderAdmin: user.isAdmin,
          senderUsername: user.username,
          senderId: user.id ?? "",
          content: ` has joined the room.`,
          isSystemGenerated: true
        };
        store.dispatch("chat/addMessage", userJoinedMessage);

        store.dispatch("addUser", user);
      })
      .on(PartyEvent.USER_LEFT, (user: User) => {
        // is already removed, ignore
        if (user.id && !party.users.has(user.id)) return;

        const userLeftMessage: Message = {
          isSenderAdmin: user.isAdmin,
          senderUsername: user.username,
          senderId: user.id ?? "",
          content: ` has left the room.`,
          isSystemGenerated: true
        };
        store.dispatch("chat/addMessage", userLeftMessage);

        store.dispatch("removeUser", user.id);
      })
      .on(
        PartyEvent.UPDATE_USER_STREAM,
        (userId: string, stream: MediaStream) => {
          store.dispatch("updateUserStream", { userId, stream });
        }
      )
      .on(
        PartyEvent.SET_USER_ADMIN_STATUS,
        (userId: string, username: string, isAdmin: boolean) => {
          store.commit("SET_USER_ADMIN", { userId, isAdmin });
        }
      );

    store.dispatch("setPartyId", party.id);

    // Now sync the other way: store -> party
    store.subscribe((mutation: MutationPayload, state: RootState) => {
      if (state.serverConnectionStatus !== ConnectionStatus.CONNECTED) {
        return;
      }

      if (
        mutation.type === "chat/ADD_CHAT_MESSAGE" &&
        mutation.payload.senderId === state.userId
      ) {
        // messsage from current user, emit to others in party
        party.sendChatMessage(
          mutation.payload.senderId,
          mutation.payload.content
        );

        // message is a system-generated one, for various user events (e.g. user joined, left, played if admin, etc)
      }

      if (mutation.type === "SET_TOAST_SHOW") {
        party.setToastShow(mutation.payload);
      }

      if (
        mutation.type === "SET_ADMIN_ONLY_CONTROLS" &&
        mutation.payload.fromSelf
      ) {
        party.relayAdminControlsState(mutation.payload.adminControlsOnly);
      }

      if (mutation.type === "MUTE_USER" && mutation.payload === state.userId) {
        party.relayMuteState(true);
      }

      if (
        mutation.type === "UNMUTE_USER" &&
        mutation.payload === state.userId
      ) {
        party.relayMuteState(false);
      }
    });
  };
}
