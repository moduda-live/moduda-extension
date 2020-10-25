import { User } from "../models/User";

export enum ConnectionStatus {
  BEFORE_CONNECT,
  CONNECTING,
  CONNECTED,
  DISCONNECTED
}

export interface RootState {
  videoNotFound: boolean;
  partyId: string;
  userId: string;
  serverConnectionStatus: ConnectionStatus;
  users: Record<string, User>;
  showToast: boolean;
  adminControlsOnly: boolean;
}
