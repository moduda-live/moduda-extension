import { getLargestVideo, queryVideos, isPlaying } from "@/util/dom";
import DeferredPromise from "@/util/DeferredPromise";
import EventEmitter from "@/util/EventEmitter";
import { VideoEvent } from "./types";
import throttle from "lodash.throttle";
import { VideoStatus } from "@/shared/types";

// ms to delay resolving/rejecting of DeferredPromise<HTMLVideoElement>
const ARTIFICIAL_DELAY = 200;
const SYNC_PERIOD = 3000;
const SYNC_THRESHOLD_TIME_DIFF = 1.5; // seconds
const MAX_WAIT_VIDEO_LOAD_TIME = 1; // miliseconds

// seeking event is prety much guaranteed to be triggered within 100ms of pause when user seeks
// const MS_UNTIL_POTENTIAL_SEEKING = 100;

export default abstract class VideoManager extends EventEmitter<VideoEvent> {
  videoClickPromise!: DeferredPromise<HTMLVideoElement>;
  autoResolve!: boolean;
  videoPlayedByOwn: boolean;
  videoSelected!: HTMLVideoElement;
  hostVideoStatus!: VideoStatus;
  isUserAdmin: boolean;
  preventInfiniteLoop: boolean;
  adminControlsOnly: boolean;
  throttledSync: any;
  public isSyncing: boolean;
  public autoSync: boolean; // whether or not enable autosync
  static timeLostDelta = 1.5; // in seconds

  constructor() {
    super();
    this.videoPlayedByOwn = true;
    this.isUserAdmin = false;
    this.preventInfiniteLoop = false;
    this.adminControlsOnly = true;
    this.isSyncing = false;
    this.autoSync = false;
  }

  selectVideo(autoResolve: boolean): Promise<HTMLVideoElement> {
    this.autoResolve = autoResolve;
    this.videoClickPromise = new DeferredPromise<HTMLVideoElement>();
    this.selectVideoWithDelay();

    return this.videoClickPromise;
  }

  cleanupVideos() {
    const videos = Array.from(document.querySelectorAll("video"));
    videos.forEach(video => {
      video.classList.remove("video--selected");

      //   For future use
      //   video.removeEventListener("click", this.resolveVideoResolvePromise);
      //   video.removeEventListener("mouseenter", this.addVideoHoveredIndicator);
      //   video.removeEventListener("mouseleave", this.removeVideoHoveredIndicator);
    });
  }

  async selectVideoWithDelay() {
    try {
      const videos = await queryVideos(window, MAX_WAIT_VIDEO_LOAD_TIME);
      if (this.autoResolve) {
        const largestVideo = getLargestVideo(videos);
        largestVideo.classList.add("video--selected");
        console.log("Largest video on page:", largestVideo);

        this.videoSelected = largestVideo;

        this.hostVideoStatus = {
          currentTimeSeconds: this.videoSelected.currentTime,
          speed: this.videoSelected.playbackRate,
          isPlaying: isPlaying(this.videoSelected)
        };

        setTimeout(() => {
          this.videoClickPromise.resolve(largestVideo);
        }, ARTIFICIAL_DELAY);
      }
      // Currently these are never called, but keeping this in case
      // I decide to allow users to manually select the video
      // this.handleHoverOnVideos(videos);
      // this.handleClickOnVideos(videos);
    } catch (error) {
      console.error(error);
      setTimeout(() => {
        this.videoClickPromise.reject("There are no videos on the page");
      }, ARTIFICIAL_DELAY);

      return;
    }
  }

  private playEventListener = () => {
    if (!this.videoPlayedByOwn) {
      this.videoPlayedByOwn = true;
      return;
    }

    if (this.isUserAdmin || !this.adminControlsOnly) {
      console.log("user played on own, isAdmin");
      this.hostVideoStatus.isPlaying = true;
      this.emit(VideoEvent.PLAY);
    } else if (!this.hostVideoStatus.isPlaying) {
      console.log("user playing on own, cancel");
      this.pauseVideoHook();
      this.emit(VideoEvent.PLAY_BLOCKED);
    }
  };

  private pauseEventListener = () => {
    if (!this.videoPlayedByOwn) {
      this.videoPlayedByOwn = true;
      return;
    }

    if (this.isUserAdmin || !this.adminControlsOnly) {
      console.log("user paused on own, isAdmin");
      this.hostVideoStatus.isPlaying = false;
      this.emit(VideoEvent.PAUSE);
    } else if (this.hostVideoStatus.isPlaying) {
      console.log("user pausing on own, cancel");
      this.playVideoHook();
      this.emit(VideoEvent.PAUSE_BLOCKED);
    }
  };

  private seekedEventListener = () => {
    if (!this.videoPlayedByOwn) {
      this.videoPlayedByOwn = true;
      return;
    }

    if (this.isSyncing) {
      // we came here as a result of syncing...
      this.isSyncing = false;
      this.emit(VideoEvent.AUTO_SYNC);
      return;
    }

    if (this.isUserAdmin || !this.adminControlsOnly) {
      console.log("user seeked on own, isAdmin");
      this.hostVideoStatus.currentTimeSeconds = this.videoSelected.currentTime;
      this.emit(VideoEvent.SEEKED, this.videoSelected.currentTime);
    } else {
      if (this.preventInfiniteLoop) {
        console.log("preventing loop");
        this.preventInfiniteLoop = false;
        return;
      }

      // if we place the following line before check for isSyncing, then non-admin users will be able to seek video one time after sync
      this.preventInfiniteLoop = true;

      console.log("user seeked on own, cancel");

      // this triggers, pause, play then seeked
      this.seekVideoHook(
        this.hostVideoStatus.currentTimeSeconds + VideoManager.timeLostDelta
      );
      this.emit(VideoEvent.SEEKED_BLOCKED);
    }
  };

  private rateChangeEventListener = () => {
    if (!this.videoPlayedByOwn) {
      this.videoPlayedByOwn = true;
      return;
    }

    if (this.isUserAdmin || !this.adminControlsOnly) {
      console.log("user changed speed on own, isAdmin");
      this.hostVideoStatus.speed = this.videoSelected.playbackRate;
      this.emit(VideoEvent.CHANGE_SPEED, this.videoSelected.playbackRate);
    } else {
      if (this.preventInfiniteLoop) {
        this.preventInfiniteLoop = false;
        return;
      }
      console.log("user changed speed on own, cancel");
      this.preventInfiniteLoop = true;
      this.changeSpeedVideoHook(this.hostVideoStatus.speed);
      this.emit(VideoEvent.CHANGE_SPEED_BLOCKED);
    }
  };

  private timeEventListener = () => {
    if (!this.autoSync) return; // don't even bother if not enabled
    if (this.isUserAdmin) return; // this will not need to happen for admin user

    console.log("CHECKING IF WE SHOULD SYNC");

    const diff = Math.abs(
      this.videoSelected.currentTime - this.hostVideoStatus.currentTimeSeconds
    );
    if (diff > SYNC_THRESHOLD_TIME_DIFF) {
      // mismatch between host and our video by more than <THRESHOLD>-> correct
      // future note: if sync diff is too large, syncing might be a bad experience for the rest of the group
      console.log("SYNCING VIDEO TIMES...");
      console.log(this.hostVideoStatus.currentTimeSeconds);

      this.isSyncing = true;
      this.seekVideoHook(this.hostVideoStatus.currentTimeSeconds); // triggers "user seeked on own, cancel" branch
    }
  };

  setupListeners() {
    this.videoSelected.addEventListener("play", this.playEventListener);
    this.videoSelected.addEventListener("pause", this.pauseEventListener);
    this.videoSelected.addEventListener("seeked", this.seekedEventListener);
    this.videoSelected.addEventListener(
      "ratechange",
      this.rateChangeEventListener
    );
    this.throttledSync = throttle(this.timeEventListener, SYNC_PERIOD);
    this.videoSelected.addEventListener("timeupdate", this.throttledSync);
  }

  removeAllVideoEventListeners() {
    this.videoSelected.removeEventListener("play", this.playEventListener);
    this.videoSelected.removeEventListener("pause", this.pauseEventListener);
    this.videoSelected.removeEventListener("seeked", this.seekedEventListener);
    this.videoSelected.removeEventListener(
      "ratechange",
      this.rateChangeEventListener
    );
    this.videoSelected.removeEventListener("timeupdate", this.throttledSync);
  }

  abstract playVideoHook(): void;
  abstract pauseVideoHook(): void;
  abstract seekVideoHook(time: number): void;
  abstract changeSpeedVideoHook(speed: number): void;

  play = async () => {
    // set to false temporarily so that we don't relay message from
    // video play event that we received from another peer
    this.videoPlayedByOwn = false;
    this.hostVideoStatus.isPlaying = true;
    this.hostVideoStatus.currentTimeSeconds = this.videoSelected.currentTime;
    return this.playVideoHook();
  };

  pause = () => {
    this.videoPlayedByOwn = false;
    this.hostVideoStatus.isPlaying = false;
    this.hostVideoStatus.currentTimeSeconds = this.videoSelected.currentTime;
    this.pauseVideoHook();
  };

  seek = (time: number) => {
    this.videoPlayedByOwn = false;
    this.hostVideoStatus.currentTimeSeconds = time;
    this.seekVideoHook(time);
  };

  changeSpeed = (speed: number) => {
    this.videoPlayedByOwn = false;
    this.hostVideoStatus.speed = speed;
    this.changeSpeedVideoHook(speed);
  };

  setIsUserAdmin(isUserAdmin: boolean) {
    this.isUserAdmin = isUserAdmin;
  }

  /**
   * Unused functions:
   * For future use if we allow user to select their own video
   */
  addVideoHoveredIndicator(event: MouseEvent) {
    (event.target as HTMLVideoElement).classList.add("video--selected");
  }

  removeVideoHoveredIndicator(event: MouseEvent) {
    (event.target as HTMLVideoElement).classList.remove("video--selected");
  }

  handleHoverOnVideos(videos: Array<HTMLVideoElement>) {
    videos.forEach(video => {
      video.addEventListener("mouseenter", this.addVideoHoveredIndicator);
      video.addEventListener("mouseleave", this.removeVideoHoveredIndicator);
    });
  }

  resolveVideoResolvePromise(e: MouseEvent) {
    e.preventDefault();
    this.videoClickPromise.resolve(e.target as HTMLVideoElement);
  }

  handleClickOnVideos(videos: Array<HTMLVideoElement>) {
    videos.forEach(video => {
      video.addEventListener(
        "click",
        this.resolveVideoResolvePromise.bind(this)
      );
    });
  }
}
