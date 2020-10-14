import { User } from "../models/User";

export interface Message {
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
  serverConnectionStatus: ConnectionStatus;
  users: Record<string, User>;
}
