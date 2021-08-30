import _Vue from "vue";
import { Party } from "../models/Party";

declare module "vue/types/vue" {
  interface Vue {
    $party: Party;
    $test: any;
  }
}

declare module "vue/types/options" {
  interface ComponentOptions<V extends Vue> {
    party?: Party;
  }
}

export default {
  install(Vue: typeof _Vue) {
    Vue.mixin({
      beforeCreate() {
        const options = this.$options;
        if (options.party) this.$party = options.party;
        else if (options.parent && options.parent.$party)
          this.$party = options.parent.$party;
      }
    });
  }
};
