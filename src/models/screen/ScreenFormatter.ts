import debounce from "lodash.debounce";

export default abstract class ScreenFormatter {
  public abstract domAttachTarget: string;
  sidebar!: HTMLDivElement;
  sidebarWidth!: number;

  constructor() {
    const debouncedAdjust = debounce(this.adjustScreenView.bind(this));
    window.addEventListener("fullscreenchange", debouncedAdjust);
    window.addEventListener("resize", debouncedAdjust);
  }

  registerSidebar() {
    this.sidebar = document.querySelector("#moduda-sidebar") as HTMLDivElement;
    this.sidebarWidth = this.sidebar.offsetWidth;
  }

  isSidebarHidden() {
    return (
      this.sidebar && this.sidebar.classList.contains("moduda-sidebar-hidden")
    );
  }

  adjustScreenView() {
    if (this.isSidebarHidden() === undefined) return; // no sidebar yet

    if (document.fullscreenElement && !this.isSidebarHidden()) {
      this.fullScreenAndSidebarHidden();
    } else if (document.fullscreenElement && this.isSidebarHidden()) {
      this.fullScreenAndSidebar();
    } else if (!document.fullscreenElement && this.isSidebarHidden()) {
      this.normalScreenAndSidebarHidden();
    } else if (!document.fullscreenElement && !this.isSidebarHidden()) {
      this.normalScreenAndSidebar();
    }
  }

  abstract fullScreenAndSidebarHidden(): void;
  abstract fullScreenAndSidebar(): void;
  abstract normalScreenAndSidebarHidden(): void;
  abstract normalScreenAndSidebar(): void;
}
