import { beforeEach, describe, expect, it, vi } from "vitest";

const { updateUserMock, findByIdMock } = vi.hoisted(() => ({
  updateUserMock: vi.fn(),
  findByIdMock: vi.fn(),
}));

vi.mock("../../../src/repositories/user.repository", () => ({
  UserRepository: class {
    updateUser = updateUserMock;
    findById = findByIdMock;
  },
}));

import { ProfileService } from "../../../src/services/profile.service";

describe("ProfileService", () => {
  let service: ProfileService;

  beforeEach(() => {
    vi.resetAllMocks();
    service = new ProfileService();
  });

  describe("updateUser", () => {
    it("updates a user profile and returns the updated user", async () => {
      const updateData = {
        name: "Ada Lovelace",
        avatarUrl: "https://example.com/avatar.png",
      };

      const updatedUser = {
        id: "user_123",
        ...updateData,
      };

      updateUserMock.mockResolvedValue(updatedUser);

      const result = await service.updateUser(
        "user_123",
        updateData,
      );

      expect(updateUserMock).toHaveBeenCalledWith(
        "user_123",
        updateData,
      );
      expect(result).toEqual(updatedUser);
    });

    it("returns null when the repository reports no updated user", async () => {
      updateUserMock.mockResolvedValue(null);

      const result = await service.updateUser(
        "missing_user",
        {},
      );

      expect(updateUserMock).toHaveBeenCalledWith(
        "missing_user",
        {},
      );
      expect(result).toBeNull();
    });

    it("propagates repository errors", async () => {
      updateUserMock.mockRejectedValue(
        new Error("Profile update failed"),
      );

      await expect(
        service.updateUser("user_123", {}),
      ).rejects.toThrow("Profile update failed");
    });

    it("supports an empty update object", async () => {
      const updatedUser = { id: "user_123" };

      updateUserMock.mockResolvedValue(updatedUser);

      const result = await service.updateUser(
        "user_123",
        {},
      );

      expect(updateUserMock).toHaveBeenCalledWith(
        "user_123",
        {},
      );
      expect(result).toEqual(updatedUser);
    });
  });

  describe("findUser", () => {
    it("returns a user when the repository finds one", async () => {
      const user = {
        id: "user_123",
        name: "Ada Lovelace",
        email: "ada@example.com",
      };

      findByIdMock.mockResolvedValue(user);

      const result = await service.findUser("user_123");

      expect(findByIdMock).toHaveBeenCalledWith("user_123");
      expect(result).toEqual(user);
    });

    it("returns null when the user does not exist", async () => {
      findByIdMock.mockResolvedValue(null);

      const result = await service.findUser("missing_user");

      expect(findByIdMock).toHaveBeenCalledWith("missing_user");
      expect(result).toBeNull();
    });

    it("propagates repository errors", async () => {
      findByIdMock.mockRejectedValue(
        new Error("User lookup failed"),
      );

      await expect(
        service.findUser("user_123"),
      ).rejects.toThrow("User lookup failed");
    });
  });
});