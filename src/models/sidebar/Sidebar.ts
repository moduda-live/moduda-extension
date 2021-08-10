import { getViewportWidth } from "@/util/dom";
import ScreenFormatterFactory from "@/models/screen/ScreenFormatterFactory";
import ScreenFormatter from "@/models/screen/ScreenFormatter";

const SIDEBAR_WIDTH = 270;
const SIDEBAR_PADDING_X = 21;

export default class Sidebar {
  sidebarContainer!: HTMLDivElement;
  screenFormatter!: ScreenFormatter;
  iframe: HTMLIFrameElement;

  constructor(videolink: string, debug: boolean, partyId: string | "") {
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

    // For adjusting screen layout based on sidebar visiblity
    this.screenFormatter = ScreenFormatterFactory.createScreenFormatter(
      window.location.href
    );

    this.attachToDom();

    this.screenFormatter.registerSidebar();
  }

  attachToDom() {
    const container = document.createElement("div");
    container.classList.add("movens-sidebar");

    // hide sidebar for now, because we want to only load it once connection to Websocket server is successful
    this.sidebarContainer = container; // this step MUST precede this.hide() as it is now
    this.hide();

    container.appendChild(this.iframe);
    document
      .querySelector(this.screenFormatter.domAttachTarget)
      ?.appendChild(this.sidebarContainer);
  }

  hide = () => {
    this.sidebarContainer.classList.add("movens-sidebar-hidden");
    this.sidebarContainer.classList.remove("movens-sidebar--teasing");
    this.sidebarContainer.style.right = `${-1 *
      (SIDEBAR_WIDTH + SIDEBAR_PADDING_X * 2)}px`;
    if (this.screenFormatter) this.screenFormatter.adjustScreenView();
  };

  teaseSidebarContainer = () => {
    this.sidebarContainer.classList.add("movens-sidebar--teasing");
    this.sidebarContainer.style.right = `${-1 *
      (SIDEBAR_WIDTH + SIDEBAR_PADDING_X * 2) +
      SIDEBAR_PADDING_X}px`;
  };

  show = () => {
    this.sidebarContainer.classList.remove("movens-sidebar-hidden");
    this.sidebarContainer.removeEventListener("click", this.show);
    document.removeEventListener("mousemove", this.toggleBasedOnMouse);
    this.sidebarContainer.classList.remove("movens-sidebar--teasing");
    this.sidebarContainer.style.right = "0px";
    this.screenFormatter.adjustScreenView();
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
    this.hide();
    this.iframe.parentNode?.removeChild(this.iframe);
    this.sidebarContainer.parentNode?.removeChild(this.sidebarContainer);
  };
}
