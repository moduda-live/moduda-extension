import "./assets/styles/content-script.less";
import { connectToChild } from "penpal";
import { AsyncMethodReturns, CallSender } from "penpal/lib/types";
import Sidebar from "@/iframe-models/dom/SidebarDOM";
import { VideoEvent } from "@/iframe-models/site-managers/types";
import ToastMaker from "@/iframe-models/toast/ToastMaker";
import { isPlaying } from "@/util/dom";
import { log } from "./util/log";
import {
  VideoStatus,
  DisconnectedMessage,
  ConnectedMessage,
  CreatePartyMessage
} from "@/shared/types";
import { SiteManagerFactory } from "./iframe-models/site-managers/SiteManagerFactory";
import SiteManager from "@/iframe-models/site-managers/SiteManager";

declare type Connection<TCallSender extends object = CallSender> = {
  promise: Promise<AsyncMethodReturns<TCallSender>>;
  destroy: Function;
};

class Movens {
  usernameWasBlank: boolean;
  username: string;
  videolink: string;
  partyId: string;
  debug: boolean;
  sidebar!: Sidebar;
  iframeConnection!: Connection;
  childIframe!: AsyncMethodReturns<CallSender, string>;
  siteManager: SiteManager;
  ToastMaker: ToastMaker;

  constructor(
    username: string,
    videolink: string,
    debug: boolean,
    partyId: string | ""
  ) {
    this.usernameWasBlank = !username;
    this.username = username || "Anonymous User";
    this.videolink = videolink;
    this.debug = debug;
    this.partyId = partyId;

    this.ToastMaker = new ToastMaker();

    this.siteManager = SiteManagerFactory.createSiteManager(
      window.location.href
    );
    this.setupVideoManagerListeners();
  }

  setupSidebar() {
    this.sidebar = new Sidebar(
      this.videolink,
      this.debug,
      this.partyId,
      this.siteManager.screenFormatter
    );

    this.setUpIframeConnection(this.username);
  }

  async selectVideo() {
    await this.siteManager.videoManager.selectVideo(true);
    this.siteManager.videoManager.cleanupVideos();
    this.siteManager.videoManager.setupListeners();
  }

  setupVideoManagerListeners() {
    this.siteManager.videoManager
      .on(VideoEvent.PLAY, () => {
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
      })
      .on(VideoEvent.AUTO_SYNC, () => {
        this.ToastMaker.makeToast("Syncing with host...", false);
      });
  }

  unmount() {
    // update browser storage for current moduda state as well
    const disconnectMessage: DisconnectedMessage = {
      type: "DISCONNECTED",
      payload: {}
    };
    browser.runtime.sendMessage(disconnectMessage);

    this.iframeConnection.destroy();
    this.siteManager.videoManager.offAll(); // this removes all event listeners on the VideoManager object itself, not the videos on the page
    this.siteManager.videoManager.removeAllVideoEventListeners();
    this.sidebar.unmount();
    (window as any).partyLoaded = false;
  }

  setUpIframeConnection(username: string) {
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
        hideSidebar: () => {
          this.sidebar.hide();
          this.sidebar.enableReopenTease();
        },
        showSidebarOnceConnected: () => {
          // iframe calls this once connection to Websocket server is established
          this.sidebar.show();
        },
        playVideo: async () => {
          try {
            await this.siteManager.videoManager.play();
          } catch (err) {
            console.error("Error trying to play this video", err.message);
          }
        },
        pauseVideo: async () => {
          try {
            await this.siteManager.videoManager.pause();
          } catch (err) {
            console.error("Error trying to pause this video: ", err.message);
          }
        },
        seekVideo: async (currentTimeSeconds: number) => {
          try {
            await this.siteManager.videoManager.seek(currentTimeSeconds);
          } catch (err) {
            console.error("Error trying to seek this video: ", err.message);
          }
        },
        changeVideoSpeed: async (speed: number) => {
          try {
            await this.siteManager.videoManager.changeSpeed(speed);
          } catch (err) {
            console.error(
              "Error trying to change this video speed: ",
              err.message
            );
          }
        },
        getCurrentVideoStatus: (): VideoStatus => {
          const vid = this.siteManager.videoManager.videoSelected;
          return {
            currentTimeSeconds: vid.currentTime,
            speed: vid.playbackRate,
            isPlaying: isPlaying(vid)
          };
        },
        setIsUserAdmin: (isUserAdmin: boolean) => {
          this.siteManager.videoManager.setIsUserAdmin(isUserAdmin);
        },
        setHostTime: (currentTimeSeconds: number) => {
          this.siteManager.videoManager.hostVideoStatus.currentTimeSeconds = currentTimeSeconds;
        },
        setAdminControls: (adminControlsOnly: boolean) => {
          this.siteManager.videoManager.adminControlsOnly = adminControlsOnly;
        },
        signalConnected: (partyId: string) => {
          // handled by src/background.ts (Background Script)
          const message: ConnectedMessage = {
            type: "CONNECTED",
            payload: {
              partyId,
              videolink: this.videolink,
              username: this.usernameWasBlank ? "" : this.username // do not save username if it was blank
            }
          };
          browser.runtime.sendMessage(message);
        },
        signalConnectionFailed: () => {
          console.log("FAILED TO CONNECT...");
          // handled by src/popup/Popup.vue
          const failedConnectMessage = {
            type: "FAILED_CONNECT"
          };
          browser.runtime.sendMessage(failedConnectMessage);
        },
        setAutoSync: (autoSync: boolean) => {
          this.siteManager.videoManager.autoSync = autoSync;
          this.siteManager.videoManager.isSyncing = false;
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

async function initMovens(username: string, partyId: string, debug = false) {
  // first thing we do, else multiple party sessions will get started
  (window as any).partyLoaded = true;

  // disable debugging for now
  const MovensController = new Movens(
    username,
    window.location.href,
    process.env.NODE_ENV === "development" && debug,
    partyId
  );

  // Step 1) select video
  try {
    log("SELECTING VIDEO...");
    await MovensController.selectVideo();
    // send success info to popup
    browser.runtime.sendMessage({ type: "FOUND_VID" });
  } catch (err) {
    // we couldn't actually find any videos on the page, report this back to the popup
    browser.runtime.sendMessage({ type: "FAILED_VID" });
    (window as any).partyLoaded = false;
    return;
  }

  // Step 2) if we can find a video to hook onto, set up the sidebar an' stuff
  MovensController.setupSidebar();
}

browser.runtime.onMessage.addListener(message => {
  if (!message.type) return;

  if (message.type === "CREATE_PARTY" && !(window as any).partyLoaded) {
    message = message as CreatePartyMessage;
    const username = message.payload.username;
    initMovens(username, message.payload.partyId);
  }
});

if (/moduda.live\/join/.test(window.location.href)) {
  const currentWindowSearchParams = new URLSearchParams(window.location.search);
  const isValidUrl =
    currentWindowSearchParams.has("partyId") &&
    currentWindowSearchParams.has("redirectUrl");

  if (isValidUrl) {
    const redirectUrl = new URL(browser.runtime.getURL("join.html"));
    redirectUrl.searchParams.append(
      "partyId",
      currentWindowSearchParams.get("partyId")!
    );
    redirectUrl.searchParams.append(
      "redirectUrl",
      currentWindowSearchParams.get("redirectUrl")!
    );
    window.location.href = redirectUrl.toString();
  }
}
