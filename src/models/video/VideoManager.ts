import { recursiveQueryVideos, getLargestVideo } from "@/util/dom";
import DeferredPromise from "@/util/DeferredPromise";
import EventEmitter from "@/util/EventEmitter";
import { VideoEvent } from "./types";

// ms to delay resolving/rejecting of DeferredPromise<HTMLVideoElement>
const ARTIFICIAL_DELAY = 1000;

// seeking event is prety much guaranteed to be triggered within 100ms of pause when user seeks
const MS_UNTIL_POTENTIAL_SEEKING = 100;

export default class VideoManager extends EventEmitter<VideoEvent> {
  videoClickPromise!: DeferredPromise<HTMLVideoElement>;
  autoResolve!: boolean;
  videoPlayedByOwn: boolean;
  checkIfPausedFromSeekTimeout: number;
  videoSelected!: HTMLVideoElement;

  constructor() {
    super();
    this.videoPlayedByOwn = true;
    this.checkIfPausedFromSeekTimeout = -1;
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
    const videos = recursiveQueryVideos(document, []);
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

      setTimeout(() => {
        this.videoClickPromise.resolve(largestVideo);
      }, ARTIFICIAL_DELAY);
    }

    // Currently these are never called, but keeping this in case
    // I decide to allow users to manually select the video
    // this.handleHoverOnVideos(videos);
    // this.handleClickOnVideos(videos);
  }

  setupListeners() {
    this.videoSelected.addEventListener("play", () => {
      if (this.videoSelected.readyState === 1) {
        // play was triggered from seeking, so lets ignore
        return;
      }

      if (this.videoPlayedByOwn) {
        this.emit(VideoEvent.PLAY);
      } else {
        this.videoPlayedByOwn = true;
      }
    });

    this.videoSelected.addEventListener("pause", () => {
      console.log("Paused at ", new Date().getTime());
      this.checkIfPausedFromSeekTimeout = window.setTimeout(() => {
        if (this.videoPlayedByOwn) {
          this.emit(VideoEvent.PAUSE);
        } else {
          this.videoPlayedByOwn = true;
        }
      }, MS_UNTIL_POTENTIAL_SEEKING);
    });

    this.videoSelected.addEventListener("seeking", () => {
      //console.log("Video seeking at: ", new Date().getTime());
      clearTimeout(this.checkIfPausedFromSeekTimeout);
    });

    this.videoSelected.addEventListener("seeked", () => {
      //console.log("Video seeked at: ", new Date().getTime());

      if (this.videoPlayedByOwn) {
        this.emit(VideoEvent.SEEKED, this.videoSelected.currentTime);
      } else {
        this.videoPlayedByOwn = true;
      }
    });
  }

  play = async () => {
    // set to false temporarily so that we don't relay message from
    // video play event that we received from another peer
    this.videoPlayedByOwn = false;
    await this.videoSelected.play();
  };

  pause = async () => {
    this.videoPlayedByOwn = false;
    await this.videoSelected.pause();
  };

  seek = async (time: number) => {
    this.videoPlayedByOwn = false;
    this.videoSelected.currentTime = time;
  };

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
