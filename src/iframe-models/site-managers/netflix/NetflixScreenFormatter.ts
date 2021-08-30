import ScreenFormatter from "../ScreenFormatter";

export default class NetflixFormatter extends ScreenFormatter {
  public domAttachTarget = ".sizing-wrapper";

  normalScreenAndSidebarHidden(): void {
    this.get(".AkiraPlayer").style.width = "100vw";
  }

  normalScreenAndSidebar(): void {
    this.get(".AkiraPlayer").style.width = `calc(100vw - var(--sidebar-width))`;
  }

  fullScreenAndSidebarHidden(): void {
    this.normalScreenAndSidebarHidden();
  }

  fullScreenAndSidebar(): void {
    this.normalScreenAndSidebar();
  }
}
