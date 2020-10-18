import Peer, { SignalData } from "simple-peer";
import short from "short-uuid";
import EventEmitter from "@/util/EventEmitter";
import { SendMsgType, Communicator, PartyEvent, UserInfo } from "./types";
import { log } from "@/util/log";
import { User, OwnUser, OtherUser } from "../models/User";

export class Party extends EventEmitter<PartyEvent> {
  wsUrl: string;
  id: string;
  socket!: WebSocket;
  parentCommunicator: Communicator;
  users: Map<string, User>;
  ownUser!: OwnUser;

  constructor(
    wsUrl: string,
    parentCommunicator: Communicator,
    partyId?: string
  ) {
    super();
    this.wsUrl = wsUrl;
    this.id = partyId ?? short.generate();
    this.users = new Map<string, User>();
    parentCommunicator.setParty(this);
    this.parentCommunicator = parentCommunicator;
  }

  setUpEventHandlers() {
    // ADD_CHAT_MSG, CONNECTING, CONNECTED, DISCONNECTED, SET_USER_ID event callbacks are registered in syncStoreAndParty.ts
    this.on(PartyEvent.USER_JOINED, () => {
      //TODO: Show notification via parentCommunicator
      log("User joined");
    });
    this.on(PartyEvent.USER_LEFT, userId => {
      //TODO: Show notification via parentCommunicator
      log("User left");
      this.users.delete(userId);
    });
    this.on(PartyEvent.USER_PAUSED, () => {
      //TODO: Show notification via parentCommunicator
      log("User paused");
    });
    this.on(PartyEvent.USER_PLAYED, () => {
      //TODO: Show notification via parentCommunicator
      log("User played");
    });
  }

  async connect() {
    this.emit(PartyEvent.CONNECTING);
    log("Starting party...");
    await this.parentCommunicator.init();
    this.setUpEventHandlers();
    const username = await this.parentCommunicator.getUsername();
    this.ownUser = await new OwnUser(username, this).mediaStreamInitialized;
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

  async handleMessage(this: Party, event: MessageEvent) {
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
        this.emit(PartyEvent.SET_MY_USER_ID, userId);

        this.ownUser.setId(userId);
        this.users.set(userId, this.ownUser);
        // Once receiving userId, now request for list of other users in party
        // server will send "currentPartyUsers" message back
        this.socket.send(
          JSON.stringify({
            type: SendMsgType.GET_CURRENT_PARTY_USERS,
            payload: {
              partyId: this.id,
              username: this.ownUser.username
            }
          })
        );

        break;
      }
      case "currentPartyUsers": {
        // from pov of initiator
        const { users } = msg.payload;
        log("Current number of party users: " + users.length);
        if (users.length === 0) {
          // own user is the creator of the party, and is thus automatically an admin
          // reflects same code in server side
          this.ownUser.setIsAdmin(true);
        } else {
          this.ownUser.setIsAdmin(false);
        }

        users.forEach((userInfoString: string) => {
          const userInfo: UserInfo = JSON.parse(userInfoString);
          const { userId, username, isAdmin } = userInfo;
          const user = this.connectToPeer(userId, username, isAdmin);
          this.users.set(userId, user);
        });
        this.emit(PartyEvent.SET_USERS, Object.fromEntries(this.users));
        break;
      }
      case "returnedSignal": {
        const { senderId, signal } = msg.payload;
        log(`Received returned signal from user ${senderId}`);
        this.users.get(senderId)?.peer?.signal(signal);
        break;
      }
      case "newForeignSignal": {
        const { senderId, username, signal } = msg.payload;
        log(`Received new signal from foreign user ${senderId}`);
        log("signal: " + signal);
        const user = this.users.get(senderId);
        if (user) {
          // User exists already, don't create new Peer again
          // instead, signal it again
          user.peer?.signal(signal);
        } else {
          const user = this.addNewPeer(senderId, username, signal);
          this.users.set(senderId, user);
          this.emit(PartyEvent.USER_JOINED, user);
        }
        break;
      }
      case "newForeignMessage": {
        const { senderId, content } = msg.payload;
        log(`Received new messsage from foreign user ${senderId}`);
        log(`content: ${content}`);
        const sender = this.users.get(senderId);
        if (sender) {
          this.emit(PartyEvent.ADD_CHAT_MSG, {
            isSenderAdmin: sender.isAdmin,
            senderUsername: sender.username,
            senderId: sender.id,
            content
          });
        }
        break;
      }
    }
  }

  addNewPeer(
    senderId: string,
    username: string,
    receivedSignal: SignalData
  ): User {
    log("Adding peer: " + senderId);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: this.ownUser.stream
    });

    peer.on("signal", signal => {
      // Hacky workaround until issue #670 of simple-peer gets fixed
      if (signal.renegotiate || signal.transceiverRequest) return;
      log(`Signalling as non-initiator: ${senderId}`);
      console.log("my non-initiator signal: ", signal);
      this.socket.send(
        JSON.stringify({
          type: SendMsgType.RETURN_SIGNAL,
          payload: {
            senderId: this.ownUser.id,
            recipientId: senderId,
            signal
          }
        })
      );
    });

    peer.signal(receivedSignal);

    const otherUser = new OtherUser(senderId, username, this, peer);
    // first time new user joins, user is not given admin privileges
    otherUser.setIsAdmin(false);
    return otherUser;
  }

  connectToPeer(userId: string, username: string, isAdmin: boolean): User {
    log(`Connecting to peer with id: ${userId}, isAdmin: ${isAdmin}`);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: this.ownUser.stream
    });

    peer.on("signal", signal => {
      log(`Signalling as initiator: ${userId}`);
      console.log("my initiator signal: ", signal);
      this.socket.send(
        JSON.stringify({
          type: SendMsgType.NEW_SIGNAL,
          payload: {
            senderId: this.ownUser.id,
            username: this.ownUser.username,
            recipientId: userId,
            signal
          }
        })
      );
    });

    const otherUser = new OtherUser(userId, username, this, peer);
    otherUser.setIsAdmin(isAdmin);
    return otherUser;
  }

  sendMessage(senderId: string, content: string) {
    console.log(`sender: ${senderId}`);
    this.socket.send(
      JSON.stringify({
        type: SendMsgType.BROADCAST_MESSAGE,
        payload: {
          senderId,
          content
        }
      })
    );
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
  return party;
}
