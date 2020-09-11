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
  SET_USER_ID
}

export interface Communicator {
  init(): Promise<void>;
  setParty(party: Party): void;
  forwardPlay(): void;
  forwardPause(): void;
  forwardSeek(): void;
}
