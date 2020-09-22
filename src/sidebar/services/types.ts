import { Party } from "./Party";

export enum PartyEvent {
  CONNECTING,
  CONNECTED,
  DISCONNECTED,
  USER_JOINED,
  USER_LEFT,
  USER_PAUSED,
  USER_PLAYED,
  ADD_CHAT_MSG,
  SET_MY_USER_ID,
  SET_USERS,
  UPDATE_USER_STREAM
}

export enum SendMsgType {
  GET_CURRENT_PARTY_USERS = "getCurrentPartyUsers",
  RETURN_SIGNAL = "returnSignal",
  NEW_SIGNAL = "newSignal"
}

export interface Communicator {
  init(): Promise<void>;
  setParty(party: Party): void;
  forwardPlay(): void;
  forwardPause(): void;
  forwardSeek(): void;
}
