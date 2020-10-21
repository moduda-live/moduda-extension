import "@/assets/styles/sidebar.less";
import { connectToChild } from "penpal";
import { AsyncMethodReturns, CallSender } from "penpal/lib/types";
import DeferredPromise from "@/util/DeferredPromise";
import ScreenFormatterFactory from "../models/ScreenFormatterFactory";
import ScreenFormatter from "@/models/ScreenFormatter";
import {
  getLargestVideo,
  recursiveQueryVideos,
  getViewportWidth
} from "@/util/dom";

// ms to delay resolving/rejecting of DeferredPromise<HTMLVideoElement>
const ARTIFICIAL_DELAY = 1000;
const SIDEBAR_WIDTH = 270;
const SIDEBAR_PADDING_X = 21;

class Sidebar {
  sidebarContainer!: HTMLDivElement;
  iframe: HTMLIFrameElement;
  iframeConnection!: AsyncMethodReturns<CallSender, string>;
  videoSelected!: HTMLVideoElement;
  videoClickPromise!: DeferredPromise<HTMLVideoElement>;
  autoResolve!: boolean;
  screenFormatter!: ScreenFormatter;

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

    // For adjusting screen layout based on sidebar visiblity
    this.setupScreenFormatter();
  }

  setupScreenFormatter() {
    this.screenFormatter = ScreenFormatterFactory.createScreenFormatter(
      window.location.href
    );
    this.screenFormatter.setupListenersForChange(); // call once
    this.screenFormatter.triggerReflow();
  }

  attachToDom() {
    const container = document.createElement("div");
    container.classList.add("movens-sidebar");
    container.style.right = "0";
    container.appendChild(this.iframe);
    document.body.appendChild(container);

    this.sidebarContainer = container;
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

  hide() {
    this.sidebarContainer.classList.remove("movens-sidebar--teasing");
    this.sidebarContainer.style.right = `${-1 *
      (SIDEBAR_WIDTH + SIDEBAR_PADDING_X * 2)}px`;
  }

  teaseSidebarContainer() {
    this.sidebarContainer.classList.add("movens-sidebar--teasing");
    // when padding-left increases (due to class addded above), it sticks out from right by SIDEBAR_PADDING_LEFT_INCREASE
    // since we want total tease area width to be SIDEBAR_TEASE_WIDTH, we shift sidebar by the difference between these 2
    this.sidebarContainer.style.right = `${-1 *
      (SIDEBAR_WIDTH + SIDEBAR_PADDING_X * 2) +
      SIDEBAR_PADDING_X}px`;
  }

  show = () => {
    console.log("CLICKED: ");
    this.sidebarContainer.removeEventListener("click", this.show);
    document.removeEventListener("mousemove", this.toggleBasedOnMouse);
    this.sidebarContainer.classList.remove("movens-sidebar--teasing");
    this.sidebarContainer.style.right = "0px";
    this.screenFormatter.triggerReflow();
  };

  toggleBasedOnMouse = (e: MouseEvent) => {
    const showMenu = getViewportWidth() - e.pageX < 90;
    if (showMenu) {
      this.teaseSidebarContainer();
    } else {
      this.hide();
    }
  };

  enableReopenTease() {
    document.addEventListener("mousemove", this.toggleBasedOnMouse);
    this.sidebarContainer.addEventListener("click", this.show);
  }

  setUpIframeConnection(username: string) {
    const connection = connectToChild({
      iframe: this.iframe,
      childOrigin: browser.runtime.getURL("").slice(0, -1), // hacky workaround to make penpal work
      methods: {
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
            console.log("Error trying to get video reference: ", err);
            return new Error("Could not find video");
          }
        },
        hideSidebar: () => {
          this.hide();
          this.screenFormatter.triggerReflow();
          this.enableReopenTease();
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

function initParty(username: string) {
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
}

browser.runtime.onMessage.addListener(message => {
  if (message.username && !(window as any).partyLoaded) {
    initParty(message.username);
  }
});

if (/movens.app\/join\//.test(window.location.href)) {
  console.log("Redirect");
}
