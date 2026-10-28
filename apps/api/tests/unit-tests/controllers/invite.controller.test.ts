import { beforeEach, describe, expect, it, vi } from "vitest";
import { InviteController } from "../../../src/controllers/invite.controller";

const {
  mockCreateInvite,
  mockGetReceivedInvites,
  mockAcceptInvite,
  mockDeclineInvite,
  mockCancelInvite,
  mockGetSentInvites,
} = vi.hoisted(() => ({
  mockCreateInvite: vi.fn(),
  mockGetReceivedInvites: vi.fn(),
  mockAcceptInvite: vi.fn(),
  mockDeclineInvite: vi.fn(),
  mockCancelInvite: vi.fn(),
  mockGetSentInvites: vi.fn(),
}));

vi.mock("../../../src/services/invite.service", () => ({
  InviteService: class {
    createInvite = mockCreateInvite;
    getReceivedInvites = mockGetReceivedInvites;
    acceptInvite = mockAcceptInvite;
    declineInvite = mockDeclineInvite;
    cancelInvite = mockCancelInvite;
    getSentInvites = mockGetSentInvites;
  },
}));

describe("InviteController", () => {
  let controller: InviteController;
  let req: any;
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();

    controller = new InviteController();

    req = {
      params: {},
      body: {},
      user: { id: "user-1" },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    res.sendStatus = vi.fn().mockReturnThis();
  });

  describe("createInvite", () => {
    it("should create an invite and return 201", async () => {
      const data = { message: "Join my interview" };
      const invite = { id: "invite-1", status: "PENDING" };

      req.params.interviewId = "interview-1";
      req.params.receiverId = "receiver-1";
      req.body = {
        ...data,
      };
      mockCreateInvite.mockResolvedValue(invite);

      await controller.createInvite(req, res);

      expect(mockCreateInvite).toHaveBeenCalledWith("user-1", "receiver-1", "interview-1", data);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(invite);
    });

    it("should return 400 when interviewId is not a string", async () => {
      req.params.interviewId = ["interview-1"];
      req.body = { receiverId: "receiver-1" };

      await controller.createInvite(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid route parameter",
      });
      expect(mockCreateInvite).not.toHaveBeenCalled();
    });

    it("should propagate service errors", async () => {
      req.params.interviewId = "interview-1";
      req.params.receiverId = "receiver-1";
      req.body = { message: "Hello" };

      mockCreateInvite.mockRejectedValue(new Error("Creation failed"));

      await expect(controller.createInvite(req, res)).rejects.toThrow("Creation failed");
    });
  });

  describe("getReceivedInvites", () => {
    it("should return received invites with status 200", async () => {
      const invites = [{ id: "invite-1" }, { id: "invite-2" }];
      mockGetReceivedInvites.mockResolvedValue(invites);

      await controller.getReceivedInvites(req, res);

      expect(mockGetReceivedInvites).toHaveBeenCalledWith("user-1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(invites);
    });

    it("should propagate service errors", async () => {
      mockGetReceivedInvites.mockRejectedValue(new Error("Retrieval failed"));

      await expect(controller.getReceivedInvites(req, res)).rejects.toThrow("Retrieval failed");
    });
  });

  describe("acceptInvite", () => {
    it("should accept an invite and return 200", async () => {
      const invite = { id: "invite-1", status: "ACCEPTED" };
      req.params.inviteId = "invite-1";
      mockAcceptInvite.mockResolvedValue(invite);

      await controller.acceptInvite(req, res);

      expect(mockAcceptInvite).toHaveBeenCalledWith("invite-1", "user-1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(invite);
    });

    it("should return 400 when inviteId is not a string", async () => {
      req.params.inviteId = ["invite-1"];

      await controller.acceptInvite(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid route parameter",
      });
      expect(mockAcceptInvite).not.toHaveBeenCalled();
    });

    it("should propagate service errors", async () => {
      req.params.inviteId = "invite-1";
      mockAcceptInvite.mockRejectedValue(new Error("Acceptance failed"));

      await expect(controller.acceptInvite(req, res)).rejects.toThrow("Acceptance failed");
    });
  });

  describe("declineInvite", () => {
    it("should decline an invite and return 200", async () => {
      const invite = { id: "invite-1", status: "DECLINED" };
      req.params.inviteId = "invite-1";
      mockDeclineInvite.mockResolvedValue(invite);

      await controller.declineInvite(req, res);

      expect(mockDeclineInvite).toHaveBeenCalledWith("invite-1", "user-1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(invite);
    });

    it("should return 400 when inviteId is not a string", async () => {
      req.params.inviteId = ["invite-1"];

      await controller.declineInvite(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid route parameter",
      });
      expect(mockDeclineInvite).not.toHaveBeenCalled();
    });

    it("should propagate service errors", async () => {
      req.params.inviteId = "invite-1";
      mockDeclineInvite.mockRejectedValue(new Error("Decline failed"));

      await expect(controller.declineInvite(req, res)).rejects.toThrow("Decline failed");
    });
  });

  describe("cancelInvite", () => {
    it("should cancel an invite and return 200", async () => {
      const invite = { id: "invite-1", status: "CANCELLED" };
      req.params.inviteId = "invite-1";
      mockCancelInvite.mockResolvedValue(invite);

      await controller.cancelInvite(req, res);

      expect(mockCancelInvite).toHaveBeenCalledWith("invite-1", "user-1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(invite);
    });

    it("should return 400 when inviteId is not a string", async () => {
      req.params.inviteId = ["invite-1"];

      await controller.cancelInvite(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid route parameter",
      });
      expect(mockCancelInvite).not.toHaveBeenCalled();
    });

    it("should propagate service errors", async () => {
      req.params.inviteId = "invite-1";
      mockCancelInvite.mockRejectedValue(new Error("Cancellation failed"));

      await expect(controller.cancelInvite(req, res)).rejects.toThrow("Cancellation failed");
    });
  });

  describe("getSentInvites", () => {
    it("should return sent invites with status 200", async () => {
      const invites = [{ id: "invite-1" }, { id: "invite-2" }];
      mockGetSentInvites.mockResolvedValue(invites);

      await controller.getSentInvites(req, res);

      expect(mockGetSentInvites).toHaveBeenCalledWith("user-1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(invites);
    });

    it("should propagate service errors", async () => {
      mockGetSentInvites.mockRejectedValue(new Error("Retrieval failed"));

      await expect(controller.getSentInvites(req, res)).rejects.toThrow("Retrieval failed");
    });
  });
});
