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

  async selectVideo(autoResolveToLargestVideo: boolean) {
    const result = await this.parentConnection.selectVideo(
      autoResolveToLargestVideo
    );
    if (result instanceof Error) {
      throw result;
    }
  }

  async hideSidebar() {
    console.log("Hiding sidebar");
    await this.parentConnection.hideSidebar();
  }

  async forwardPlay() {
    console.log("Forwarding play event");
    await this.parentConnection.forwardPlay();
  }

  async forwardPause() {
    console.log("Forwarding pause event");
    await this.parentConnection.forwardPause();
  }

  async forwardSeek() {
    console.log("Forwarding seek event");
    await this.parentConnection.forwardSeek();
  }
}
