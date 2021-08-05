// shared by content script, background script and Join.vue
// message types for content script <-> background script communication, as well as Vue <-> background script communication
interface BrowserRuntimeMessage {
  type: string;
  payload: object;
}

export interface ConnectedMessage extends BrowserRuntimeMessage {
  type: "CONNECTED";
  payload: {};
}

export interface RedirectRequestMessage extends BrowserRuntimeMessage {
  type: "REDIRECT";
  payload: {
    redirectUrl: string;
    partyId: string;
    username: string;
  };
}

type BrowserTabsMessage = BrowserRuntimeMessage;

export interface CreatePartyMessage extends BrowserTabsMessage {
  type: "CREATE_PARTY";
  payload: {
    partyId: string;
    username: string;
  };
}
