import Postmate, { ChildAPI } from "postmate";
import Party from "./Party";
import { Communicator } from "./types";

export default class ParentCommunicator implements Communicator {
  parent!: ChildAPI;
  party!: Party;

  async init() {
    const handshake = new Postmate.Model({
      forwardPlay: this.forwardPlay,
      forwardPause: this.forwardPause,
      forwardSeek: this.forwardSeek
    });
    this.parent = await handshake;
  }

  setParty(party: Party) {
    this.party = party;
  }

  forwardPlay() {
    console.log("Forwarding play event");
  }

  forwardPause() {
    console.log("Forwarding pause event");
  }

  forwardSeek() {
    console.log("Forwarding seek event");
  }
}
