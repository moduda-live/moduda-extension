import Peer from "simple-peer";
import { Party } from "../services/Party";
import { PartyEvent } from "../services/types";

export class User {
  id: string | undefined;
  username: string;
  peer?: Peer.Instance;
  isOwn!: boolean;
  isAdmin: boolean;
  stream!: MediaStream;
  party: Party;
  isMuted: boolean;
  isSpeaking: boolean;

  constructor(
    id: string | undefined,
    username: string,
    party: Party,
    isOwn: boolean,
    peer?: Peer.Instance
  ) {
    this.id = id;
    this.username = username;
    this.isAdmin = false; // initially other users are not admins
    this.peer = peer;
    this.party = party;
    this.isOwn = isOwn;
    this.isMuted = false;
    this.isSpeaking = false;
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
    super(undefined, username, party, true);
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
  constructor(id: string, username: string, party: Party, peer: Peer.Instance) {
    super(id, username, party, false, peer);
    this.addPeerEventListeners();
  }

  addPeerEventListeners() {
    if (!this.peer) {
      return;
    }

    this.peer.on("connect", () => {
      console.log("Connected with " + this.id);
      this.peer?.send("test");
    });

    this.peer.on("data", data => {
      console.log(`Data received: ${data}`);
    });

    this.peer.on("stream", stream => {
      console.log(`stream from ${this.id}`);
      console.log(stream);
      this.stream = stream;
      this.party.emit(PartyEvent.UPDATE_USER_STREAM, this.id, this.stream);
    });

    this.peer.on("error", err => {
      console.log("Error: ", (err as any).code);
      // TODO: Attempt to reconnect
    });

    this.peer.on("close", () => {
      // TODO: Attempt to reconnect
      this.party.emit(PartyEvent.USER_LEFT, this.id);
    });
  }
}
