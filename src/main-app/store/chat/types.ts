export interface Message {
  isSenderAdmin: boolean;
  senderUsername: string;
  senderId: string;
  content: string;
  isSystemGenerated?: boolean;
}

export interface ChatState {
  chatMessages: Message[];
  chatHidden: boolean;
  chatAnchored: boolean;
  chatScrollPosition: number;
}
