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
import "../theme/index.less";
import createStore from "./store";

// get partyId if it exists
const searchParams = new URLSearchParams(window.location.search);
const partyId = searchParams.get("partyId") ?? undefined;

// set up Vue app
locale(lang);

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

const store = createStore(partyId);

new Vue({
  el: "#app",
  store,
  render: h => h(Sidebar)
});
