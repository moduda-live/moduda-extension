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
        relayPlay: this.relayPlay.bind(this),
        relayPause: this.relayPause.bind(this),
        relaySeeked: this.relaySeeked.bind(this),
        relayChangeSpeed: this.relayChangeSpeed.bind(this)
      }
    });

    return connection.promise.then(parent => {
      this.parentConnection = parent;
    });
  }

  setParty(party: Party) {
    this.party = party;
  }

  getUsername(): Promise<string> {
    return this.parentConnection.getUsername();
  }

  hideSidebar() {
    this.parentConnection.hideSidebar();
  }

  makeToast(toastMsg: string) {
    this.parentConnection.makeToast(toastMsg);
  }

  /**
   * Video
   */
  selectVideo(autoResolveToLargestVideo: boolean) {
    return this.parentConnection.selectVideo(autoResolveToLargestVideo);
  }

  playVideo() {
    return this.parentConnection.playVideo();
  }

  pauseVideo() {
    return this.parentConnection.pauseVideo();
  }

  seekVideo(currentTimeSeconds: number) {
    return this.parentConnection.seekVideo(currentTimeSeconds);
  }

  changeVideoSpeed(speed: number) {
    return this.parentConnection.changeVideoSpeed(speed);
  }

  relayPlay() {
    //console.log("Relay play");
    this.party.relayPlay();
  }

  relayPause() {
    //console.log("Relay pause");
    this.party.relayPause();
  }

  relaySeeked(currentTimeSeconds: number) {
    //console.log("Relay seeked to ", currentTimeSeconds);
    this.party.relaySeeked(currentTimeSeconds);
  }

  relayChangeSpeed(speed: number) {
    this.party.relayChangeSpeed(speed);
  }

  getCurrentVideoStatus() {
    return this.parentConnection.getCurrentVideoStatus();
  }
}
