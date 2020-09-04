import Vue from "vue";
import App from "./App.vue";
import { locale, Button, Tabs, TabPane } from "iview";
import lang from "iview/dist/locale/en-US";
import "iview/dist/styles/iview.css";

locale(lang);
Vue.component("Button", Button);
Vue.component("Tabs", Tabs);
Vue.component("TabPane", TabPane);

new Vue({
  el: "#app",
  render: (h) => h(App),
});
