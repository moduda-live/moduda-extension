export interface Message {
  senderId: string;
  content: string;
}

export enum ConnectionStatus {
  DISCONNECTED,
  CONNECTING,
  CONNECTED
}

export interface RootState {
  id: string;
  chatMessages: Message[];
  serverConnectionStatus: ConnectionStatus;
}
