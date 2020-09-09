import Party from "@/sidebar/services/Party";
import { PartyEvent } from "@/sidebar/services/types";
import WS from "jest-websocket-mock";
import { Server } from "mock-socket";

describe("Party.ts", () => {
  let party: Party;
  let socket: WebSocket;
  let mockServer: WS;

  beforeEach(async () => {
    party = new Party("ws://localhost:8080");
    mockServer = new WS("ws://localhost:8080", {
      jsonProtocol: true
    });
  });

  afterEach(() => {
    WS.clean();
    party.destroy();
  });

  it("should set default id if not passed to constructor", () => {
    expect(party.id).toBe("default");
  });

  it("should set correct id if provided via the constructor", () => {
    const partyId = "test";
    party = new Party("ws://localhost:8080", partyId);
    expect(party.id).toBe(partyId);
  });

  it("should emit PartyEvent.CONNECTING event on connect()", () => {
    const onConnecting = jest.fn();
    party.on(PartyEvent.CONNECTING, onConnecting);
    party.connect();
    expect(onConnecting).toHaveBeenCalled();
  });

  it("should connect to websocket server", async () => {
    const onConnected = jest.fn();
    party.on(PartyEvent.CONNECTED, onConnected);
    party.connect();
    await mockServer.connected;
    expect(onConnected).toHaveBeenCalled();
  });
});
