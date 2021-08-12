import { getViewportWidth } from "@/util/dom";
import ScreenFormatterFactory from "@/models/screen/ScreenFormatterFactory";
import ScreenFormatter from "@/models/screen/ScreenFormatter";
import { log } from "../../util/log";

const SIDEBAR_WIDTH = 270;
const SIDEBAR_PADDING_X = 21;

export default class Sidebar {
  sidebarContainer!: HTMLDivElement;
  screenFormatter!: ScreenFormatter;
  iframe: HTMLIFrameElement;

  constructor(videolink: string, debug: boolean, partyId: string | "") {
    const iframe = document.createElement("iframe");
    iframe.style.border = "none";
    iframe.id = "moduda-iframe";
    const url = new URL(browser.runtime.getURL("sidebar.html"));
    url.searchParams.append("videolink", videolink);

    // DEBUG
    url.searchParams.append("debug", String(debug));

    if (partyId) {
      url.searchParams.append("modudaPartyId", partyId);
    }

    log("CREATING IFRAME");

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
    container.id = "moduda-sidebar";

    // hide sidebar for now, because we want to only load it once connection to Websocket server is successful
    this.sidebarContainer = container; // this step MUST precede this.hide() as it is now
    this.hide();

    container.appendChild(this.iframe);

    log("ATTACHING TO DOM...");
    log(this.screenFormatter.domAttachTarget);

    document
      .querySelector(this.screenFormatter.domAttachTarget)
      ?.appendChild(this.sidebarContainer);
  }

  hide = () => {
    this.sidebarContainer.classList.add("moduda-sidebar-hidden");
    this.sidebarContainer.classList.remove("moduda-sidebar--teasing");
    this.sidebarContainer.style.right = `${-1 *
      (SIDEBAR_WIDTH + SIDEBAR_PADDING_X * 2)}px`;
    if (this.screenFormatter) this.screenFormatter.adjustScreenView();
  };

  teaseSidebarContainer = () => {
    this.sidebarContainer.classList.add("moduda-sidebar--teasing");
    this.sidebarContainer.style.right = `${-1 *
      (SIDEBAR_WIDTH + SIDEBAR_PADDING_X * 2) +
      SIDEBAR_PADDING_X}px`;
  };

  show = () => {
    this.sidebarContainer.classList.remove("moduda-sidebar-hidden");
    this.sidebarContainer.removeEventListener("click", this.show);
    document.removeEventListener("mousemove", this.toggleBasedOnMouse);
    this.sidebarContainer.classList.remove("moduda-sidebar--teasing");
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
