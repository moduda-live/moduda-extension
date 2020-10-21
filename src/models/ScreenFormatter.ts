import { getViewportWidth } from "@/util/dom";

export default abstract class ScreenFormatter {
  sidebar: HTMLDivElement;
  mutationObserver!: MutationObserver;

  constructor() {
    this.sidebar = document.querySelector(".movens-sidebar") as HTMLDivElement;
  }

  get vw() {
    return getViewportWidth();
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
