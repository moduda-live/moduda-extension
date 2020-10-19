import "@/assets/styles/sidebar.less";
import { connectToChild } from "penpal";
import { AsyncMethodReturns, CallSender } from "penpal/lib/types";
import DeferredPromise from "@/util/DeferredPromise";

// ms to delay resolving/rejecting of DeferredPromise<HTMLVideoElement>
const ARTIFICIAL_DELAY = 1000;

class Sidebar {
  iframe: HTMLIFrameElement;
  iframeConnection!: AsyncMethodReturns<CallSender, string>;
  videoSelected!: HTMLVideoElement;
  videoClickPromise!: DeferredPromise<HTMLVideoElement>;
  autoResolve!: boolean;

  constructor(
    username: string,
    videolink: string,
    debug: boolean,
    partyId?: string
  ) {
    const iframe = document.createElement("iframe");
    iframe.style.border = "none";
    iframe.id = "movens-iframe";
    const url = new URL(browser.runtime.getURL("sidebar.html"));
    url.searchParams.append("videolink", videolink);

    // DEBUG
    url.searchParams.append("debug", String(debug));

    if (partyId) {
      url.searchParams.append("movensPartyId", partyId);
    }

    iframe.src = url.toString();
    iframe.allow = "microphone";

    this.iframe = iframe;

    this.setUpIframeConnection(username);
    this.attachToDom();
  }

  getLargestVideo(videos: Array<HTMLVideoElement>): HTMLVideoElement {
    let largestVideoArea = videos[0].offsetHeight * videos[0].offsetWidth;

    const largestVideo = videos.reduce((prev, current) => {
      const currentVideoArea = current.offsetHeight * current.offsetWidth;
      if (currentVideoArea > largestVideoArea) {
        largestVideoArea = currentVideoArea;
        return current;
      }
      return prev;
    });

    return largestVideo;
  }

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

  cleanupVideos() {
    const videos = Array.from(document.querySelectorAll("video"));
    videos.forEach(video => {
      video.removeEventListener("click", this.resolveVideoResolvePromise);
      video.removeEventListener("mouseenter", this.addVideoHoveredIndicator);
      video.removeEventListener("mouseleave", this.removeVideoHoveredIndicator);
      // Currently only this is relevant
      video.classList.remove("video--selected");
    });
  }

  highlightAllVideos() {
    const videos = Array.from(document.querySelectorAll("video"));
    if (videos.length === 0) {
      setTimeout(() => {
        this.videoClickPromise.reject("There are no videos on the page");
      }, ARTIFICIAL_DELAY);
      return;
    }

    if (this.autoResolve) {
      const largestVideo = this.getLargestVideo(videos);
      largestVideo.classList.add("video--selected");
      console.log("Largest video on page:", largestVideo);
      setTimeout(() => {
        this.videoClickPromise.resolve(largestVideo);
      }, ARTIFICIAL_DELAY);
      return;
    }

    // Currently this is never called, but keeping this in case
    // I decide to allow users to manually select the video
    this.handleHoverOnVideos(videos);
    this.handleClickOnVideos(videos);
  }

  userSelectVideo(): Promise<HTMLVideoElement> {
    this.videoClickPromise = new DeferredPromise<HTMLVideoElement>();
    this.highlightAllVideos();

    return this.videoClickPromise;
  }

  attachToDom() {
    const container = document.createElement("div");
    container.id = "movens-sidebar";
    container.appendChild(this.iframe);
    document.body.appendChild(container);
  }

  setUpIframeConnection(username: string) {
    const connection = connectToChild({
      iframe: this.iframe,
      childOrigin: browser.runtime.getURL("").slice(0, -1), // hacky workaround to make penpal work
      methods: {
        // TODO: Implement parent methods
        getUsername: () => {
          return username;
        },
        selectVideo: async (autoResolveWithLargestVid: boolean) => {
          this.autoResolve = autoResolveWithLargestVid;
          try {
            const videoSelected = await this.userSelectVideo(); // pause until user selects video
            this.videoSelected = videoSelected;
            this.cleanupVideos();
            return null;
          } catch (err) {
            // no video available
            return new Error("Could not find video");
          }
        },
        playVideo: async () => {
          console.log("Play video");
          try {
            await this.videoSelected.play();
          } catch (err) {
            console.error("Error trying to play this video", err.message);
          }
        },
        pauseVideo: async () => {
          console.log("Pause video");
          try {
            await this.videoSelected.pause();
          } catch (err) {
            console.error("Error trying to play this video: ", err.message);
          }
        },
        seekVideo: () => {
          console.log("Seek video");
        }
      }
    });
    connection.promise.then(child => {
      this.iframeConnection = child;
    });
  }
}

const initParty = (username: string) => {
  const searchParams = new URLSearchParams(window.location.search);

  const partyId = searchParams.get("movensPartyId") ?? undefined;
  searchParams.delete("movensPartyId");

  let debug = false;
  if (process.env.NODE_ENV === "development") {
    // FOR DEBUGGING ONLY
    // SPECIFY debug param to bring up devtools
    debug = !!searchParams.get("debug");
    searchParams.delete("debug");
  }

  const videolinkNoParams = window.location.href.split(/[?#]/)[0];
  const videolink = videolinkNoParams + searchParams.toString();
  new Sidebar(username, videolink, debug, partyId);
  (window as any).partyLoaded = true;
};

browser.runtime.onMessage.addListener(message => {
  if (message.username && !(window as any).partyLoaded) {
    initParty(message.username);
  }
});

if (/movens.app\/join\//.test(window.location.href)) {
  console.log("Redirect");
}
