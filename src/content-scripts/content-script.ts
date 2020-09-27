import "@/assets/styles/sidebar.less";
import { connectToChild } from "penpal";
import { AsyncMethodReturns, CallSender } from "penpal/lib/types";

class Sidebar {
  iframe: HTMLIFrameElement;
  iframeConnection!: AsyncMethodReturns<CallSender, string>;

  constructor(
    username: string,
    videolink: string,
    debug: boolean,
    partyId?: string
  ) {
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
    this.setUpIframeConnection(username);
    this.attachToDom();
  }

  attachToDom() {
    const container = document.createElement("div");
    container.id = "movens-sidebar";
    container.appendChild(this.iframe);
    document.body.appendChild(container);
  }

  setUpIframeConnection(username: string) {
    const connection = connectToChild({
      iframe: this.iframe,
      childOrigin: browser.runtime.getURL("").slice(0, -1), // hacky workaround to make penpal work
      methods: {
        // TODO: Implement parent methods
        getUsername() {
          return username;
        }
      }
    });
    connection.promise.then(child => {
      this.iframeConnection = child;
    });
  }
}

const initParty = (username: string) => {
  const searchParams = new URLSearchParams(window.location.search);

  const partyId = searchParams.get("movensPartyId") ?? undefined;
  searchParams.delete("movensPartyId");

  let debug = false;
  if (process.env.NODE_ENV === "development") {
    // FOR DEBUGGING ONLY
    // SPECIFY debug param to bring up devtools
    debug = !!searchParams.get("debug");
    searchParams.delete("debug");
  }

  const videolinkNoParams = window.location.href.split(/[?#]/)[0];
  const videolink = videolinkNoParams + searchParams.toString();
  new Sidebar(username, videolink, debug, partyId);
  (window as any).partyLoaded = true;
};

browser.runtime.onMessage.addListener(message => {
  if (message.username && !(window as any).partyLoaded) {
    initParty(message.username);
  }
});

if (/movens.app\/join\//.test(window.location.href)) {
  console.log("Redirect");
}
