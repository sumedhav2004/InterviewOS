import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserController } from "../../../src/controllers/user.controller";

const { mockUpdateUser, mockFindUser, mockFindUserByEmail } = vi.hoisted(() => ({
  mockUpdateUser: vi.fn(),
  mockFindUser: vi.fn(),
  mockFindUserByEmail: vi.fn(),
}));

vi.mock("../../../src/services/profile.service", () => ({
  ProfileService: class {
    updateUser = mockUpdateUser;
    findUser = mockFindUser;
  },
}));

vi.mock("../../../src/services/identity.service", () => ({
  IdentityService: class {
    findUserByEmail = mockFindUserByEmail;
  },
}));

describe("UserController", () => {
  let controller: UserController;
  let req: any;
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();

    controller = new UserController();

    req = {
      params: {},
      body: {},
      user: {
        id: "user-1",
        email: "user@example.com",
        name: "Test User",
      },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe("getMe", () => {
    it("should return the current user with status 200", async () => {
      await controller.getMe(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(req.user);
    });
  });

  describe("updateMe", () => {
    it("should update the current user and return the updated user", async () => {
      const data = { name: "Updated User" };
      const updatedUser = {
        id: "user-1",
        email: "user@example.com",
        name: "Updated User",
      };

      req.body = data;
      mockUpdateUser.mockResolvedValue(updatedUser);

      await controller.updateMe(req, res);

      expect(mockUpdateUser).toHaveBeenCalledWith("user-1", data);
      expect(res.json).toHaveBeenCalledWith(updatedUser);
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should propagate service errors", async () => {
      req.body = { name: "Updated User" };
      mockUpdateUser.mockRejectedValue(new Error("User update failed"));

      await expect(controller.updateMe(req, res)).rejects.toThrow("User update failed");
    });
  });

  describe("findUserById", () => {
    it("should return a user with status 200", async () => {
      const user = {
        id: "user-2",
        name: "Another User",
      };

      req.params.userId = "user-2";
      mockFindUser.mockResolvedValue(user);

      await controller.findUserById(req, res);

      expect(mockFindUser).toHaveBeenCalledWith("user-2");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(user);
    });

    it("should return 400 when userId is not a string", async () => {
      req.params.userId = ["user-2"];

      await controller.findUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid route parameter",
      });
      expect(mockFindUser).not.toHaveBeenCalled();
    });

    it("should propagate service errors", async () => {
      req.params.userId = "user-2";
      mockFindUser.mockRejectedValue(new Error("User lookup failed"));

      await expect(controller.findUserById(req, res)).rejects.toThrow("User lookup failed");
    });
  });

  describe("findUserByEmail", () => {
    it("should return a user with status 200", async () => {
      const user = {
        id: "user-2",
        name: "Another User",
        email: "another@example.com",
      };

      req.params.emailId = "another@example.com";
      mockFindUserByEmail.mockResolvedValue(user);

      await controller.findUserByEmail(req, res);

      expect(mockFindUserByEmail).toHaveBeenCalledWith("another@example.com", "user-1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(user);
    });

    it("should return 400 when emailId is not a string", async () => {
      req.params.emailId = ["another@example.com"];

      await controller.findUserByEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid email route parameter",
      });
      expect(mockFindUserByEmail).not.toHaveBeenCalled();
    });

    it("should propagate service errors", async () => {
      req.params.emailId = "another@example.com";
      mockFindUserByEmail.mockRejectedValue(new Error("Email lookup failed"));

      await expect(controller.findUserByEmail(req, res)).rejects.toThrow("Email lookup failed");
    });
  });
});
