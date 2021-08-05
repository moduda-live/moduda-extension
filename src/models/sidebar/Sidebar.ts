import { getViewportWidth } from "@/util/dom";
import ScreenFormatterFactory from "@/models/screen/ScreenFormatterFactory";
import ScreenFormatter from "@/models/screen/ScreenFormatter";

const SIDEBAR_WIDTH = 270;
const SIDEBAR_PADDING_X = 21;

export default class Sidebar {
  sidebarContainer!: HTMLDivElement;
  screenFormatter!: ScreenFormatter;
  iframe: HTMLIFrameElement;

  constructor(videolink: string, debug: boolean, partyId?: string) {
    const iframe = document.createElement("iframe");
    iframe.style.border = "none";
    iframe.id = "movens-iframe";
    const url = new URL(browser.runtime.getURL("sidebar.html"));
    url.searchParams.append("videolink", videolink);

    // DEBUG
    url.searchParams.append("debug", String(debug));

    if (partyId) {
      url.searchParams.append("movensPartyId", partyId);
    }

    iframe.src = url.toString();
    iframe.allow = "microphone";
    this.iframe = iframe;
    this.attachToDom();

    // For adjusting screen layout based on sidebar visiblity
    this.setupScreenFormatter();
  }

  setupScreenFormatter() {
    this.screenFormatter = ScreenFormatterFactory.createScreenFormatter(
      window.location.href
    );
    this.screenFormatter.setupListenersForChange(); // call once
    this.screenFormatter.triggerReflow();
  }

  attachToDom() {
    const container = document.createElement("div");
    container.classList.add("movens-sidebar");
    container.style.right = "0";
    container.appendChild(this.iframe);
    document.body.appendChild(container);

    this.sidebarContainer = container;
  }

  hide = () => {
    this.sidebarContainer.classList.remove("movens-sidebar--teasing");
    this.sidebarContainer.style.right = `${-1 *
      (SIDEBAR_WIDTH + SIDEBAR_PADDING_X * 2)}px`;
  };

  teaseSidebarContainer = () => {
    this.sidebarContainer.classList.add("movens-sidebar--teasing");
    this.sidebarContainer.style.right = `${-1 *
      (SIDEBAR_WIDTH + SIDEBAR_PADDING_X * 2) +
      SIDEBAR_PADDING_X}px`;
  };

  show = () => {
    this.sidebarContainer.removeEventListener("click", this.show);
    document.removeEventListener("mousemove", this.toggleBasedOnMouse);
    this.sidebarContainer.classList.remove("movens-sidebar--teasing");
    this.sidebarContainer.style.right = "0px";
    this.screenFormatter.triggerReflow();
  };

  toggleBasedOnMouse = (e: MouseEvent) => {
    const showMenu = getViewportWidth() - e.pageX < 90;
    if (showMenu) {
      this.teaseSidebarContainer();
    } else {
      this.hide();
    }
  };

  enableReopenTease = () => {
    document.addEventListener("mousemove", this.toggleBasedOnMouse);
    this.sidebarContainer.addEventListener("click", this.show);
  };

  unmount = () => {
    console.log("HERE");
    this.hide();
    this.screenFormatter.triggerReflow();
    this.iframe.parentNode?.removeChild(this.iframe);
    document.body.removeChild(this.sidebarContainer);
  };
}
