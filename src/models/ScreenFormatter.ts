export default abstract class ScreenFormatter {
  sidebar: HTMLDivElement;
  mutationObserver!: MutationObserver;

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
    return (
      this.vw -
      (this.sidebar.offsetWidth + parseInt(this.sidebar.style.right, 10))
    );
  }

  triggerReflow() {
    window.dispatchEvent(new Event("resize"));
  }

  setupListenersForChange() {
    this.adjustScreenFormatOnFullScreenChange();
    this.adjustScreenFormatOnResize();
  }

  abstract adjustScreenFormat(): void;
  abstract adjustScreenFormatOnFullScreenChange(): void;
  abstract adjustScreenFormatOnResize(): void;
}
