export interface Message {
  isSenderAdmin: boolean;
  senderUsername: string;
  content: string;
}

export interface ChatState {
  chatMessages: Message[];
  chatHidden: boolean;
  chatAnchored: boolean;
}
