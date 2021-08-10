import ScreenFormatter from "./ScreenFormatter";

export default class YoutubeFormatter extends ScreenFormatter {
  private ytd: HTMLElement;
  private controlBar: HTMLElement;
  public domAttachTarget = "body";

  constructor() {
    super();
    this.ytd = document.querySelector("ytd-app") as HTMLDivElement;
    this.controlBar = document.querySelector(
      ".ytp-chrome-bottom"
    ) as HTMLDivElement;
  }
  /// ignore for nwo
  // this.ytd.style.width = `calc(100vw - ${this.sidebarWidth}px)`;
  // // center video
  // const vid = document.querySelector("video") as HTMLVideoElement;
  // vid.style.width = `calc(100vw - ${this.sidebarWidth}px)`;
  // vid.style.height = `100vh`;

  // ignore for now
  // this.ytd.style.width = `calc(100vw - ${this.sidebarWidth}px)`;
  // const controlBarParent = document.querySelector(
  //   "#movie_player"
  // ) as HTMLDivElement;
  // this.controlBar.style.width = `calc(${controlBarParent?.offsetWidth}px - 12px)`;
  // const vid = document.querySelector("video") as HTMLVideoElement;
  // vid.style.width = `calc(${controlBarParent?.offsetWidth}px)`;
  // window.dispatchEvent(new Event("resize"));

  fullScreenAndSidebarHidden(): void {
    //ignore
  }
  fullScreenAndSidebar(): void {
    //ignore
  }
  normalScreenAndSidebarHidden(): void {
    //ignore
  }
  normalScreenAndSidebar(): void {
    //ignore
  }
}
