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

  setIsUserAdmin(isUserAdmin: boolean) {
    this.parentConnection.setIsUserAdmin(isUserAdmin);
  }

  hideSidebar() {
    this.parentConnection.hideSidebar();
  }

  makeToast(toastMsg: string) {
    this.parentConnection.makeToast(toastMsg);
  }

  setAdminControls(adminControlsOnly: boolean) {
    this.parentConnection.setAdminControls(adminControlsOnly);
  }

  /**
   * Video
   */

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

  setHostTime(currentTimeSeconds: number) {
    return this.parentConnection.setHostTime(currentTimeSeconds);
  }

  signalConnected() {
    this.parentConnection.signalConnected(this.party.id);
    this.parentConnection.showSidebarOnceConnected();
  }

  signalConnectionFailed() {
    this.parentConnection.signalConnectionFailed();
  }

  endSession() {
    this.parentConnection.endSession();
  }
}
