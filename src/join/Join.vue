<template>
  <div id="join">
    <img
      src="icons/128.png"
      height="100"
      width="100"
      id="movens-img"
      alt="movens-icon"
      style="margin-top:-100px; margin-bottom: 20px;"
    />
    <h1>A few more things to do before we get started...</h1>
    <p class="subheader">You are trying to join party <b>creative-ents</b></p>
    <ol>
      <li>
        <p class="step-text">
          Enter a username for your party mates to see <b>(optional)</b>
        </p>
        <Input
          v-model="username"
          style="width: 200px;"
          placeholder="Enter username (optional)"
        />
      </li>
      <li v-if="!askUsernameOnly">
        <p class="step-text">
          Click the button below to grant permission for Movens to run on
          <b>www.youtube.com</b>
        </p>
        <Button @click="grantPermission" type="primary" long size="large" ghost>
          Grand permissions
        </Button>
      </li>
    </ol>
  </div>
</template>

<script lang="ts">
import { log } from "@/util/log";
import Vue from "vue";
import { RedirectRequestMessage } from "@/shared/types";

export default Vue.extend({
  name: "Popup",
  components: {},
  mounted: async function() {
    const urlParams = new URLSearchParams(window.location.search);
    // we call decodeURIComponent() here so that we don't get encoded version (e.g. party%id -> party-id)
    this.redirectUrl = decodeURIComponent(urlParams.get("redirectUrl") ?? "");
    console.log("REDIRECT TO ", this.redirectUrl);
    this.partyId = decodeURIComponent(urlParams.get("partyId") ?? "");

    if (!this.partyId || !this.redirectUrl) {
      console.error("party id and redirect url are both needed");
    }

    this.permissionUrl = `${new URL(this.redirectUrl).origin}/`; // includes port

    // first check if permissions already exist, if so only ask for username
    try {
      const permissionGranted: boolean = await browser.permissions.contains({
        origins: [this.permissionUrl]
      });
      if (permissionGranted) {
        // todo uncomment below
        // this.askUsernameOnly = true;
      }
    } catch (err) {
      log(err.message);
    }
  },
  data() {
    return {
      permissionUrl: "",
      redirectUrl: "",
      username: "",
      partyId: "",
      askUsernameOnly: false
    };
  },
  methods: {
    async grantPermission() {
      try {
        //await browser.permissions.remove({ origins: [this.permissionUrl] });
        const permissionGranted: boolean = await browser.permissions.request({
          origins: [this.permissionUrl]
        });

        if (permissionGranted) {
          const redirectMessage: RedirectRequestMessage = {
            type: "REDIRECT",
            payload: {
              redirectUrl: this.redirectUrl,
              partyId: this.partyId,
              username: this.username
            }
          };

          browser.runtime.sendMessage(redirectMessage);
        }
      } catch (err) {
        log(err.message);
      }
    }
  }
});
</script>

<style lang="less" scoped>
#join {
  height: 100vh;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgb(129, 95, 224);
  background: linear-gradient(
    174deg,
    rgba(129, 95, 224, 0.03307072829131656) 0%,
    rgba(227, 80, 54, 0.03587184873949583) 100%
  );
  position: relative;
}

.subheader {
  font-size: 1.3rem;
  margin-bottom: 1.3rem;
}

ol {
  list-style-type: none;
}

li {
  padding: 0.75rem 0rem;
}

.step-text {
  margin-top: 0.3rem;
  margin-bottom: 0.5rem;
}

// #movens-img {
//   position: absolute;
//   margin: 0 auto;
//   top: 100px;
// }
</style>
