import {
  RedirectRequestMessage,
  ConnectedMessage,
  CreatePartyMessage
} from "./shared/types";
import { log } from "./util/log";

interface ChangeInfo {
  attention?: boolean;
  audible?: boolean;
  discarded?: boolean;
  favIconUrl?: string;
  hidden?: boolean;
  isArticle?: boolean;
  mutedInfo?: any;
  pinned?: boolean;
  sharingState?: any;
  status?: string;
  title?: string;
  url?: string;
}

type TCallback = (
  tabId: number,
  changeInfo: ChangeInfo,
  tab: browser.tabs.Tab
) => void;

function launchContentScriptWhenTabLoaded(
  username: string,
  partyId: string,
  desiredId: number
): TCallback {
  async function test(
    tabId: number,
    changeInfo: ChangeInfo,
    tab: browser.tabs.Tab
  ) {
    if (tabId !== desiredId) return;

    if (changeInfo.status !== "complete") {
      return;
    }

    await browser.tabs.executeScript(tab!.id!, {
      file: "js/content-script.js"
    });

    const createPartyMessage: CreatePartyMessage = {
      type: "CREATE_PARTY",
      payload: {
        username,
        partyId
      }
    };

    try {
      await browser.tabs.sendMessage(tab!.id!, createPartyMessage);
    } finally {
      browser.tabs.onUpdated.removeListener(test);
    }
  }

  return test;
}

browser.runtime.onMessage.addListener(async function(
  request: RedirectRequestMessage | ConnectedMessage,
  sender,
  sendResponse
) {
  switch (request.type) {
    case "CONNECTED": {
      browser.runtime.sendMessage({
        type: request.type
      });
      break;
    }
    case "REDIRECT": {
      const redirectUrl = request.payload.redirectUrl;
      const username = request.payload.username;
      const partyId = request.payload.partyId;

      console.log(
        `url: ${redirectUrl} | username: ${username} | pid: ${partyId}`
      );
      console.log("SENDER ID: ", sender.tab?.id);

      if (sender.tab?.id) {
        try {
          const tab = await browser.tabs.update(sender.tab.id, {
            url: redirectUrl
          });

          // launch once updated
          browser.tabs.onUpdated.addListener(
            launchContentScriptWhenTabLoaded(username, partyId, tab!.id!)
          );
        } catch (err) {
          log("Could not launch content script to join party...");
          log(err.message);
        }
      }
      break;
    }
    default: {
      log(`Unrecognised message received: ${JSON.stringify(request)}`);
    }
  }
});
