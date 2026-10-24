import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
import { FriendRequestController } from "../../../src/controllers/friend-request.controller";
import { FriendRequestService } from "../../../src/services/friend-request.service";

vi.mock("../services/friend-request.service", () => ({
  FriendRequestService: vi.fn(),
}));

describe("FriendRequestController", () => {
  let controller: FriendRequestController;
  let friendRequestService: {
    getAcceptedFriendRequestsByUser: ReturnType<typeof vi.fn>;
    sendFriendRequest: ReturnType<typeof vi.fn>;
    cancelFriendRequest: ReturnType<typeof vi.fn>;
    acceptFriendRequest: ReturnType<typeof vi.fn>;
    rejectFriendRequest: ReturnType<typeof vi.fn>;
    unFriend: ReturnType<typeof vi.fn>;
    getSentFriendRequestsByUser: ReturnType<typeof vi.fn>;
    getReceivedFriendRequestsByUser: ReturnType<typeof vi.fn>;
    getAllFriendsOfUser: ReturnType<typeof vi.fn>;
    getFriendRequest: ReturnType<typeof vi.fn>;
  };

  let req: {
    user: { id: string };
    params: Record<string, string>;
  };

  let res: {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
    sendStatus: ReturnType<typeof vi.fn>;
  };

  const userId = "user-123";
  const receiverId = "user-456";
  const requestId = "request-789";

  beforeEach(() => {
    vi.clearAllMocks();

    friendRequestService = {
      getAcceptedFriendRequestsByUser: vi.fn(),
      sendFriendRequest: vi.fn(),
      cancelFriendRequest: vi.fn(),
      acceptFriendRequest: vi.fn(),
      rejectFriendRequest: vi.fn(),
      unFriend: vi.fn(),
      getSentFriendRequestsByUser: vi.fn(),
      getReceivedFriendRequestsByUser: vi.fn(),
      getAllFriendsOfUser: vi.fn(),
      getFriendRequest: vi.fn(),
    };

    controller = new FriendRequestController(
      friendRequestService as unknown as FriendRequestService,
    );

    req = {
      user: { id: userId },
      params: {},
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      sendStatus: vi.fn().mockReturnThis(),
    };
  });

  describe("getAcceptedFriendRequestsByUser", () => {
    it("returns accepted friend requests with status 200", async () => {
      const friendRequests = [{ id: requestId }];
      friendRequestService.getAcceptedFriendRequestsByUser.mockResolvedValue(friendRequests);

      await controller.getAcceptedFriendRequestsByUser(
        req as unknown as Request,
        res as unknown as Response,
      );

      expect(friendRequestService.getAcceptedFriendRequestsByUser).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(friendRequests);
    });
  });

  describe("sendFriendRequest", () => {
    it("creates a friend request and returns status 201", async () => {
      const friendRequest = { id: requestId };
      req.params.receiverId = receiverId;
      friendRequestService.sendFriendRequest.mockResolvedValue(friendRequest);

      await controller.sendFriendRequest(
        req as unknown as Request<{ receiverId: string }>,
        res as unknown as Response,
      );

      expect(friendRequestService.sendFriendRequest).toHaveBeenCalledWith(userId, receiverId);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(friendRequest);
    });
  });

  describe("cancelFriendRequest", () => {
    it("cancels a friend request and returns status 200", async () => {
      const friendRequest = { id: requestId, status: "CANCELLED" };
      req.params.id = requestId;
      friendRequestService.cancelFriendRequest.mockResolvedValue(friendRequest);

      await controller.cancelFriendRequest(
        req as unknown as Request<{ id: string }>,
        res as unknown as Response,
      );

      expect(friendRequestService.cancelFriendRequest).toHaveBeenCalledWith(requestId, userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(friendRequest);
    });
  });

  describe("acceptFriendRequest", () => {
    it("accepts a friend request and returns status 200", async () => {
      const friendRequest = { id: requestId, status: "ACCEPTED" };
      req.params.id = requestId;
      friendRequestService.acceptFriendRequest.mockResolvedValue(friendRequest);

      await controller.acceptFriendRequest(
        req as unknown as Request<{ id: string }>,
        res as unknown as Response,
      );

      expect(friendRequestService.acceptFriendRequest).toHaveBeenCalledWith(requestId, userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(friendRequest);
    });
  });

  describe("rejectFriendRequest", () => {
    it("rejects a friend request and returns status 200", async () => {
      const friendRequest = { id: requestId, status: "REJECTED" };
      req.params.id = requestId;
      friendRequestService.rejectFriendRequest.mockResolvedValue(friendRequest);

      await controller.rejectFriendRequest(
        req as unknown as Request<{ id: string }>,
        res as unknown as Response,
      );

      expect(friendRequestService.rejectFriendRequest).toHaveBeenCalledWith(requestId, userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(friendRequest);
    });
  });

  describe("unFriend", () => {
    it("unfriends a user and returns status 204", async () => {
      req.params.id = requestId;
      friendRequestService.unFriend.mockResolvedValue(undefined);

      await controller.unFriend(
        req as unknown as Request<{ id: string }>,
        res as unknown as Response,
      );

      expect(friendRequestService.unFriend).toHaveBeenCalledWith(requestId, userId);
      expect(res.sendStatus).toHaveBeenCalledWith(204);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("getSentFriendRequestsByUser", () => {
    it("returns sent friend requests with status 200", async () => {
      const friendRequests = [{ id: requestId }];
      friendRequestService.getSentFriendRequestsByUser.mockResolvedValue(friendRequests);

      await controller.getSentFriendRequestsByUser(
        req as unknown as Request,
        res as unknown as Response,
      );

      expect(friendRequestService.getSentFriendRequestsByUser).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(friendRequests);
    });
  });

  describe("getReceivedFriendRequestsByUser", () => {
    it("returns received friend requests with status 200", async () => {
      const friendRequests = [{ id: requestId }];
      friendRequestService.getReceivedFriendRequestsByUser.mockResolvedValue(friendRequests);

      await controller.getReceivedFriendRequestsByUser(
        req as unknown as Request,
        res as unknown as Response,
      );

      expect(friendRequestService.getReceivedFriendRequestsByUser).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(friendRequests);
    });
  });

  describe("getAllFriendsOfUser", () => {
    it("returns all friends with status 200", async () => {
      const friends = [{ id: receiverId }];
      req.params.userId = userId;

      friendRequestService.getAllFriendsOfUser.mockResolvedValue(friends);

      await controller.getAllFriendsOfUser(req as unknown as Request, res as unknown as Response);

      expect(friendRequestService.getAllFriendsOfUser).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(friends);
    });
  });

  describe("getFriendRequestForTwoUsers", () => {
    it("returns the friend request with status 200", async () => {
      const result = { id: requestId, status: "ACCEPTED" };

      req.params.senderId = userId;
      req.params.receiverId = receiverId;
      friendRequestService.getFriendRequest.mockResolvedValue(result);

      await controller.getFriendRequestForTwoUsers(
        req as unknown as Request,
        res as unknown as Response,
      );

      expect(friendRequestService.getFriendRequest).toHaveBeenCalledExactlyOnceWith(
        userId,
        receiverId,
        userId,
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it("returns 400 when senderId is not a string", async () => {
      req.params.senderId = undefined as unknown as string;
      req.params.receiverId = receiverId;

      await controller.getFriendRequestForTwoUsers(
        req as unknown as Request,
        res as unknown as Response,
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid route parameter",
      });
      expect(friendRequestService.getFriendRequest).not.toHaveBeenCalled();
    });

    it("returns 400 when receiverId is not a string", async () => {
      req.params.senderId = userId;
      req.params.receiverId = undefined as unknown as string;

      await controller.getFriendRequestForTwoUsers(
        req as unknown as Request,
        res as unknown as Response,
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid route parameter",
      });
      expect(friendRequestService.getFriendRequest).not.toHaveBeenCalled();
    });
  });
});
