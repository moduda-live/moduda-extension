import ScreenFormatter from "./ScreenFormatter";
import throttle from "lodash.throttle";

const COLUMN_EXTRA_SPACE = 200;
const CONTROL_BAR_LEFT_PADDING_FULL_SCREEN = 24;
const CONTROL_BAR_LEFT_PADDING = 12;

export default class YoutubeFormatter extends ScreenFormatter {
  private ytd!: HTMLElement;
  private masthead!: HTMLElement;
  private primaryCol!: HTMLElement;
  private secondaryCol!: HTMLElement;
  private controlBar!: HTMLElement;
  private progressBar!: HTMLElement;

  constructor() {
    super();
    this.ytd = document.querySelector("ytd-app") as HTMLDivElement;
    this.masthead = document.querySelector("#masthead") as HTMLDivElement;
    this.primaryCol = document.querySelector("#primary") as HTMLDivElement;
    this.secondaryCol = document.querySelector("#secondary") as HTMLDivElement;
    this.controlBar = document.querySelector(
      ".ytp-chrome-bottom"
    ) as HTMLDivElement;
    this.progressBar = document.querySelector(
      ".ytp-chapter-hover-container"
    ) as HTMLDivElement;

    // this.mutationObserver = new MutationObserver((mutations, observer) => {
    //   mutations.forEach(mutation => {
    //     console.log("mutation style: ", mutation.attributeName);
    //     console.log(
    //       "current style: ",
    //       (mutation.target as HTMLElement).style.right
    //     );
    //   });
    // });

    // this.mutationObserver.observe(this.sidebar, {
    //   childList: false,
    //   subtree: false,
    //   attributeFilter: ["style"]
    // });
  }

  adjustScreenFormat() {
    const w = this.afterSidebarWidth;
    this.ytd.style.width = `${w}px`;
    this.masthead.style.width = `${w}px`;
    this.primaryCol.style.maxWidth = this.primaryCol.style.minWidth = `${w -
      this.secondaryCol.offsetWidth -
      COLUMN_EXTRA_SPACE}px`;
    this.controlBar.style.width = this.progressBar.style.width = `${w -
      CONTROL_BAR_LEFT_PADDING * 2}px`;
  }

  adjustScreenFormatOnFullScreenChange(): void {
    const w = this.afterSidebarWidth;
    this.ytd.style.width = `${w}px`;
    this.masthead.style.width = `${w}px`;
    setTimeout(
      () =>
        (this.controlBar.style.width = this.progressBar.style.width = `${w -
          CONTROL_BAR_LEFT_PADDING_FULL_SCREEN * 2}px`),
      0
    );
    // need to trigger flow

    const vid = document.querySelector(".video-stream") as HTMLVideoElement;
    vid.style.maxWidth = `${w}px`;
    // center video
    const offset = (vid.parentElement!!.offsetWidth - vid.offsetWidth) / 2;
    vid.style.left = vid.style.right = `${offset}px`;
  }

  adjustScreenFormatOnResize(): void {
    window.addEventListener(
      "resize",
      throttle(e => {
        if (document.fullscreenElement) {
          this.adjustScreenFormatOnFullScreenChange();
          return;
        }
        this.adjustScreenFormat();
      }, 200)
    );
  }
}
