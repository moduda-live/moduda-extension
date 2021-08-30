import ScreenFormatter from "../ScreenFormatter";

export default class AmazonPrimeScreenFormatter extends ScreenFormatter {
  public domAttachTarget = ".webPlayerSDKContainer";

  normalScreenAndSidebarHidden(): void {
    this.get(".scalingVideoContainer").style.setProperty(
      "width",
      "100vw",
      "important"
    );
    this.get(".webPlayerSDKUiContainer").style.width = "100vw";
  }

  normalScreenAndSidebar(): void {
    this.get(".scalingVideoContainer").style.setProperty(
      "width",
      `calc(100vw - var(--sidebar-width))`,
      "important"
    );
    this.get(
      ".webPlayerSDKUiContainer"
    ).style.width = `calc(100vw - var(--sidebar-width))`;
  }

  fullScreenAndSidebarHidden(): void {
    this.normalScreenAndSidebarHidden();
  }

  fullScreenAndSidebar(): void {
    this.normalScreenAndSidebar();
  }
}
