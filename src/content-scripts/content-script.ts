import "@/assets/styles/sidebar.less";
import { connectToChild } from "penpal";
import { AsyncMethodReturns, CallSender } from "penpal/lib/types";
import Sidebar from "@/models/sidebar/Sidebar";
import VideoManager from "@/models/video/VideoManager";
import { VideoEvent } from "@/models/video/types";
import { VideoStatus } from "@/sidebar/models/types";
import ToastMaker from "@/models/toast/ToastMaker";
import { isPlaying } from "@/util/dom";

declare type Connection<TCallSender extends object = CallSender> = {
  promise: Promise<AsyncMethodReturns<TCallSender>>;
  destroy: Function;
};

class Movens {
  sidebar: Sidebar;
  iframeConnection!: Connection;
  childIframe!: AsyncMethodReturns<CallSender, string>;
  VideoManager: VideoManager;

  ToastMaker: ToastMaker;

  constructor(
    username: string,
    videolink: string,
    debug: boolean,
    partyId?: string
  ) {
    this.sidebar = new Sidebar(videolink, debug, partyId);
    this.setUpIframeConnection(username);
    this.VideoManager = new VideoManager();
    this.setupVideoManagerListeners();

    this.ToastMaker = new ToastMaker();
  }

  setupVideoManagerListeners() {
    this.VideoManager.on(VideoEvent.PLAY, () => {
      this.childIframe.relayPlay();
    })
      .on(VideoEvent.PAUSE, () => {
        this.childIframe.relayPause();
      })
      .on(VideoEvent.SEEKED, (toTime: number) => {
        this.childIframe.relaySeeked(toTime);
      })
      .on(VideoEvent.CHANGE_SPEED, (speed: number) => {
        this.childIframe.relayChangeSpeed(speed);
      })
      .on(VideoEvent.PLAY_BLOCKED, () => {
        this.ToastMaker.makeToast(`Only admins can play the video`, true);
      })
      .on(VideoEvent.PAUSE_BLOCKED, () => {
        this.ToastMaker.makeToast(`Only admins can pause the video`, true);
      })
      .on(VideoEvent.SEEKED_BLOCKED, () => {
        this.ToastMaker.makeToast(
          `Only admins can change the video time`,
          true
        );
      })
      .on(VideoEvent.CHANGE_SPEED_BLOCKED, () => {
        this.ToastMaker.makeToast(
          `Only admins can change the video speed`,
          true
        );
      });
  }

  unmount() {
    // end everything
    this.iframeConnection.destroy();
    this.VideoManager.offAll();
    this.sidebar.unmount();
    (window as any).partyLoaded = false;
  }

  setUpIframeConnection(username: string) {
    // console.log("childOrigin: ", browser.runtime.getURL("").slice(0, -1));
    const connection = connectToChild({
      iframe: this.sidebar.iframe,
      childOrigin: browser.runtime.getURL("").slice(0, -1), // hacky workaround to make penpal work
      methods: {
        makeToast: (toastMsg: string) => {
          this.ToastMaker.makeToast(toastMsg);
        },
        getUsername: () => {
          return username;
        },
        selectVideo: async (autoResolveWithLargestVid: boolean) => {
          try {
            // pause until user selects video
            await this.VideoManager.selectVideo(autoResolveWithLargestVid);
            this.VideoManager.cleanupVideos();
            this.VideoManager.pause();
            this.VideoManager.setupListeners();
          } catch (err) {
            console.error("Error trying to get video reference: ", err);
            throw new Error("Could not find video");
          }
        },
        hideSidebar: () => {
          this.sidebar.hide();
          this.sidebar.screenFormatter.triggerReflow();
          this.sidebar.enableReopenTease();
        },
        playVideo: async () => {
          try {
            await this.VideoManager.play();
          } catch (err) {
            console.error("Error trying to play this video", err.message);
          }
        },
        pauseVideo: async () => {
          try {
            await this.VideoManager.pause();
          } catch (err) {
            console.error("Error trying to pause this video: ", err.message);
          }
        },
        seekVideo: async (currentTimeSeconds: number) => {
          try {
            await this.VideoManager.seek(currentTimeSeconds);
          } catch (err) {
            console.error("Error trying to seek this video: ", err.message);
          }
        },
        changeVideoSpeed: async (speed: number) => {
          try {
            await this.VideoManager.changeSpeed(speed);
          } catch (err) {
            console.error(
              "Error trying to change this video speed: ",
              err.message
            );
          }
        },
        getCurrentVideoStatus: (): VideoStatus => {
          const vid = this.VideoManager.videoSelected;
          return {
            currentTimeSeconds: vid.currentTime,
            speed: vid.playbackRate,
            isPlaying: isPlaying(vid)
          };
        },
        setIsUserAdmin: (isUserAdmin: boolean) => {
          this.VideoManager.setIsUserAdmin(isUserAdmin);
        },
        setHostTime: (currentTimeSeconds: number) => {
          this.VideoManager.hostVideoStatus.currentTimeSeconds = currentTimeSeconds;
        },
        setAdminControls: (adminControlsOnly: boolean) => {
          console.log("Setting controls to: ", adminControlsOnly);
          this.VideoManager.adminControlsOnly = adminControlsOnly;
        },
        signalConnected: () => {
          browser.runtime.sendMessage({
            type: "CONNECTED"
          });
        },
        endSession: () => {
          this.unmount();
        }
      }
    });

    connection.promise.then(child => {
      this.childIframe = child;
    });

    this.iframeConnection = connection;
  }
}

function initMovens(username: string) {
  const searchParams = new URLSearchParams(window.location.search);

  const partyId = searchParams.get("movensPartyId") ?? undefined;
  console.log("partyId :>> ", partyId);
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
