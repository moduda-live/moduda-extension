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
const SEND_HEALTH_CHECK_INTERVAL = 1000 * 60; // 60 seconds

export class Party extends EventEmitter<PartyEvent> {
  wsUrl: string;
  id: string;
  socket!: WebSocket;
  parentCommunicator: Communicator;
  users: Map<string, User>;
  ownUser!: OwnUser;
  showToast: boolean;
  periodicUpdateIntervalID: number;
  serverHealthCheckSendIntervalID: number;

  constructor(
    wsUrl: string,
    parentCommunicator: Communicator,
    partyId?: string
  ) {
    super();
    this.wsUrl = wsUrl;
    this.id = partyId ?? short.generate();
    this.users = new Map<string, User>();
    this.showToast = true; // needs to be same as the value in vuex
    parentCommunicator.setParty(this);
    this.parentCommunicator = parentCommunicator;
    this.periodicUpdateIntervalID = -1;
    this.serverHealthCheckSendIntervalID = -1;

    // cleanup if we lose connection with Websocket server by tab/window/browser closing
    window.addEventListener("beforeunload", event => {
      this.cleanup();
    });
  }

  setToastShow(show: boolean) {
    this.showToast = show;
  }

  setUpEventHandlers() {
    // Note: More event handlers registered in store / plugin / syncPartyAndStorePlugin.ts
    this.on(PartyEvent.USER_JOINED, (user: User) => {
      log(`User ${user.id} joined [inside Party]`);

      // check condition to START sending periodic updates
      this.checkIfPeriodicallySendVideoTime();
      if (!this.showToast) return;
      this.parentCommunicator.makeToast(`${user.username} just joined! 👋`);
    })
      .on(PartyEvent.USER_LEFT, (user: User) => {
        const userId = user.id;
        if (!userId) {
          console.error(
            "Something went wrong...an user with no id left the group!"
          );
          return;
        }

        if (!this.users.has(userId)) {
          // when other user disconnects by e.g. closing the browser, socket emits an error followed by close,
          // so this gets triggered twice. we skip the rest of the logic if the user has already been removed.
          return;
        }

        log(`User ${userId} left [inside Party]`);
        this.users.delete(userId);

        // check condition to STOP sending periodic updates
        this.checkIfPeriodicallySendVideoTime();

        if (!this.showToast) return;
        this.parentCommunicator.makeToast(`${user.username} has left the room`);
      })
      .on(PartyEvent.SET_USER_MUTE, (user: User, mute: boolean) => {
        log("Setting user mute state to: " + mute);
        user.isMuted = mute;
      })
      .on(PartyEvent.SET_ADMIN_ONLY_CONTROLS, (adminControlsOnly: boolean) => {
        if (!this.showToast) return;
        this.parentCommunicator.makeToast(
          adminControlsOnly
            ? "Now only admins can control the video"
            : "Now anyone can control the video"
        );
      })
      .on(
        PartyEvent.SET_USER_ADMIN_STATUS,
        (userId: string, username: string, isAdmin: boolean) => {
          if (!this.showToast) return;
          if (!isAdmin) {
            if (userId === this.ownUser.id) {
              this.parentCommunicator.makeToast(
                `${username} is no longer an admin`
              );
            } else {
              this.parentCommunicator.makeToast(`You are no longer an admin`);
            }
            return;
          }
          if (userId === this.ownUser.id) {
            this.parentCommunicator.makeToast(`You got promoted to admin!`);
            return;
          }
          this.parentCommunicator.makeToast(
            `${username} got promoted to admin!`
          );
        }
      )
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
      })
      .on(PartyEvent.CONNECTED, () => {
        this.parentCommunicator.signalConnected();
      })
      .on(PartyEvent.ERROR, () => {
        this.parentCommunicator.signalConnectionFailed();
      });
  }

  async connect() {
    log("Starting party...");

    await this.parentCommunicator.init();

    const username = await this.parentCommunicator.getUsername();
    this.emit(PartyEvent.CONNECTING);

    // user selected video to track, now let's connect
    this.setUpEventHandlers();
    this.ownUser = await new OwnUser(username, this).mediaStreamInitialized;
    this.socket = new WebSocket(this.wsUrl);
    this.registerWebsocketHandlers(); // onopen has to be in the same section to execute in same EventLoop
  }

  cleanup() {
    if (this.periodicUpdateIntervalID !== -1) {
      window.clearInterval(this.periodicUpdateIntervalID);
      this.periodicUpdateIntervalID = -1;
    }
    if (this.parentCommunicator) {
      this.parentCommunicator.endSession();
    }
  }

  registerWebsocketHandlers() {
    this.socket.onopen = () => {
      this.emit(PartyEvent.CONNECTED);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.sendHealthCheckToServer();
    };

    this.socket.onclose = () => {
      this.emit(PartyEvent.DISCONNECTED);
      this.cleanup();
      log("Server connection closed");
    };

    this.socket.onerror = () => {
      this.emit(PartyEvent.ERROR);
      this.cleanup();
      log("Error establishing connection with server");
    };
  }

  sendHealthCheckToServer() {
    // AWS ALB closes idle connections after 200s (for now)
    // we send health update every minute
    this.serverHealthCheckSendIntervalID = window.setInterval(async () => {
      this.socket.send(
        JSON.stringify({
          type: SocketSendMsgType.HEALTH_CHECK,
          payload: {}
        })
      );
    }, SEND_HEALTH_CHECK_INTERVAL);
  }

  checkIfPeriodicallySendVideoTime() {
    if (this.periodicUpdateIntervalID === -1) {
      // CHECK IF WE NEED TO START SENDING UPDATES
      // we only start sending new updates when:
      // 1) this user is actually an admin
      // 2) there is at least 1 other user
      const startSendingUpdates: boolean =
        this.ownUser.isAdmin && this.users.size > 1;

      if (startSendingUpdates) {
        this.periodicallySendVideoTime();
      }
    } else {
      // WE HAVE ALREADY BEEN SENDING UPDATES, USER MUST BE AN ADMIN
      if (this.users.size <= 1) {
        window.clearInterval(this.periodicUpdateIntervalID);
        this.periodicUpdateIntervalID = -1;
      }
    }
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
          // own user is the owner of the party, and is thus automatically an admin
          // reflects same code in server side
          this.ownUser.setIsAdmin(true);
          this.ownUser.setIsRoomOwner(true);
          this.parentCommunicator.setIsUserAdmin(true);
        } else {
          this.ownUser.setIsAdmin(false);
          this.ownUser.setIsRoomOwner(false);
          this.parentCommunicator.setIsUserAdmin(false);
        }

        users.forEach((userInfo: UserInfo) => {
          console.dir(userInfo);
          const { userId, username, isAdmin, isRoomOwner } = userInfo;
          const user = this.connectToPeer(
            userId,
            username,
            isAdmin === "true", // is either "true" or "false" string, so convert to boolean
            isRoomOwner === "true" // same
          );
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
        const { userId, content } = msg.payload;
        log(`Received new messsage from foreign user ${userId}`);
        log(`content: ${content}`);
        const sender = this.users.get(userId);
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
      case "setUserMute": {
        const { userId, mute } = msg.payload;
        log(`Mute ${userId}: ${mute}`);
        const user = this.users.get(userId);
        if (user) {
          this.emit(PartyEvent.SET_USER_MUTE, user, mute);
        }
        break;
      }
      case "setAdminControls": {
        const { userId, adminControlsOnly } = msg.payload;
        this.parentCommunicator.setAdminControls(adminControlsOnly);
        this.emit(PartyEvent.SET_ADMIN_ONLY_CONTROLS, adminControlsOnly);
        break;
      }
      case "promoteToRoomOwner": {
        const { userId, username } = msg.payload;
        this.users.forEach(user => {
          if (user.id === userId) {
            // Promote this user
            user.setIsRoomOwner(true);
            if (!user.isAdmin) {
              user.setIsAdmin(true);
              this.emit(
                PartyEvent.SET_USER_ADMIN_STATUS,
                userId,
                username,
                true
              );
            }
            if (user.isOwn) {
              this.periodicallySendVideoTime();
              this.parentCommunicator.setIsUserAdmin(true);
            }
          }
        });
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
    otherUser.setIsRoomOwner(false);
    return otherUser;
  }

  connectToPeer(
    userId: string,
    username: string,
    isAdmin: boolean,
    isRoomOwner: boolean
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
            username: this.ownUser.username,
            recipientId: userId,
            signal
          }
        })
      );
    });

    const otherUser = new OtherUser(userId, username, this, peer, isRoomOwner);
    otherUser.setIsAdmin(isAdmin);
    otherUser.setIsRoomOwner(isRoomOwner);
    return otherUser;
  }

  /**
   * Text Chat
   */

  sendChatMessage(senderId: string, content: string) {
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
   * User control
   */

  relayMuteState(mute: boolean) {
    this.socket.send(
      JSON.stringify({
        type: SocketSendMsgType.SET_USER_MUTE,
        payload: {
          mute
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
      if (!user.isOwn && user.peer !== null && user.peer !== undefined) {
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

  relayAdminControlsState(adminControlsOnly: boolean) {
    this.parentCommunicator.setAdminControls(adminControlsOnly);
    this.socket.send(
      JSON.stringify({
        type: SocketSendMsgType.SET_ADMIN_CONTROLS,
        payload: {
          adminControlsOnly
        }
      })
    );
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
    if (this.users.size <= 1) {
      // no one to send info to, skip it for now
      return;
    }

    this.periodicUpdateIntervalID = window.setInterval(async () => {
      const status = await this.parentCommunicator.getCurrentVideoStatus();
      this.relayRTCMessageToOthers(RTCMsgType.TIME_UPDATE, {
        currentTimeSeconds: status.currentTimeSeconds
      });
    }, SEND_TIME_UPDATE_INTERVAL);
  }

  leaveParty() {
    // send notification
    this.parentCommunicator.makeToast("You disconnected from the room.");
    this.socket.close();
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
  return new Party(connectionUrl, parentCommunicator, partyId);
}
