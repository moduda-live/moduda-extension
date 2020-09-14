import "@/assets/styles/sidebar.less";
import { connectToChild } from "penpal";
import { AsyncMethodReturns, CallSender } from "penpal/lib/types";

class Sidebar {
  iframe: HTMLIFrameElement;
  iframeConnection!: AsyncMethodReturns<CallSender, string>;

  constructor(videolink: string, partyId?: string) {
    const iframe = document.createElement("iframe");
    iframe.style.border = "none";
    iframe.id = "movens-iframe";
    const url = new URL(browser.runtime.getURL("sidebar.html"));
    url.searchParams.append("videolink", videolink);
    if (partyId) {
      url.searchParams.append("partyId", partyId);
    }
    iframe.src = url.toString();
    iframe.allow = "microphone";
    this.iframe = iframe;
    this.setUpIframeConnection();
    this.attachToDom();
  }

  attachToDom() {
    const container = document.createElement("div");
    container.id = "movens-sidebar";
    container.appendChild(this.iframe);
    document.body.appendChild(container);
  }

  setUpIframeConnection() {
    const connection = connectToChild({
      iframe: this.iframe,
      childOrigin: browser.runtime.getURL("").slice(0, -1), // hacky workaround to make penpal work
      methods: {
        // TOOD: Implement parent methods
      }
    });
    connection.promise.then(child => {
      this.iframeConnection = child;
    });
  }
}

const initParty = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const partyId = searchParams.get("movensPartyId") ?? undefined;
  searchParams.delete("movensPartyId");
  const videolinkNoParams = window.location.href.split(/[?#]/)[0];
  const videolink = videolinkNoParams + searchParams.toString();
  new Sidebar(videolink, partyId);
  (window as any).partyLoaded = true;
};

if (/movens.app\/join\//.test(window.location.href)) {
  console.log("Redirect");
} else {
  if (!(window as any).partyLoaded) {
    initParty();
  }
}
