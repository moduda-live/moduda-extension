import { User } from "../models/User";

export enum ConnectionStatus {
  DISCONNECTED,
  CONNECTING,
  CONNECTED
}

export interface RootState {
  partyId: string;
  userId: string;
  serverConnectionStatus: ConnectionStatus;
  users: Record<string, User>;
}
