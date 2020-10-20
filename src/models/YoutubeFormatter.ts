import ScreenFormatter from "./ScreenFormatter";

export default class YoutubeFormatter extends ScreenFormatter {
  private ytd!: HTMLElement;
  private masthead!: HTMLElement;
  private primaryCol!: HTMLElement;
  private secondaryCol!: HTMLElement;
  private controlBar!: HTMLElement;
  private originalControlBarLeftOffset!: number;

  constructor() {
    super();
    this.ytd = document.querySelector("ytd-app") as HTMLDivElement;
    this.masthead = document.querySelector("#masthead") as HTMLDivElement;
    this.primaryCol = document.querySelector("#primary") as HTMLDivElement;
    this.secondaryCol = document.querySelector("#secondary") as HTMLDivElement;
    this.controlBar = document.querySelector(
      ".ytp-chrome-bottom"
    ) as HTMLDivElement;
  }

  adjustScreenFormat() {
    this.ytd.style.width = `${this.afterSidebarWidth}px`;
    this.masthead.style.width = `${this.afterSidebarWidth}px`;
    this.primaryCol.style.maxWidth = this.primaryCol.style.minWidth = `${this
      .afterSidebarWidth -
      this.secondaryCol.offsetWidth -
      200}px`;
    this.controlBar.style.width = `${this.afterSidebarWidth}px`;
    this.originalControlBarLeftOffset = parseInt(
      window.getComputedStyle(this.controlBar).left
    );
    this.triggerReflow();
    this.adjustScreenFormatOnFullScreenChange();
    this.adjustScreenFormatOnResize();
  }

  adjustScreenFormatOnFullScreenChange(): void {
    document.addEventListener("fullscreenchange", () => {
      this.controlBar.style.width = `${this.afterSidebarWidth}px`;
      if (document.fullscreenElement) {
        this.controlBar.style.left = `0px`;
        const vid = document.querySelector(".video-stream") as HTMLVideoElement;
        vid.style.maxWidth = `${this.afterSidebarWidth}px`;
        // center video
        const offset = (vid.parentElement!!.offsetWidth - vid.offsetWidth) / 2;
        vid.style.left = `${offset}px`;
        vid.style.right = `${offset}px`;
      } else {
        this.controlBar.style.left = `${this.originalControlBarLeftOffset}px`;
      }
    });
  }

  adjustScreenFormatOnResize(): void {
    window.addEventListener("resize", () => {
      this.ytd.style.width = `${this.afterSidebarWidth}px`;
      this.masthead.style.width = `${this.afterSidebarWidth}px`;
      this.primaryCol.style.minWidth = `${this.afterSidebarWidth -
        this.secondaryCol.offsetWidth -
        200}px`;
    });
  }
}
