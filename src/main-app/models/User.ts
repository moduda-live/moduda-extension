import Peer from "simple-peer";
import { Party } from "./Party";
import { PartyEvent, RTCMsgType } from "./types";

export class User {
  id: string | undefined;
  username: string;
  peer?: Peer.Instance;
  isOwn!: boolean;
  isAdmin!: boolean;
  isRoomOwner!: boolean;
  stream!: MediaStream;
  party: Party;
  isMuted: boolean;
  isSpeaking: boolean;

  constructor(
    id: string | undefined,
    username: string,
    party: Party,
    peer?: Peer.Instance
  ) {
    this.id = id;
    this.username = username;
    this.peer = peer;
    this.party = party;
    this.isMuted = false;
    this.isSpeaking = false;
  }

  setIsAdmin(isAdmin: boolean) {
    this.isAdmin = isAdmin;
  }

  setIsRoomOwner(isRoomOwner: boolean) {
    this.isRoomOwner = isRoomOwner;
  }

  // mute() {
  //   this.stream?.getAudioTracks().forEach(track => (track.enabled = false));
  //   this.isMuted = true;
  //   this.isSpeaking = false;
  // }

  // unmute() {
  //   this.stream?.getAudioTracks().forEach(track => (track.enabled = true));
  //   this.isMuted = false;
  //   this.isSpeaking = false; // false initially because AudioWorklet will take care of this
  // }
}

export class OwnUser extends User {
  private mediaStreamPromise: Promise<MediaStream>;

  constructor(username: string, party: Party) {
    super(undefined, username, party);
    this.isOwn = true;
    this.mediaStreamPromise = (async () => {
      return window.navigator.mediaDevices.getUserMedia({
        video: false,
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true
        }
      });
    })();
  }

  get mediaStreamInitialized(): Promise<OwnUser> {
    return this.mediaStreamPromise
      .then((stream: MediaStream) => {
        this.stream = stream;
        return this;
      })
      .catch(() => {
        this.stream = new MediaStream();
        return this;
      });
  }

  setId(id: string) {
    this.id = id;
  }
}

export class OtherUser extends User {
  constructor(
    id: string,
    username: string,
    party: Party,
    peer: Peer.Instance,
    askForTime: boolean
  ) {
    super(id, username, party, peer);
    this.isOwn = false;
    this.addPeerEventListeners(askForTime);
  }

  addPeerEventListeners(askForTime: boolean) {
    if (!this.peer) {
      return;
    }

    this.peer.on("connect", () => {
      console.log("Connected with " + this.id);
      if (askForTime) {
        this.peer!!.send(
          JSON.stringify({
            type: RTCMsgType.REQUEST_INITIAL_VIDEO_STATUS,
            payload: {}
          })
        );
      }
    });

    this.peer.on("data", async data => {
      const message = JSON.parse(data);

      if (message.type === undefined || message.type === null) {
        console.error("Malformed data received via WebRTC");
        return;
      }

      switch (message.type as RTCMsgType) {
        case RTCMsgType.PLAY:
          this.party.playVideo(message.payload.username);
          break;
        case RTCMsgType.PAUSE:
          this.party.pauseVideo(message.payload.username);
          break;
        case RTCMsgType.SEEKED:
          this.party.seekVideo(
            message.payload.username,
            message.payload.currentTimeSeconds
          );
          break;
        case RTCMsgType.CHANGE_SPEED:
          this.party.changeVideoSpeed(
            message.payload.username,
            message.payload.speed
          );
          break;
        case RTCMsgType.REQUEST_INITIAL_VIDEO_STATUS: {
          const initialVideoStatus = await this.party.parentCommunicator.getCurrentVideoStatus();
          this.peer!!.send(
            JSON.stringify({
              type: RTCMsgType.INITIAL_VIDEO_STATUS,
              payload: {
                ...initialVideoStatus
              }
            })
          );
          break;
        }
        case RTCMsgType.INITIAL_VIDEO_STATUS: {
          const { currentTimeSeconds, speed, isPlaying } = message.payload;
          this.party.setVideoStatus(currentTimeSeconds, speed, isPlaying);
          break;
        }
        case RTCMsgType.TIME_UPDATE: {
          const { currentTimeSeconds } = message.payload;
          this.party.parentCommunicator.setHostTime(currentTimeSeconds);
          break;
        }
        default:
          console.error("Could not identify message received via WebRTC");
      }
    });

    this.peer.on("stream", stream => {
      this.stream = stream;
      this.party.emit(PartyEvent.UPDATE_USER_STREAM, this.id, this.stream);
    });

    this.peer.on("error", err => {
      this.party.emit(PartyEvent.USER_LEFT, this);
      // TODO: Attempt to reconnect
    });

    this.peer.on("close", () => {
      // TODO: Attempt to reconnect
      console.log("User" + this.username + " disconnected");
      this.party.emit(PartyEvent.USER_LEFT, this);
    });
  }
}
