import { recursiveQueryVideos, getLargestVideo } from "@/util/dom";
import DeferredPromise from "@/util/DeferredPromise";

// ms to delay resolving/rejecting of DeferredPromise<HTMLVideoElement>
const ARTIFICIAL_DELAY = 1000;

export default class VideoManager {
  videoClickPromise!: DeferredPromise<HTMLVideoElement>;
  autoResolve!: boolean;

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

      setTimeout(() => {
        this.videoClickPromise.resolve(largestVideo);
      }, ARTIFICIAL_DELAY);
    }

    // Currently these are never called, but keeping this in case
    // I decide to allow users to manually select the video
    // this.handleHoverOnVideos(videos);
    // this.handleClickOnVideos(videos);
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
