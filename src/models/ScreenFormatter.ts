export default abstract class ScreenFormatter {
  sidebar: HTMLDivElement;

  constructor() {
    this.sidebar = document.querySelector("#movens-sidebar") as HTMLDivElement;
  }

  get vw() {
    return Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    );
  }

  get afterSidebarWidth() {
    return this.vw - this.sidebar.offsetWidth;
  }

  triggerReflow() {
    window.dispatchEvent(new Event("resize"));
  }

  abstract adjustScreenFormat(): void;
  abstract adjustScreenFormatOnFullScreenChange(): void;
  abstract adjustScreenFormatOnResize(): void;
}
