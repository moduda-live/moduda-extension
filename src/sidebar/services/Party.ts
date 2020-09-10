import short from "short-uuid";
import EventEmitter from "@/util/EventEmitter";
import { PartyEvent } from "./types";
import { log } from "@/util/log";

export default class Party extends EventEmitter<PartyEvent> {
  wsUrl!: string;
  id!: string;
  socket!: WebSocket;

  constructor(wsUrl: string, partyId?: string) {
    super();
    this.wsUrl = wsUrl;
    this.id = partyId ?? short.generate();

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

  connect() {
    this.emit(PartyEvent.CONNECTING);
    log("Starting party...");
    this.socket = new WebSocket(this.wsUrl);
    this.registerWebsocketHandlers();
  }

  registerWebsocketHandlers() {
    this.socket.onopen = () => {
      this.emit(PartyEvent.CONNECTED);
      this.socket.onmessage = this.handleMessage.bind(this);
      const userJoinedMsg = {
        type: "join",
        payload: {
          partyId: this.id
        }
      };
      // server will send "currentPartyUsers" msg
      this.socket.send(JSON.stringify(userJoinedMsg));
      log("Requesting for list of users");
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
      case "currentPartyUsers": {
        // called once upon joining room
        const users = msg.payload.users;
        console.log("Current number of party users: " + users.length);
        // TODO: Add users
      }
    }
  }

  destroy() {
    this.offAll();
  }
}
