import Vue from "vue";
import Popup from "./Popup.vue";
import {
  locale,
  Button,
  Spin,
  Tabs,
  TabPane,
  Input,
  Icon,
  Divider,
  Alert
} from "iview";
import lang from "iview/dist/locale/en-US";
import "@/assets/styles/iview.less";

locale(lang);

Vue.component("Button", Button);
Vue.component("Spin", Spin);
Vue.component("Tabs", Tabs);
Vue.component("TabPane", TabPane);
Vue.component("Input", Input);
Vue.component("Icon", Icon);
Vue.component("Divider", Divider);
Vue.component("Alert", Alert);

new Vue({
  el: "#app",
  render: h => h(Popup)
});
