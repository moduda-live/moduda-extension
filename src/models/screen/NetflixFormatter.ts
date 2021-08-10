import ScreenFormatter from "./ScreenFormatter";

export default class NetflixFormatter extends ScreenFormatter {
  private app: HTMLElement;
  public domAttachTarget = ".sizing-wrapper";

  constructor() {
    super();
    this.app = document.querySelector(".AkiraPlayer") as HTMLDivElement;
  }

  normalScreenAndSidebarHidden(): void {
    this.app.style.width = `100vw`;
  }

  normalScreenAndSidebar(): void {
    this.app.style.width = `calc(100vw - var(--sidebar-width))`;
  }

  fullScreenAndSidebarHidden(): void {
    this.normalScreenAndSidebar();
  }

  fullScreenAndSidebar(): void {
    this.normalScreenAndSidebarHidden();
  }
}
