import ScreenFormatter from "../ScreenFormatter";

export default class YoutubeScreenFormatter extends ScreenFormatter {
  public domAttachTarget = "body";
  public playerSelector = "#player-theater-container";
  public videoSelector = "video";
  public controlsSelector = ".ytp-chrome-bottom";

  centerVid() {
    const video = this.get(this.videoSelector);
    video.style.left = `calc(50% - ${video.offsetWidth / 2}px)`;
    video.height = "100%";
  }

  fullScreenAndSidebarHidden(): void {
    this.get(this.playerSelector).style.width = "100vw";
    this.get(this.controlsSelector).style.width = `calc(${
      this.get(this.playerSelector).offsetWidth
    }px - 30px)`;
    this.get(this.videoSelector).style.width = "100vw";
    this.centerVid();
  }

  fullScreenAndSidebar(): void {
    this.get(this.playerSelector).style.width =
      "calc(100vw - var(--sidebar-width))";
    this.get(this.controlsSelector).style.width =
      "calc((100vw - 24px) - var(--sidebar-width))";
    this.get(this.videoSelector).style.width =
      "calc(100vw - var(--sidebar-width))";

    this.centerVid();
  }

  normalScreenAndSidebarHidden(): void {
    this.get(this.playerSelector).style.width = "100%";
    this.centerVid();
  }

  normalScreenAndSidebar(): void {
    this.get(
      this.playerSelector
    ).style.width = `calc(100% - var(--sidebar-width))`;
    this.centerVid();
  }
}
