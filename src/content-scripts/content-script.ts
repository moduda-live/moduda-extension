import "../assets/styles/sidebar_wrapper.less";

class Sidebar {
  iframe: HTMLIFrameElement;

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
    this.iframe = iframe;
    this.attachToDom();
  }

  attachToDom() {
    const wrapper = document.createElement("div");
    wrapper.id = "movens-sidebar";
    wrapper.appendChild(this.iframe);
    document.body.appendChild(wrapper);
    const style = document.createElement("script");
    style.type = "text/javascript";
    style.src = browser.runtime.getURL("js/styles.js");
    document.head.appendChild(style);
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
