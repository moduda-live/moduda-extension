import Vue from "vue";
import Join from "./Join.vue";
import { locale, Button, Input } from "iview";
import lang from "iview/dist/locale/en-US";
import "@/assets/styles/iview.less";

locale(lang);

Vue.component("Button", Button);
Vue.component("Input", Input);

new Vue({
  el: "#app",
  render: h => h(Join)
});
