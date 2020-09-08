import "../assets/styles/sidebar_wrapper.less";

class Sidebar {
  iframe: HTMLIFrameElement;

  constructor() {
    const iframe = document.createElement("iframe");
    iframe.style.border = "none";
    iframe.id = "movens-iframe";
    iframe.src = browser.runtime.getURL("sidebar.html");
    this.iframe = iframe;
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
  const sidebar = new Sidebar();
  sidebar.attachToDom();
  (window as any).partyLoaded = true;
};

if (/movens.app\/join\//.test(window.location.href)) {
  console.log("Redirect");
} else {
  if (!(window as any).partyLoaded) {
    initParty();
  }
}
