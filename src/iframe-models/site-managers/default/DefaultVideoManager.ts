import VideoManager from "../VideoManager";

export default class DefaultVideoManager extends VideoManager {
  videoTargetSelector = "video";

  playVideoHook(): void {
    this.videoSelected.play();
  }

  pauseVideoHook(): void {
    this.videoSelected.pause();
  }

  seekVideoHook(time: number): void {
    this.videoSelected.currentTime = time;
  }

  changeSpeedVideoHook(speed: number): void {
    this.videoSelected.playbackRate = speed;
  }
}
