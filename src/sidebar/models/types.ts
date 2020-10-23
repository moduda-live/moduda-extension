import { Party } from "./Party";
import { AsyncMethodReturns, CallSender } from "penpal/lib/types";

export interface UserInfo {
  userId: string;
  username: string;
  isAdmin: boolean;
}

export enum VideoState {
  PAUSED,
  PLAYING
}

export enum PartyEvent {
  // Server
  CONNECTING,
  CONNECTED,
  DISCONNECTED,
  // User
  USER_JOINED,
  USER_LEFT,
  USER_PAUSED,
  USER_PLAYED,
  SET_MY_USER_ID,
  SET_USERS,
  UPDATE_USER_STREAM,
  // Chat
  ADD_CHAT_MSG,
  // Video
  VIDEO_NOT_FOUND,
  VIDEO_PLAY,
  VIDEO_PAUSE,
  VIDEO_SEEK,
  // Error
  ERROR
}

export enum SocketSendMsgType {
  GET_CURRENT_PARTY_USERS = "getCurrentPartyUsers",
  RETURN_SIGNAL = "returnSignal",
  NEW_SIGNAL = "newSignal",
  BROADCAST_MESSAGE = "broadcastMessage"
}

export enum RTCMsgType {
  PLAY = "playVideo",
  PAUSE = "pauseVideo",
  SEEKED = "seekedVideo",
  REQUEST_INITIAL_VIDEO_TIME = "requestInitialVideoTime",
  INITIAL_VIDEO_TIME = "initialVideoTime"
}

export interface Communicator {
  party: Party;
  parentConnection: AsyncMethodReturns<CallSender, string>;
  init(): Promise<void>;
  setParty(party: Party): void;
  getUsername(): Promise<string>;
  hideSidebar(): void;
  makeToast(toastMsg: string): void;
  selectVideo(autoResolveToLargestVideo: boolean): Promise<void>;
  playVideo(): Promise<void>;
  pauseVideo(): Promise<void>;
  seekVideo(currentTimeSeconds: number): Promise<void>;
  relayPlay(): void;
  relayPause(): void;
  relaySeeked(currentTimeSeconds: number): void;
  getCurrentVideoTime(): Promise<number>;
}
