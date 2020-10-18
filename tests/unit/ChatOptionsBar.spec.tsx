import ChatOptionsBar from "@/sidebar/components/text-chat/ChatOptionsBar.vue";
import { mount, createLocalVue, Wrapper } from "@vue/test-utils";
import { Icon } from "iview";
import Vuex from "vuex";

describe("ChatOptionsBar.vue", () => {
  let wrapper: Wrapper<InstanceType<typeof ChatOptionsBar> & {
    [key: string]: any;
  }>;
  const localVue = createLocalVue();
  localVue.use(Vuex);
  localVue.component("Icon", Icon);

  let store: any;
  let mutations: any;

  beforeEach(() => {
    mutations = {
      CLEAR_CHAT: jest.fn(),
      SHOW_CHAT: jest.fn(),
      HIDE_CHAT: jest.fn()
    };
    store = new Vuex.Store({
      mutations
    });
    wrapper = mount(ChatOptionsBar, {
      localVue,
      store
    });
  });

  afterEach(() => {
    wrapper.destroy();
  });

  it("should render 4 options", () => {
    const optionIcons = wrapper.findAllComponents(Icon);
    expect(optionIcons.length).toBe(4);
  });

  it("should commit a CLEAR_CHAT mutation when clearChat icon is clicked", () => {
    const btn = wrapper.findComponent({ ref: "clearChat" });
    btn.trigger("click");
    expect(mutations.CLEAR_CHAT).toHaveBeenCalled();
  });

  describe("hide/show chat", () => {
    it("should commit a HIDE_CHAT mutation when hideChat icon is clicked", () => {
      const btn = wrapper.findComponent({ ref: "hideChat" });
      btn.trigger("click");
      expect(mutations.HIDE_CHAT).toHaveBeenCalled();
    });

    it("should commit a SHOW_CHAT mutation when showChat icon is clicked", () => {
      const showChatIcon = wrapper.findComponent({ ref: "showChat" });
      showChatIcon.trigger("click");
      expect(mutations.SHOW_CHAT).toHaveBeenCalled();
    });
  });
});
