import { Party } from "./Party";
import { Communicator } from "./types";
import { connectToParent } from "penpal";
import { AsyncMethodReturns, CallSender } from "penpal/lib/types";

export default class ParentCommunicator implements Communicator {
  party!: Party;
  parentConnection!: AsyncMethodReturns<CallSender, string>;

  init() {
    const connection = connectToParent({
      methods: {
        forwardPlay: this.forwardPlay,
        forwardPause: this.forwardPause,
        forwardSeek: this.forwardSeek
      }
    });
    return connection.promise.then(parent => {
      this.parentConnection = parent;
    });
  }

  getUsername(): Promise<string> {
    return this.parentConnection.getUsername();
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
