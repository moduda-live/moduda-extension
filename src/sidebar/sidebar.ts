import Vue from "vue";
import Sidebar from "./Sidebar.vue";
import { locale, Switch, Card, CellGroup, Cell, Poptip, Icon, Badge, Button, Spin, Input, Divider } from "iview";
import lang from "iview/dist/locale/en-US";
import "../theme/index.less";

locale(lang);

Vue.component("SwitchBtn", Switch);
Vue.component("Card", Card);
Vue.component("CellGroup", CellGroup);
Vue.component("Cell", Cell);
Vue.component("Poptip",Poptip);
Vue.component("Icon", Icon);
Vue.component("Badge", Badge);
Vue.component("Button", Button);
Vue.component("Spin", Spin);
Vue.component("Input", Input);
Vue.component("Divider", Divider);

new Vue({
  el: "#app",
  render: (h) => h(Sidebar),
});
