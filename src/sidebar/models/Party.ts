import Peer, { SignalData } from "simple-peer";
import short from "short-uuid";
import EventEmitter from "@/util/EventEmitter";
import {
  SocketSendMsgType,
  Communicator,
  PartyEvent,
  UserInfo,
  RTCMsgType
} from "./types";
import { log } from "@/util/log";
import { User, OwnUser, OtherUser } from "./User";
import { formatTime } from "@/util/formatTime";

const SEND_TIME_UPDATE_INTERVAL = 500;

export class Party extends EventEmitter<PartyEvent> {
  wsUrl: string;
  id: string;
  socket!: WebSocket;
  parentCommunicator: Communicator;
  users: Map<string, User>;
  ownUser!: OwnUser;
  showToast: boolean;

  constructor(
    wsUrl: string,
    parentCommunicator: Communicator,
    partyId?: string
  ) {
    super();
    this.wsUrl = wsUrl;
    this.id = partyId ?? short.generate();
    this.users = new Map<string, User>();
    this.showToast = false;
    parentCommunicator.setParty(this);
    this.parentCommunicator = parentCommunicator;
  }

  setToastShow(show: boolean) {
    this.showToast = show;
  }

  setUpEventHandlers() {
    // Note: More event handlers registered in store / plugin / syncPartyAndStorePlugin.ts
    this.on(PartyEvent.USER_JOINED, () => {
      log("User joined [inside Party]");
    })
      .on(PartyEvent.USER_LEFT, userId => {
        log("User left [inside Party]");
        this.users.delete(userId);
      })
      .on(PartyEvent.VIDEO_PLAY, username => {
        if (!this.showToast) return;
        if (username === null) {
          this.parentCommunicator.makeToast(`Initially played the video`);
          return;
        }
        this.parentCommunicator.makeToast(`${username} played the video`);
      })
      .on(PartyEvent.VIDEO_PAUSE, username => {
        if (!this.showToast) return;
        if (username === null) {
          this.parentCommunicator.makeToast(`Initially paused the video`);
          return;
        }
        this.parentCommunicator.makeToast(`${username} paused the video`);
      })
      .on(PartyEvent.VIDEO_SEEK, (username, currentTimeSeconds) => {
        if (!this.showToast) return;
        const currentTime = Math.floor(currentTimeSeconds);
        const currentTimeFormatted = formatTime(currentTime);
        if (username === null) {
          this.parentCommunicator.makeToast(
            `Initially setting the video to ${currentTimeFormatted}`
          );
          return;
        }
        this.parentCommunicator.makeToast(
          `${username} moved the video to ${currentTimeFormatted}`
        );
      })
      .on(PartyEvent.VIDEO_CHANGE_SPEED, (username, speed) => {
        if (!this.showToast) return;
        if (username === null) {
          this.parentCommunicator.makeToast(
            `Initially setting video speed to ${speed}`
          );
          return;
        }
        this.parentCommunicator.makeToast(
          `${username} set the video speed to ${speed}`
        );
      });
  }

  async connect() {
    log("Starting party...");

    await this.parentCommunicator.init();
    try {
      await this.parentCommunicator.selectVideo(true);
    } catch (err) {
      this.emit(PartyEvent.VIDEO_NOT_FOUND);
      return;
    }

    const username = await this.parentCommunicator.getUsername();
    this.emit(PartyEvent.CONNECTING);

    // user selected video to track, now let's connect
    this.setUpEventHandlers();
    this.ownUser = await new OwnUser(username, this).mediaStreamInitialized;
    this.socket = new WebSocket(this.wsUrl);
    this.registerWebsocketHandlers(); // onopen has to be in the same section to execute in same EventLoop
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
        this.emit(PartyEvent.ERROR);
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
            type: SocketSendMsgType.GET_CURRENT_PARTY_USERS,
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
          this.parentCommunicator.setIsUserAdmin(true);
          this.periodicallySendVideoTime();
        } else {
          this.ownUser.setIsAdmin(false);
          this.parentCommunicator.setIsUserAdmin(false);
        }

        let askedForVideoTime = false;
        users.forEach((userInfoString: string) => {
          const userInfo: UserInfo = JSON.parse(userInfoString);
          const { userId, username, isAdmin } = userInfo;
          let user: User;
          if (!askedForVideoTime && isAdmin) {
            user = this.connectToPeer(userId, username, isAdmin, true);
            askedForVideoTime = true;
          } else {
            user = this.connectToPeer(userId, username, isAdmin, false);
          }
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

  /**
   * Voice Chat
   */

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
          type: SocketSendMsgType.RETURN_SIGNAL,
          payload: {
            senderId: this.ownUser.id,
            recipientId: senderId,
            signal
          }
        })
      );
    });

    peer.signal(receivedSignal);

    const otherUser = new OtherUser(senderId, username, this, peer, false);
    // first time new user joins, user is not given admin privileges
    otherUser.setIsAdmin(false);
    return otherUser;
  }

  connectToPeer(
    userId: string,
    username: string,
    isAdmin: boolean,
    askForTime: boolean
  ): User {
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
          type: SocketSendMsgType.NEW_SIGNAL,
          payload: {
            senderId: this.ownUser.id,
            username: this.ownUser.username,
            recipientId: userId,
            signal
          }
        })
      );
    });

    const otherUser = new OtherUser(userId, username, this, peer, askForTime);
    otherUser.setIsAdmin(isAdmin);
    return otherUser;
  }

  /**
   * Text Chat
   */

  sendChatMessage(senderId: string, content: string) {
    console.log(`sender: ${senderId}`);
    this.socket.send(
      JSON.stringify({
        type: SocketSendMsgType.BROADCAST_MESSAGE,
        payload: {
          senderId,
          content
        }
      })
    );
  }

  /**
   * Video control
   */

  private relayRTCMessageToOthers(
    type: RTCMsgType,
    optionalPayloadFields?: {
      currentTimeSeconds?: number;
      speed?: number;
    }
  ) {
    this.users.forEach((user: User) => {
      if (!user.isOwn) {
        user.peer &&
          user.peer.send(
            JSON.stringify({
              type,
              payload: {
                username: this.ownUser.username,
                ...optionalPayloadFields
              }
            })
          );
      }
    });
  }

  relayPlay() {
    this.relayRTCMessageToOthers(RTCMsgType.PLAY);
  }

  relayPause() {
    this.relayRTCMessageToOthers(RTCMsgType.PAUSE);
  }

  relaySeeked(currentTimeSeconds: number) {
    this.relayRTCMessageToOthers(RTCMsgType.SEEKED, { currentTimeSeconds });
  }

  relayChangeSpeed(speed: number) {
    this.relayRTCMessageToOthers(RTCMsgType.CHANGE_SPEED, { speed });
  }

  playVideo(fromUsername: string | null) {
    this.emit(PartyEvent.VIDEO_PLAY, fromUsername);
    this.parentCommunicator.playVideo();
  }

  pauseVideo(fromUsername: string | null) {
    this.emit(PartyEvent.VIDEO_PAUSE, fromUsername);
    this.parentCommunicator.pauseVideo();
  }

  seekVideo(fromUsername: string | null, currentTimeSeconds: number) {
    this.emit(PartyEvent.VIDEO_SEEK, fromUsername, currentTimeSeconds);
    this.parentCommunicator.seekVideo(currentTimeSeconds);
  }

  changeVideoSpeed(fromUsername: string | null, speed: number) {
    this.emit(PartyEvent.VIDEO_CHANGE_SPEED, fromUsername, speed);
    this.parentCommunicator.changeVideoSpeed(speed);
  }

  async setVideoStatus(seconds: number, speed: number, isPlaying: boolean) {
    await this.seekVideo(null, seconds);
    await this.changeVideoSpeed(null, speed);
    if (isPlaying) {
      this.playVideo(null);
    } else {
      this.pauseVideo(null);
    }
  }

  periodicallySendVideoTime() {
    window.setInterval(async () => {
      const status = await this.parentCommunicator.getCurrentVideoStatus();
      this.relayRTCMessageToOthers(RTCMsgType.TIME_UPDATE, {
        currentTimeSeconds: status.currentTimeSeconds
      });
    }, SEND_TIME_UPDATE_INTERVAL);
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
