import { getLargestVideo, queryVideos } from "@/util/dom";
import DeferredPromise from "@/util/DeferredPromise";
import EventEmitter from "@/util/EventEmitter";
import { VideoEvent } from "./types";
import { isPlaying } from "@/util/dom";
import { VideoStatus } from "@/sidebar/models/types";

// ms to delay resolving/rejecting of DeferredPromise<HTMLVideoElement>
const ARTIFICIAL_DELAY = 200;

// seeking event is prety much guaranteed to be triggered within 100ms of pause when user seeks
// const MS_UNTIL_POTENTIAL_SEEKING = 100;

export default class VideoManager extends EventEmitter<VideoEvent> {
  videoClickPromise!: DeferredPromise<HTMLVideoElement>;
  autoResolve!: boolean;
  videoPlayedByOwn: boolean;
  videoSelected!: HTMLVideoElement;
  hostVideoStatus!: VideoStatus;
  isUserAdmin: boolean;
  preventInfiniteLoop: boolean;
  adminControlsOnly: boolean;

  constructor() {
    super();
    this.videoPlayedByOwn = true;
    this.isUserAdmin = false;
    this.preventInfiniteLoop = false;
    this.adminControlsOnly = true;
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

  selectVideoWithDelay() {
    const videos = queryVideos(window, []);
    if (videos.length === 0) {
      setTimeout(() => {
        this.videoClickPromise.reject("There are no videos on the page");
      }, ARTIFICIAL_DELAY);
      return;
    }

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
  }

  private playEventListener = () => {
    if (this.videoPlayedByOwn) {
      if (this.isUserAdmin || !this.adminControlsOnly) {
        console.log("user played on own, isAdmin");
        this.hostVideoStatus.isPlaying = true;
        this.emit(VideoEvent.PLAY);
      } else if (!this.hostVideoStatus.isPlaying) {
        console.log("user playing on own, cancel");
        this.videoSelected.pause();
        this.emit(VideoEvent.PLAY_BLOCKED);
      }
    } else {
      if (this.videoSelected.readyState === 1) {
        // play was triggered from seeking, so lets ignore
        return;
      }
      console.log("played by someone else");
      this.videoPlayedByOwn = true;
    }
  };

  private pauseEventListener = () => {
    if (this.videoPlayedByOwn) {
      if (this.isUserAdmin || !this.adminControlsOnly) {
        console.log("user paused on own, isAdmin");
        this.hostVideoStatus.isPlaying = false;
        this.emit(VideoEvent.PAUSE);
      } else if (this.hostVideoStatus.isPlaying) {
        console.log("user pausing on own, cancel");
        this.videoSelected.play();
        this.emit(VideoEvent.PAUSE_BLOCKED);
      }
    } else {
      console.log("paused by someone else");
      this.videoPlayedByOwn = true;
    }
  };

  private seekedEventListener = () => {
    if (this.videoPlayedByOwn) {
      if (this.isUserAdmin || !this.adminControlsOnly) {
        console.log("user seeked on own, isAdmin");
        this.emit(VideoEvent.SEEKED, this.videoSelected.currentTime);
      } else {
        if (this.preventInfiniteLoop) {
          this.preventInfiniteLoop = false;
          return;
        }
        console.log("user seeked on own, cancel");
        this.preventInfiniteLoop = true;
        this.videoSelected.currentTime = this.hostVideoStatus.currentTimeSeconds;
        this.emit(VideoEvent.SEEKED_BLOCKED);
      }
    } else {
      console.log("seeked by someone else");
      this.videoPlayedByOwn = true;
    }
  };

  private rateChangeEventListener = () => {
    if (this.videoPlayedByOwn) {
      if (this.isUserAdmin || !this.adminControlsOnly) {
        console.log("user changed speed on own, isAdmin");
        this.emit(VideoEvent.CHANGE_SPEED, this.videoSelected.playbackRate);
      } else {
        if (this.preventInfiniteLoop) {
          this.preventInfiniteLoop = false;
          return;
        }
        console.log("user changed speed on own, cancel");
        this.preventInfiniteLoop = true;
        this.videoSelected.playbackRate = this.hostVideoStatus.speed;
        this.emit(VideoEvent.CHANGE_SPEED_BLOCKED);
      }
    } else {
      console.log("changed speed by someone else");
      this.videoPlayedByOwn = true;
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

    // this.videoSelected.addEventListener("seeking", () => {
    //   //console.log("Video seeking at: ", new Date().getTime());
    //   clearTimeout(this.checkIfPausedFromSeekTimeout);
    // });
  }

  removeAllVideoEventListeners() {
    // removes all event listeners attached to the selected video
    this.videoSelected.removeEventListener("play", this.playEventListener);
    this.videoSelected.removeEventListener("pause", this.pauseEventListener);
    this.videoSelected.removeEventListener("seeked", this.seekedEventListener);
    this.videoSelected.removeEventListener(
      "ratechange",
      this.rateChangeEventListener
    );
  }

  play = async () => {
    // set to false temporarily so that we don't relay message from
    // video play event that we received from another peer
    this.videoPlayedByOwn = false;
    this.hostVideoStatus.isPlaying = true;
    this.hostVideoStatus.currentTimeSeconds = this.videoSelected.currentTime;
    await this.videoSelected.play();
  };

  pause = async () => {
    this.videoPlayedByOwn = false;
    this.hostVideoStatus.isPlaying = false;
    this.hostVideoStatus.currentTimeSeconds = this.videoSelected.currentTime;
    await this.videoSelected.pause();
  };

  seek = async (time: number) => {
    this.videoPlayedByOwn = false;
    this.hostVideoStatus.currentTimeSeconds = time;
    this.videoSelected.currentTime = time;
  };

  changeSpeed = async (speed: number) => {
    this.videoPlayedByOwn = false;
    this.hostVideoStatus.speed = speed;
    this.videoSelected.playbackRate = speed;
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
