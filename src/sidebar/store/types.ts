import { User } from "../models/User";

export interface Message {
  isSenderAdmin: boolean;
  senderUsername: string;
  content: string;
}

export enum ConnectionStatus {
  DISCONNECTED,
  CONNECTING,
  CONNECTED
}

export interface RootState {
  partyId: string;
  userId: string;
  chatMessages: Message[];
  chatHidden: boolean;
  chatAnchored: boolean;
  serverConnectionStatus: ConnectionStatus;
  users: Record<string, User>;
}
