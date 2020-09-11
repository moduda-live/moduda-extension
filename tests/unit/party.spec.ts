import { Party } from "@/sidebar/services/Party";
import { PartyEvent } from "@/sidebar/services/types";
import WS from "jest-websocket-mock";
import short from "short-uuid";
import CommunicatorMock from "@/sidebar/services/ParentCommunicator";

jest.mock("@/sidebar/services/ParentCommunicator");

function setUpParty(partyId?: string) {
  const mockedParent = new CommunicatorMock();
  console.log(mockedParent.forwardPause());
  const party = new Party("ws://localhost:8080", mockedParent, partyId);
  return party;
}

describe("Party.ts", () => {
  let mockServer: WS;

  beforeEach(() => {
    mockServer = new WS("ws://localhost:8080", {
      jsonProtocol: true
    });
  });

  afterEach(() => {
    WS.clean();
  });

  it("should set default id if not passed to constructor", () => {
    const party = setUpParty();
    expect(party.id).not.toBeUndefined();
  });

  it("should set correct id if provided via the constructor", () => {
    const partyId = "test";
    const party = setUpParty(partyId);
    expect(party.id).toBe(partyId);
  });

  describe("after connect()", () => {
    it("should emit PartyEvent.CONNECTING event", () => {
      const party = setUpParty();
      const onConnecting = jest.fn();
      party.on(PartyEvent.CONNECTING, onConnecting);
      party.connect();
      expect(onConnecting).toHaveBeenCalled();
    });

    it("should connect to websocket server", async () => {
      const party = setUpParty();
      const onConnected = jest.fn();
      party.on(PartyEvent.CONNECTED, onConnected);
      party.connect();
      await mockServer.connected;
      expect(onConnected).toHaveBeenCalled();
    });

    it("should emit PartyEvent.SET_USER_ID after receiving uuid from server", async () => {
      const party = setUpParty();
      const onSetUserId = jest.fn();
      party.on(PartyEvent.SET_USER_ID, onSetUserId);
      party.connect();
      await mockServer.connected;
      const userId = short.uuid();
      mockServer.send({
        type: "userId",
        payload: {
          userId
        }
      });
      expect(onSetUserId).toHaveBeenCalledWith(userId);
    });

    it("should send 'getCurrentPartyUsers' message to websocket server after receiving userId from server", async () => {
      const party = setUpParty();
      party.connect();
      await mockServer.connected;
      mockServer.send({
        type: "userId",
        payload: {
          userId: short.uuid()
        }
      });
      await expect(mockServer).toReceiveMessage({
        type: "getCurrentPartyUsers",
        payload: {
          partyId: party.id
        }
      });
    });
  });
});
