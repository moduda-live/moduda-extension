import Vue from "vue";
import Sidebar from "./Sidebar.vue";
import {
  locale,
  Switch,
  Card,
  CellGroup,
  Cell,
  Icon,
  Badge,
  Button,
  Spin,
  Input,
  Divider
} from "iview";
import lang from "iview/dist/locale/en-US";
import "@/assets/styles/iview.less";
import store from "./store";
import partyPlugin from "./plugins/partyPlugin";
import createParty from "./services/Party";
import ParentCommunicator from "./services/ParentCommunicator";

// get partyId if it exists
const searchParams = new URLSearchParams(window.location.search);
const partyId = searchParams.get("movensPartyId") ?? undefined;

// DEBUG
const debug = searchParams.get("debug") === "true";
if (debug) {
  const debugScript = document.createElement("script");

  debugScript.setAttribute("src", "http://localhost:8098");
  document.head.appendChild(debugScript);
}

// set up Vue app
locale(lang);

Vue.config.devtools = process.env.NODE_ENV === "development";

Vue.component("SwitchBtn", Switch);
Vue.component("Card", Card);
Vue.component("CellGroup", CellGroup);
Vue.component("Cell", Cell);
Vue.component("Icon", Icon);
Vue.component("Badge", Badge);
Vue.component("Button", Button);
Vue.component("Spin", Spin);
Vue.component("Input", Input);
Vue.component("Divider", Divider);

// custom party plugin
Vue.use(partyPlugin);
const parentCommunicator = new ParentCommunicator();
const party = createParty("ws://localhost:8080", parentCommunicator, {
  partyId,
  store
});

new Vue({
  el: "#app",
  party,
  store,
  render: h => h(Sidebar)
});
