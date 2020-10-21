import { Party } from "./Party";
import { AsyncMethodReturns, CallSender } from "penpal/lib/types";

export interface UserInfo {
  userId: string;
  username: string;
  isAdmin: boolean;
}

export enum PartyEvent {
  VIDEO_NOT_FOUND,
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
  NEW_SIGNAL = "newSignal",
  BROADCAST_MESSAGE = "broadcastMessage"
}

export interface Communicator {
  party: Party;
  parentConnection: AsyncMethodReturns<CallSender, string>;
  init(): Promise<void>;
  getUsername(): Promise<string>;
  setParty(party: Party): void;
  selectVideo(autoResolveToLargestVideo: boolean): void;
  hideSidebar(): void;
  forwardPlay(): void;
  forwardPause(): void;
  forwardSeek(): void;
}
