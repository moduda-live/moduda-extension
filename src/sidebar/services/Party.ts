import short from "short-uuid";
import EventEmitter from "@/util/EventEmitter";
import { Communicator, PartyEvent } from "./types";
import { ConnectionStatus, RootState } from "../store/types";
import { log } from "@/util/log";
import { Store } from "vuex";

export class Party extends EventEmitter<PartyEvent> {
  wsUrl: string;
  id: string;
  socket!: WebSocket;
  parentCommunicator: Communicator;

  constructor(
    wsUrl: string,
    parentCommunicator: Communicator,
    partyId?: string
  ) {
    super();
    this.wsUrl = wsUrl;
    this.id = partyId ?? short.generate();
    parentCommunicator.setParty(this);
    this.parentCommunicator = parentCommunicator;

    // ADD_CHAT_MSG, CONNECTING, CONNECTED, DISCONNECTED event handlers are reigstered in vuex store plugin
    this.on(PartyEvent.USER_JOINED, () => {
      //TODO: implement user joined
      log("User joined");
    });
    this.on(PartyEvent.USER_LEFT, () => {
      // TODO: implement user left
      log("User left");
    });
    this.on(PartyEvent.USER_PAUSED, () => {
      // TODO: implement user paused
      log("User paused");
    });
    this.on(PartyEvent.USER_PLAYED, () => {
      // TODO: implement user played
      log("User played");
    });
  }

  async connect() {
    this.emit(PartyEvent.CONNECTING);
    log("Starting party...");
    await this.parentCommunicator.init();
    this.socket = new WebSocket(this.wsUrl);
    this.registerWebsocketHandlers(); // onopen has to be in the same section due to EventLoop
  }

  registerWebsocketHandlers() {
    this.socket.onopen = () => {
      this.emit(PartyEvent.CONNECTED);
      this.socket.onmessage = this.handleMessage.bind(this);
    };

    this.socket.onclose = () => {
      this.emit(PartyEvent.DISCONNECTED);
      log("Server connection closed");
    };

    this.socket.onerror = () => {
      this.emit(PartyEvent.DISCONNECTED);
      log("Error establishing connection with server");
    };
  }

  handleMessage(this: Party, event: MessageEvent) {
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch (error) {
      log("Server did not send JSON");
      return;
    }

    if (!msg.type || !msg.payload) {
      log("Malformed json response from server");
      return;
    }

    switch (msg.type) {
      case "error": {
        log("Received error from server: " + msg.payload.message);
        break;
      }
      case "addChatMsg": {
        this.emit(PartyEvent.ADD_CHAT_MSG);
        break;
      }
      case "userId": {
        const { userId } = msg.payload;
        this.emit(PartyEvent.SET_USER_ID, userId);
        // Once receiving userId, now request for list of other users in party
        const requestUsersMsg = {
          type: "getCurrentPartyUsers",
          payload: {
            partyId: this.id
          }
        };
        // server will send "currentPartyUsers" message back;
        this.socket.send(JSON.stringify(requestUsersMsg));
        break;
      }
      case "currentPartyUsers": {
        const { users } = msg.payload;
        console.log("Current number of party users: " + users.length);
        // TODO: Add users
      }
    }
  }

  destroy() {
    this.offAll();
  }
}

export default function createParty(
  connectionUrl: string,
  parentCommunicator: Communicator,
  opts: Record<string, unknown> = {}
) {
  if (!connectionUrl) {
    throw new Error("Could not create");
  }

  // create party
  const partyId = opts.partyId as string;
  const party = new Party(connectionUrl, parentCommunicator, partyId);

  if (opts.store) {
    // set up store
    const store = opts.store as Store<RootState>;

    store.subscribe((mutation: any, state: any) => {
      if (state.serverConnectionStatus !== ConnectionStatus.CONNECTED) {
        return;
      }

      if (
        mutation.type === "ADD_CHAT_MSG" &&
        mutation.payload.senderId === state.userId
      ) {
        // messsage from current user, emit to others in party
      }
    });

    party.on(PartyEvent.CONNECTING, () => {
      store.dispatch("connectingToServer");
    });

    party.on(PartyEvent.CONNECTED, () => {
      store.dispatch("connectedToServer");
    });

    party.on(PartyEvent.DISCONNECTED, () => {
      store.dispatch("disconnectedFromServer");
    });

    party.on(PartyEvent.ADD_CHAT_MSG, msg => {
      store.dispatch("addMessage", msg);
    });

    party.on(PartyEvent.SET_USER_ID, userId => {
      store.dispatch("setUserId", userId);
    });
  }

  party.connect();
  return party;
}
