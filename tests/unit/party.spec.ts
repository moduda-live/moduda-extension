import { Party } from "@/main-app/models/Party";
import { PartyEvent } from "@/main-app/models/types";
import WS from "jest-websocket-mock";
import short from "short-uuid";
import CommunicatorMock from "@/main-app/models/ParentCommunicator";
import { OtherUser } from "@/main-app/models/User";
import Peer from "simple-peer";

jest.mock("@/sidebar/models/ParentCommunicator");
jest.mock("simple-peer");
// jest.mock("@/sidebar/services/User", () => ({
//   __esModule: true,
//   OwnUser: jest.fn(() => {
//     return {
//       stream: "stream"
//     };
//   }),
//   OtherUser: jest.fn(() => {
//     return {
//       stream: "stream"
//     };
//   })
// }));

function setUpParty(partyId?: string, userIdToAdd?: string) {
  const mockedParent: jest.Mocked<CommunicatorMock> = new CommunicatorMock() as any;
  const party = new Party("ws://localhost:8080", mockedParent, partyId);
  if (userIdToAdd) {
    const otherUser = new OtherUser(
      userIdToAdd,
      "mockedUsername",
      party,
      new Peer(),
      false
    );
    otherUser.setIsAdmin(false);
    party.users.set(userIdToAdd, otherUser);
  }
  return party;
}

describe("Party.ts", () => {
  let mockServer: WS;

  describe("before connect()", () => {
    it("should set default id if not passed to constructor", () => {
      const party = setUpParty();
      expect(party.id).not.toBeUndefined();
    });

    it("should set correct id if provided via the constructor", () => {
      const partyId = "test";
      const party = setUpParty(partyId);
      expect(party.id).toBe(partyId);
    });
  });

  describe("after connect()", () => {
    beforeAll(() => {
      (global as any).Peer = jest.fn();
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    beforeEach(() => {
      mockServer = new WS("ws://localhost:8080", {
        jsonProtocol: true
      });
    });

    afterEach(() => {
      WS.clean();
    });

    it("should emit PartyEvent.CONNECTING event", async () => {
      const party = setUpParty();
      const onConnecting = jest.fn();
      party.on(PartyEvent.CONNECTING, onConnecting);
      await party.connect();
      expect(onConnecting).toHaveBeenCalled();
    });

    it("should connect to websocket server", async () => {
      const party = setUpParty();
      const onConnected = jest.fn();
      party.on(PartyEvent.CONNECTED, onConnected);
      await party.connect();
      await mockServer.connected;
      expect(onConnected).toHaveBeenCalled();
    });

    it("should emit PartyEvent.SET_USER_ID after receiving uuid from server", async () => {
      const party = setUpParty();
      const onSetUserId = jest.fn();
      party.on(PartyEvent.SET_MY_USER_ID, onSetUserId);
      await party.connect();
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
      await party.connect();
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
          partyId: party.id,
          username: undefined
        }
      });
    });

    it("should emit PartyEvent.SET_USERS with the own user and list of current party users received from server", async () => {
      const party = setUpParty();
      const onSetUsers = jest.fn();
      party.on(PartyEvent.SET_USERS, onSetUsers);
      await party.connect();
      await mockServer.connected;
      // first send fake userId to init own user
      const fakeOwnUserId = short.uuid();
      mockServer.send({
        type: "userId",
        payload: {
          userId: fakeOwnUserId
        }
      });
      mockServer.send({
        type: "currentPartyUsers",
        payload: {
          users: [1, 2, 3].map(number => {
            return JSON.stringify({
              userId: `userId${number}`,
              username: `username${number}`,
              isAdmin: (number === 1).toString(),
              isRoomOwner: (number === 1).toString()
            });
          })
        }
      });

      const expectedUsers: any = {
        [fakeOwnUserId]: expect.objectContaining({
          id: fakeOwnUserId,
          username: undefined, // parentCommunicator mock doesnt mock getUsername()
          isAdmin: false,
          isOwn: true,
          isRoomOwner: false
        })
      };
      [1, 2, 3].forEach((number: number) => {
        expectedUsers[`userId${number}`] = expect.objectContaining({
          id: `userId${number}`,
          username: `username${number}`,
          isAdmin: number === 1,
          isOwn: false,
          isRoomOwner: number === 1
        });
      });
      expect(onSetUsers.mock.calls[0][0]).toMatchObject(expectedUsers);
    });

    it("should emit PartyEvent.USER_JOINED if the server sends a new foreign signal from an unregistered user", async () => {
      const party = setUpParty();
      const onUserJoined = jest.fn();
      party.on(PartyEvent.USER_JOINED, onUserJoined);
      await party.connect();
      await mockServer.connected;
      mockServer.send({
        type: "newForeignSignal",
        payload: {
          senderId: "userId1",
          username: "username1",
          signal: "signalFromUser1"
        }
      });
      expect(onUserJoined).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "userId1",
          username: "username1",
          isOwn: false,
          isAdmin: false
        })
      );
    });

    it("should emit PartyEvent.USER_JOINED if the server sends a new foreign signal for a registerd user", async () => {
      const party = setUpParty(undefined, "user1");
      const onUserJoined = jest.fn();
      party.on(PartyEvent.USER_JOINED, onUserJoined);
      await party.connect();
      await mockServer.connected;
      mockServer.send({
        type: "newForeignSignal",
        payload: {
          senderId: "user1",
          username: "mockedUsername",
          signal: "signalFromUser1"
        }
      });
      expect(onUserJoined).not.toHaveBeenCalled();
    });

    it("should send 'broadcastMessage' message to websocket server after sendChatMessage() ", async () => {
      const party = setUpParty();
      await party.connect();
      await mockServer.connected;

      party.sendChatMessage("testUserId", "TestContent");
      await expect(mockServer).toReceiveMessage({
        type: "broadcastMessage",
        payload: {
          senderId: "testUserId",
          content: "TestContent"
        }
      });
    });
  });
});
