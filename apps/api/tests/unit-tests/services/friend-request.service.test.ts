import { beforeEach, describe, expect, it, vi } from "vitest";
import { FriendRequestStatus } from "@interview-os/database";
import { FriendRequestService } from "../../../src/services/friend-request.service";

describe("FriendRequestService", () => {
  let service: FriendRequestService;
  let friendRequestRepository: any;
  let userRepository: any;

  const sender = {
    id: "user-1",
  };

  const receiver = {
    id: "user-2",
  };

  const friendRequest = {
    id: "friend-request-1",
    senderId: "user-1",
    receiverId: "user-2",
    status: FriendRequestStatus.PENDING,
    createdAt: new Date("2026-01-01T10:00:00.000Z"),
    updatedAt: new Date("2026-01-01T10:00:00.000Z"),
    respondedAt: null,
  };

  beforeEach(() => {
    friendRequestRepository = {
      getAcceptedFriendRequestsByUserId: vi.fn(),
      createFriendRequest: vi.fn(),
      findById: vi.fn(),
      updateFriendRequest: vi.fn(),
      deleteFriendRequest: vi.fn(),
      getSentFriendRequestsByUserId: vi.fn(),
      getReceivedFriendRequestsByUserId: vi.fn(),
      getAllFriendsByUserId: vi.fn(),
      getFriendRequestBySenderAndReceiver: vi.fn(),
    };

    userRepository = {
      findById: vi.fn(),
    };

    service = new FriendRequestService(friendRequestRepository, userRepository);
  });

  describe("getAcceptedFriendRequestsByUser", () => {
    it("returns accepted friend requests for the given user", async () => {
      const requests = [{ ...friendRequest, status: FriendRequestStatus.ACCEPTED }];

      friendRequestRepository.getAcceptedFriendRequestsByUserId.mockResolvedValue(requests);

      await expect(service.getAcceptedFriendRequestsByUser("user-1")).resolves.toEqual(requests);

      expect(
        friendRequestRepository.getAcceptedFriendRequestsByUserId,
      ).toHaveBeenCalledExactlyOnceWith("user-1");
    });

    it("returns an empty array when the user has no accepted requests", async () => {
      friendRequestRepository.getAcceptedFriendRequestsByUserId.mockResolvedValue([]);

      await expect(service.getAcceptedFriendRequestsByUser("user-1")).resolves.toEqual([]);
    });

    it("propagates repository errors", async () => {
      const error = new Error("Database error");

      friendRequestRepository.getAcceptedFriendRequestsByUserId.mockRejectedValue(error);

      await expect(service.getAcceptedFriendRequestsByUser("user-1")).rejects.toThrow(error);
    });
  });

  describe("sendFriendRequest", () => {
    beforeEach(() => {
      userRepository.findById.mockResolvedValueOnce(sender).mockResolvedValueOnce(receiver);

      friendRequestRepository.getFriendRequestBySenderAndReceiver.mockResolvedValue(null);

      friendRequestRepository.createFriendRequest.mockResolvedValue(friendRequest);
    });

    it("creates a friend request when both users exist and no request exists", async () => {
      await expect(service.sendFriendRequest("user-1", "user-2")).resolves.toEqual(friendRequest);

      expect(userRepository.findById).toHaveBeenNthCalledWith(1, "user-1");
      expect(userRepository.findById).toHaveBeenNthCalledWith(2, "user-2");

      expect(friendRequestRepository.getFriendRequestBySenderAndReceiver).toHaveBeenNthCalledWith(
        1,
        "user-1",
        "user-2",
      );

      expect(friendRequestRepository.getFriendRequestBySenderAndReceiver).toHaveBeenNthCalledWith(
        2,
        "user-2",
        "user-1",
      );

      expect(friendRequestRepository.createFriendRequest).toHaveBeenCalledExactlyOnceWith(
        "user-1",
        "user-2",
      );
    });

    it("rejects sending a friend request to oneself", async () => {
      await expect(service.sendFriendRequest("user-1", "user-1")).rejects.toMatchObject({
        statusCode: 400,
        code: "SELF_FRIEND_REQUEST",
        message: "Cannot send a friend request to yourself",
      });

      expect(userRepository.findById).not.toHaveBeenCalled();
      expect(friendRequestRepository.createFriendRequest).not.toHaveBeenCalled();
    });

    it("throws when the sender does not exist", async () => {
      userRepository.findById.mockReset();
      userRepository.findById.mockResolvedValueOnce(null);

      await expect(service.sendFriendRequest("missing-user", "user-2")).rejects.toMatchObject({
        statusCode: 403,
        code: "UNAUTHORIZED",
      });

      expect(userRepository.findById).toHaveBeenCalledExactlyOnceWith("missing-user");
      expect(friendRequestRepository.getFriendRequestBySenderAndReceiver).not.toHaveBeenCalled();
      expect(friendRequestRepository.createFriendRequest).not.toHaveBeenCalled();
    });

    it("throws when the receiver does not exist", async () => {
      userRepository.findById.mockReset();
      userRepository.findById.mockResolvedValueOnce(sender).mockResolvedValueOnce(null);

      await expect(service.sendFriendRequest("user-1", "missing-user")).rejects.toMatchObject({
        statusCode: 404,
        code: "RECEIVER_NOT_FOUND",
      });

      expect(friendRequestRepository.getFriendRequestBySenderAndReceiver).not.toHaveBeenCalled();
      expect(friendRequestRepository.createFriendRequest).not.toHaveBeenCalled();
    });

    it("rejects when a request already exists in the same direction", async () => {
      friendRequestRepository.getFriendRequestBySenderAndReceiver.mockResolvedValueOnce(
        friendRequest,
      );

      await expect(service.sendFriendRequest("user-1", "user-2")).rejects.toMatchObject({
        statusCode: 409,
        code: "FRIEND_REQUEST_ALREADY_EXISTS",
      });

      expect(
        friendRequestRepository.getFriendRequestBySenderAndReceiver,
      ).toHaveBeenCalledExactlyOnceWith("user-1", "user-2");

      expect(friendRequestRepository.createFriendRequest).not.toHaveBeenCalled();
    });

    it("rejects when a request already exists in the opposite direction", async () => {
      friendRequestRepository.getFriendRequestBySenderAndReceiver
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          ...friendRequest,
          senderId: "user-2",
          receiverId: "user-1",
        });

      await expect(service.sendFriendRequest("user-1", "user-2")).rejects.toMatchObject({
        statusCode: 409,
        code: "FRIEND_REQUEST_ALREADY_EXISTS",
      });

      expect(friendRequestRepository.getFriendRequestBySenderAndReceiver).toHaveBeenNthCalledWith(
        2,
        "user-2",
        "user-1",
      );

      expect(friendRequestRepository.createFriendRequest).not.toHaveBeenCalled();
    });
  });

  describe("cancelFriendRequest", () => {
    it("cancels a pending request sent by the requester", async () => {
      const cancelledRequest = {
        ...friendRequest,
        status: FriendRequestStatus.CANCELLED,
      };

      friendRequestRepository.findById.mockResolvedValue(friendRequest);
      friendRequestRepository.updateFriendRequest.mockResolvedValue(cancelledRequest);

      await expect(service.cancelFriendRequest("friend-request-1", "user-1")).resolves.toEqual(
        cancelledRequest,
      );

      expect(friendRequestRepository.findById).toHaveBeenCalledExactlyOnceWith("friend-request-1");

      expect(friendRequestRepository.updateFriendRequest).toHaveBeenCalledExactlyOnceWith(
        "friend-request-1",
        {
          status: FriendRequestStatus.CANCELLED,
        },
      );
    });

    it("throws when the friend request does not exist", async () => {
      friendRequestRepository.findById.mockResolvedValue(null);

      await expect(service.cancelFriendRequest("missing-request", "user-1")).rejects.toMatchObject({
        statusCode: 404,
        code: "FRIEND_REQUEST_NOT_FOUND",
      });

      expect(friendRequestRepository.updateFriendRequest).not.toHaveBeenCalled();
    });

    it("rejects a requester who is not the sender", async () => {
      friendRequestRepository.findById.mockResolvedValue(friendRequest);

      await expect(service.cancelFriendRequest("friend-request-1", "user-2")).rejects.toMatchObject(
        {
          statusCode: 403,
          code: "UNAUTHORIZED",
        },
      );

      expect(friendRequestRepository.updateFriendRequest).not.toHaveBeenCalled();
    });

    it.each([
      FriendRequestStatus.ACCEPTED,
      FriendRequestStatus.REJECTED,
      FriendRequestStatus.CANCELLED,
    ])("rejects cancellation when the status is %s", async (status) => {
      friendRequestRepository.findById.mockResolvedValue({
        ...friendRequest,
        status,
      });

      await expect(service.cancelFriendRequest("friend-request-1", "user-1")).rejects.toMatchObject(
        {
          statusCode: 400,
          code: "FRIEND_REQUEST_STATUS_NOT_PENDING",
        },
      );

      expect(friendRequestRepository.updateFriendRequest).not.toHaveBeenCalled();
    });
  });

  describe("acceptFriendRequest", () => {
    it("accepts a pending request received by the requester", async () => {
      const acceptedRequest = {
        ...friendRequest,
        status: FriendRequestStatus.ACCEPTED,
        respondedAt: new Date(),
      };

      friendRequestRepository.findById.mockResolvedValue(friendRequest);
      friendRequestRepository.updateFriendRequest.mockResolvedValue(acceptedRequest);

      const result = await service.acceptFriendRequest("friend-request-1", "user-2");

      expect(result).toEqual(acceptedRequest);

      expect(friendRequestRepository.updateFriendRequest).toHaveBeenCalledExactlyOnceWith(
        "friend-request-1",
        expect.objectContaining({
          status: FriendRequestStatus.ACCEPTED,
          respondedAt: expect.any(Date),
        }),
      );
    });

    it("throws when the friend request does not exist", async () => {
      friendRequestRepository.findById.mockResolvedValue(null);

      await expect(service.acceptFriendRequest("missing-request", "user-2")).rejects.toMatchObject({
        statusCode: 404,
        code: "FRIEND_REQUEST_NOT_FOUND",
      });

      expect(friendRequestRepository.updateFriendRequest).not.toHaveBeenCalled();
    });

    it("rejects a requester who is not the receiver", async () => {
      friendRequestRepository.findById.mockResolvedValue(friendRequest);

      await expect(service.acceptFriendRequest("friend-request-1", "user-1")).rejects.toMatchObject(
        {
          statusCode: 403,
          code: "UNAUTHORIZED",
        },
      );

      expect(friendRequestRepository.updateFriendRequest).not.toHaveBeenCalled();
    });

    it.each([
      FriendRequestStatus.ACCEPTED,
      FriendRequestStatus.REJECTED,
      FriendRequestStatus.CANCELLED,
    ])("rejects acceptance when the status is %s", async (status) => {
      friendRequestRepository.findById.mockResolvedValue({
        ...friendRequest,
        status,
      });

      await expect(service.acceptFriendRequest("friend-request-1", "user-2")).rejects.toMatchObject(
        {
          statusCode: 400,
          code: "FRIEND_REQUEST_STATUS_NOT_PENDING",
        },
      );

      expect(friendRequestRepository.updateFriendRequest).not.toHaveBeenCalled();
    });
  });

  describe("rejectFriendRequest", () => {
    it("rejects a pending request received by the requester", async () => {
      const rejectedRequest = {
        ...friendRequest,
        status: FriendRequestStatus.REJECTED,
        respondedAt: new Date(),
      };

      friendRequestRepository.findById.mockResolvedValue(friendRequest);
      friendRequestRepository.updateFriendRequest.mockResolvedValue(rejectedRequest);

      const result = await service.rejectFriendRequest("friend-request-1", "user-2");

      expect(result).toEqual(rejectedRequest);

      expect(friendRequestRepository.updateFriendRequest).toHaveBeenCalledExactlyOnceWith(
        "friend-request-1",
        expect.objectContaining({
          status: FriendRequestStatus.REJECTED,
          respondedAt: expect.any(Date),
        }),
      );
    });

    it("throws when the friend request does not exist", async () => {
      friendRequestRepository.findById.mockResolvedValue(null);

      await expect(service.rejectFriendRequest("missing-request", "user-2")).rejects.toMatchObject({
        statusCode: 404,
        code: "FRIEND_REQUEST_NOT_FOUND",
      });

      expect(friendRequestRepository.updateFriendRequest).not.toHaveBeenCalled();
    });

    it("rejects a requester who is not the receiver", async () => {
      friendRequestRepository.findById.mockResolvedValue(friendRequest);

      await expect(service.rejectFriendRequest("friend-request-1", "user-1")).rejects.toMatchObject(
        {
          statusCode: 403,
          code: "UNAUTHORIZED",
        },
      );

      expect(friendRequestRepository.updateFriendRequest).not.toHaveBeenCalled();
    });

    it.each([
      FriendRequestStatus.ACCEPTED,
      FriendRequestStatus.REJECTED,
      FriendRequestStatus.CANCELLED,
    ])("rejects rejection when the status is %s", async (status) => {
      friendRequestRepository.findById.mockResolvedValue({
        ...friendRequest,
        status,
      });

      await expect(service.rejectFriendRequest("friend-request-1", "user-2")).rejects.toMatchObject(
        {
          statusCode: 400,
          code: "FRIEND_REQUEST_STATUS_NOT_PENDING",
        },
      );

      expect(friendRequestRepository.updateFriendRequest).not.toHaveBeenCalled();
    });
  });

  describe("unFriend", () => {
    it("removes an accepted friendship when the sender requests it", async () => {
      const acceptedRequest = {
        ...friendRequest,
        status: FriendRequestStatus.ACCEPTED,
      };

      friendRequestRepository.findById.mockResolvedValue(acceptedRequest);
      friendRequestRepository.deleteFriendRequest.mockResolvedValue(acceptedRequest);

      await expect(service.unFriend("friend-request-1", "user-1")).resolves.toEqual(
        acceptedRequest,
      );

      expect(friendRequestRepository.deleteFriendRequest).toHaveBeenCalledExactlyOnceWith(
        "friend-request-1",
      );
    });

    it("removes an accepted friendship when the receiver requests it", async () => {
      friendRequestRepository.findById.mockResolvedValue({
        ...friendRequest,
        status: FriendRequestStatus.ACCEPTED,
      });

      friendRequestRepository.deleteFriendRequest.mockResolvedValue(friendRequest);

      await service.unFriend("friend-request-1", "user-2");

      expect(friendRequestRepository.deleteFriendRequest).toHaveBeenCalledExactlyOnceWith(
        "friend-request-1",
      );
    });

    it("throws when the friend request does not exist", async () => {
      friendRequestRepository.findById.mockResolvedValue(null);

      await expect(service.unFriend("missing-request", "user-1")).rejects.toMatchObject({
        statusCode: 404,
        code: "FRIEND_REQUEST_NOT_FOUND",
      });

      expect(friendRequestRepository.deleteFriendRequest).not.toHaveBeenCalled();
    });

    it("rejects a requester who is neither the sender nor the receiver", async () => {
      friendRequestRepository.findById.mockResolvedValue({
        ...friendRequest,
        status: FriendRequestStatus.ACCEPTED,
      });

      await expect(service.unFriend("friend-request-1", "user-3")).rejects.toMatchObject({
        statusCode: 403,
        code: "UNAUTHORIZED",
      });

      expect(friendRequestRepository.deleteFriendRequest).not.toHaveBeenCalled();
    });

    it.each([
      FriendRequestStatus.PENDING,
      FriendRequestStatus.REJECTED,
      FriendRequestStatus.CANCELLED,
    ])("rejects removal when the request status is %s", async (status) => {
      friendRequestRepository.findById.mockResolvedValue({
        ...friendRequest,
        status,
      });

      await expect(service.unFriend("friend-request-1", "user-1")).rejects.toMatchObject({
        statusCode: 400,
        code: "NOT_FRIENDS_ALREADY",
      });

      expect(friendRequestRepository.deleteFriendRequest).not.toHaveBeenCalled();
    });
  });

  describe("getSentFriendRequestsByUser", () => {
    it("returns sent requests when the user exists", async () => {
      const requests = [friendRequest];

      userRepository.findById.mockResolvedValue(sender);
      friendRequestRepository.getSentFriendRequestsByUserId.mockResolvedValue(requests);

      await expect(service.getSentFriendRequestsByUser("user-1")).resolves.toEqual(requests);

      expect(userRepository.findById).toHaveBeenCalledExactlyOnceWith("user-1");

      expect(friendRequestRepository.getSentFriendRequestsByUserId).toHaveBeenCalledExactlyOnceWith(
        "user-1",
      );
    });

    it("throws when the user does not exist", async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.getSentFriendRequestsByUser("missing-user")).rejects.toMatchObject({
        statusCode: 404,
        code: "USER_NOT_FOUND",
      });

      expect(friendRequestRepository.getSentFriendRequestsByUserId).not.toHaveBeenCalled();
    });

    it("returns an empty array when no requests have been sent", async () => {
      userRepository.findById.mockResolvedValue(sender);
      friendRequestRepository.getSentFriendRequestsByUserId.mockResolvedValue([]);

      await expect(service.getSentFriendRequestsByUser("user-1")).resolves.toEqual([]);
    });
  });

  describe("getReceivedFriendRequestsByUser", () => {
    it("returns received requests when the user exists", async () => {
      const requests = [friendRequest];

      userRepository.findById.mockResolvedValue(receiver);
      friendRequestRepository.getReceivedFriendRequestsByUserId.mockResolvedValue(requests);

      await expect(service.getReceivedFriendRequestsByUser("user-2")).resolves.toEqual(requests);

      expect(userRepository.findById).toHaveBeenCalledExactlyOnceWith("user-2");

      expect(
        friendRequestRepository.getReceivedFriendRequestsByUserId,
      ).toHaveBeenCalledExactlyOnceWith("user-2");
    });

    it("throws when the user does not exist", async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.getReceivedFriendRequestsByUser("missing-user")).rejects.toMatchObject({
        statusCode: 404,
        code: "USER_NOT_FOUND",
      });

      expect(friendRequestRepository.getReceivedFriendRequestsByUserId).not.toHaveBeenCalled();
    });

    it("returns an empty array when no requests have been received", async () => {
      userRepository.findById.mockResolvedValue(receiver);
      friendRequestRepository.getReceivedFriendRequestsByUserId.mockResolvedValue([]);

      await expect(service.getReceivedFriendRequestsByUser("user-2")).resolves.toEqual([]);
    });
  });

  describe("getAllFriendsOfUser", () => {
    it("returns friendships when the user exists", async () => {
      const friendships = [{ ...friendRequest, status: FriendRequestStatus.ACCEPTED }];

      userRepository.findById.mockResolvedValue(sender);
      friendRequestRepository.getAllFriendsByUserId.mockResolvedValue(friendships);

      await expect(service.getAllFriendsOfUser("user-1")).resolves.toEqual(friendships);

      expect(userRepository.findById).toHaveBeenCalledExactlyOnceWith("user-1");

      expect(friendRequestRepository.getAllFriendsByUserId).toHaveBeenCalledExactlyOnceWith(
        "user-1",
      );
    });

    it("throws when the user does not exist", async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.getAllFriendsOfUser("missing-user")).rejects.toMatchObject({
        statusCode: 404,
        code: "USER_NOT_FOUND",
      });

      expect(friendRequestRepository.getAllFriendsByUserId).not.toHaveBeenCalled();
    });

    it("returns an empty array when the user has no friends", async () => {
      userRepository.findById.mockResolvedValue(sender);
      friendRequestRepository.getAllFriendsByUserId.mockResolvedValue([]);

      await expect(service.getAllFriendsOfUser("user-1")).resolves.toEqual([]);
    });
  });

  describe("getFriendRequest", () => {
    it("returns the friend request when the requester is the sender", async () => {
      friendRequestRepository.getFriendRequestBySenderAndReceiver.mockResolvedValue(friendRequest);

      await expect(service.getFriendRequest("user-1", "user-2", "user-1")).resolves.toEqual(
        friendRequest,
      );

      expect(
        friendRequestRepository.getFriendRequestBySenderAndReceiver,
      ).toHaveBeenCalledExactlyOnceWith("user-1", "user-2");
    });

    it("returns the friend request when the requester is the receiver", async () => {
      friendRequestRepository.getFriendRequestBySenderAndReceiver.mockResolvedValue(friendRequest);

      await expect(service.getFriendRequest("user-1", "user-2", "user-2")).resolves.toEqual(
        friendRequest,
      );

      expect(
        friendRequestRepository.getFriendRequestBySenderAndReceiver,
      ).toHaveBeenCalledExactlyOnceWith("user-1", "user-2");
    });

    it("throws when the requester is neither participant", async () => {
      await expect(service.getFriendRequest("user-1", "user-2", "user-3")).rejects.toMatchObject({
        statusCode: 403,
        code: "UNAUTHORIZED",
      });

      expect(friendRequestRepository.getFriendRequestBySenderAndReceiver).not.toHaveBeenCalled();
    });

    it("throws when sender and receiver are the same user", async () => {
      await expect(service.getFriendRequest("user-1", "user-1", "user-1")).rejects.toMatchObject({
        statusCode: 400,
        code: "NO_FREIND_REQUEST_AMONG_OURSELVES",
      });

      expect(friendRequestRepository.getFriendRequestBySenderAndReceiver).not.toHaveBeenCalled();
    });
  });
});
