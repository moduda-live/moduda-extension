import ScreenFormatter from "./ScreenFormatter";

export default class DefaultScreenFormatter extends ScreenFormatter {
  public domAttachTarget = "body";

  constructor() {
    super();
  }

  fullScreenAndSidebarHidden(): void {
    // ignore
  }
  fullScreenAndSidebar(): void {
    // ignore
  }
  normalScreenAndSidebarHidden(): void {
    // ignore
  }
  normalScreenAndSidebar(): void {
    // ignore
  }
}
