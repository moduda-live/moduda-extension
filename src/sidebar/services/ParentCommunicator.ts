import { Party } from "./Party";
import { Communicator } from "./types";
import { connectToParent } from "penpal";
import { AsyncMethodReturns, CallSender } from "penpal/lib/types";

export default class ParentCommunicator implements Communicator {
  party!: Party;
  parentConnection!: AsyncMethodReturns<CallSender, string>;

  async init() {
    const connection = connectToParent({
      methods: {
        forwardPlay: this.forwardPlay,
        forwardPause: this.forwardPause,
        forwardSeek: this.forwardSeek
      }
    });
    this.parentConnection = await connection.promise;
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
