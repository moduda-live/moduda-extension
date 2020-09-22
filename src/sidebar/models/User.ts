import Peer from "simple-peer";
import { Party } from "../services/Party";
import { PartyEvent } from "../services/types";

export class User {
  id: string;
  peer?: Peer.Instance;
  isOwn!: boolean;
  isAdmin: boolean;
  stream!: MediaStream;
  party: Party;

  constructor(id: string, party: Party, isOwn: boolean, peer?: Peer.Instance) {
    this.id = id;
    this.isAdmin = false; // initially other users are not admins
    this.peer = peer;
    this.party = party;
    this.isOwn = isOwn;
  }
}

export class OwnUser extends User {
  constructor(id: string, party: Party) {
    super(id, party, true);
    window.navigator.mediaDevices
      .getUserMedia({
        video: false,
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true
        }
      })
      .then(stream => {
        this.stream = stream;
      })
      .catch(err => {
        this.stream = new MediaStream();
      });
  }
}

export class OtherUser extends User {
  constructor(id: string, party: Party, peer: Peer.Instance) {
    super(id, party, false, peer);
    this.addPeerEventListeners();
  }

  addPeerEventListeners() {
    if (!this.peer) {
      return;
    }

    this.peer.on("connect", () => {
      console.log("Connected with " + this.id);
      console.log("Add streams now...");
      this.peer?.addStream(this.party.ownUser.stream);
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
      console.log("Error: " + (err as any).code);
      // TODO: Attempt to reconnect
    });

    this.peer.on("close", () => {
      // TODO: Attempt to reconnect
      this.party.emit(PartyEvent.USER_LEFT, this.id);
    });
  }
}
