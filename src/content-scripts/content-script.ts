import "@/assets/styles/sidebar.less";
import { connectToChild } from "penpal";
import { AsyncMethodReturns, CallSender } from "penpal/lib/types";
import Sidebar from "@/models/sidebar/Sidebar";
import VideoManager from "@/models/video-manager/VideoManager";

class Movens {
  sidebar: Sidebar;
  videoSelected!: HTMLVideoElement;
  iframeConnection!: AsyncMethodReturns<CallSender, string>;
  videoManager: VideoManager;

  constructor(
    username: string,
    videolink: string,
    debug: boolean,
    partyId?: string
  ) {
    this.sidebar = new Sidebar(videolink, debug, partyId);
    this.setUpIframeConnection(username);
    this.videoManager = new VideoManager();
  }

  setupVideoListeners() {
    console.log("Setting up video listeners");
  }

  setUpIframeConnection(username: string) {
    const connection = connectToChild({
      iframe: this.sidebar.iframe,
      childOrigin: browser.runtime.getURL("").slice(0, -1), // hacky workaround to make penpal work
      methods: {
        getUsername: () => {
          return username;
        },
        selectVideo: async (autoResolveWithLargestVid: boolean) => {
          try {
            // pause until user selects video
            const videoSelected = await this.videoManager.selectVideo(
              autoResolveWithLargestVid
            );
            this.videoSelected = videoSelected;
            this.videoManager.cleanupVideos();
            this.setupVideoListeners();
            return null;
          } catch (err) {
            console.log("Error trying to get video reference: ", err);
            return new Error("Could not find video");
          }
        },
        hideSidebar: () => {
          this.sidebar.hide();
          this.sidebar.screenFormatter.triggerReflow();
          this.sidebar.enableReopenTease();
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

function initMovens(username: string) {
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
  new Movens(username, videolink, debug, partyId);
  (window as any).partyLoaded = true;
}

browser.runtime.onMessage.addListener(message => {
  if (message.username && !(window as any).partyLoaded) {
    initMovens(message.username);
  }
});

if (/movens.app\/join\//.test(window.location.href)) {
  console.log("Redirect");
}
