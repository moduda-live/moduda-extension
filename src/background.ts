import {
  RedirectRequestMessage,
  ConnectedMessage,
  CreatePartyMessage,
  DisconnectedMessage
} from "./shared/types";
import { log } from "./util/log";

export interface MovensState {
  currentPartyId: string;
  previousPartyId: string;
  videolink: string;
  username: string;
  tabId: number | undefined;
  isConnecting: boolean;
}

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
  request: RedirectRequestMessage | ConnectedMessage | DisconnectedMessage,
  sender,
  sendResponse
) {
  switch (request.type) {
    case "DISCONNECTED": {
      // keep last used username and previous party id, but remove currentPartyId, videolink and tabId to indicate termination of session
      const storageGetResult = await browser.storage.local.get(
        "modudaCurrentState"
      );

      const currentState: MovensState = storageGetResult.modudaCurrentState;
      // todo: clean this up
      const previousPartyId = currentState
        ? currentState.previousPartyId || ""
        : "";
      const username = currentState ? currentState.username || "" : "";

      const terminatedState: MovensState = {
        currentPartyId: "",
        previousPartyId,
        username,
        videolink: "",
        tabId: undefined,
        isConnecting: false
      };

      await browser.storage.local.set({
        modudaCurrentState: terminatedState
      });
      break;
    }
    case "CONNECTED": {
      await new Promise((resolve, reject) => setTimeout(resolve, 2000));
      // persist the current party state to storage
      const modudaCurrentState: MovensState = {
        currentPartyId: request.payload.partyId,
        previousPartyId: request.payload.partyId,
        videolink: request.payload.videolink,
        username: request.payload.username,
        tabId: sender.tab?.id,
        isConnecting: false
      };

      await browser.storage.local.set({
        modudaCurrentState: modudaCurrentState
      });
      log("Saved current state of the extension");
      break;
    }
    case "REDIRECT": {
      const redirectUrl = request.payload.redirectUrl;
      const username = request.payload.username;
      const partyId = request.payload.partyId;

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
