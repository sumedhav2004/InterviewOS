import { beforeEach, describe, expect, it, vi } from "vitest";

const { findByClerkIdMock, createUserMock, getUserMock } = vi.hoisted(() => ({
  findByClerkIdMock: vi.fn(),
  createUserMock: vi.fn(),
  getUserMock: vi.fn(),
}));

vi.mock("../../../src/repositories/user.repository", () => ({
  UserRepository: class {
    findByClerkId = findByClerkIdMock;
    createUser = createUserMock;
  },
}));

vi.mock("../../../src/clients/clerk.client", () => ({
  clerkClient: {
    users: {
      getUser: getUserMock,
    },
  },
}));

import { IdentityService } from "../../../src/services/identity.service";

describe("IdentityService", () => {
  let service: IdentityService;

  beforeEach(() => {
    vi.resetAllMocks();
    service = new IdentityService();
  });

  describe("getUserByClerkId", () => {
    it("returns the user found by Clerk ID", async () => {
      const user = {
        id: "user_1",
        clerkId: "clerk_123",
        email: "candidate@example.com",
      };

      findByClerkIdMock.mockResolvedValue(user);

      const result = await service.getUserByClerkId("clerk_123");

      expect(findByClerkIdMock).toHaveBeenCalledWith("clerk_123");
      expect(result).toEqual(user);
    });

    it("returns null when no user exists for the Clerk ID", async () => {
      findByClerkIdMock.mockResolvedValue(null);

      const result = await service.getUserByClerkId("missing_clerk_id");

      expect(findByClerkIdMock).toHaveBeenCalledWith("missing_clerk_id");
      expect(result).toBeNull();
    });

    it("propagates repository errors", async () => {
      findByClerkIdMock.mockRejectedValue(new Error("Database connection failed"));

      await expect(service.getUserByClerkId("clerk_123")).rejects.toThrow(
        "Database connection failed",
      );
    });
  });

  describe("findOrCreateUser", () => {
    it("returns the existing user without calling Clerk", async () => {
      const existingUser = {
        id: "user_1",
        clerkId: "clerk_123",
        name: "Existing Candidate",
        email: "candidate@example.com",
      };

      findByClerkIdMock.mockResolvedValue(existingUser);

      const result = await service.findOrCreateUser("clerk_123");

      expect(result).toEqual(existingUser);
      expect(findByClerkIdMock).toHaveBeenCalledWith("clerk_123");
      expect(getUserMock).not.toHaveBeenCalled();
      expect(createUserMock).not.toHaveBeenCalled();
    });

    it("fetches the Clerk user and creates a local user when none exists", async () => {
      const clerkUser = {
        id: "clerk_123",
        firstName: "Ada",
        lastName: "Lovelace",
        emailAddresses: [
          {
            emailAddress: "ada@example.com",
          },
        ],
        imageUrl: "https://example.com/avatar.png",
      };

      const createdUser = {
        id: "user_1",
        clerkId: "clerk_123",
        name: "Ada Lovelace",
        email: "ada@example.com",
        avatarUrl: "https://example.com/avatar.png",
      };

      findByClerkIdMock.mockResolvedValue(null);
      getUserMock.mockResolvedValue(clerkUser);
      createUserMock.mockResolvedValue(createdUser);

      const result = await service.findOrCreateUser("clerk_123");

      expect(findByClerkIdMock).toHaveBeenCalledWith("clerk_123");
      expect(getUserMock).toHaveBeenCalledWith("clerk_123");

      expect(createUserMock).toHaveBeenCalledWith({
        name: "Ada Lovelace",
        email: "ada@example.com",
        clerkId: "clerk_123",
        avatarUrl: "https://example.com/avatar.png",
      });

      expect(result).toEqual(createdUser);
    });

    it("propagates errors when looking up the existing user fails", async () => {
      findByClerkIdMock.mockRejectedValue(new Error("User lookup failed"));

      await expect(service.findOrCreateUser("clerk_123")).rejects.toThrow("User lookup failed");

      expect(getUserMock).not.toHaveBeenCalled();
      expect(createUserMock).not.toHaveBeenCalled();
    });

    it("propagates errors when fetching the user from Clerk fails", async () => {
      findByClerkIdMock.mockResolvedValue(null);
      getUserMock.mockRejectedValue(new Error("Clerk API unavailable"));

      await expect(service.findOrCreateUser("clerk_123")).rejects.toThrow("Clerk API unavailable");

      expect(createUserMock).not.toHaveBeenCalled();
    });

    it("propagates errors when creating the local user fails", async () => {
      findByClerkIdMock.mockResolvedValue(null);

      getUserMock.mockResolvedValue({
        id: "clerk_123",
        firstName: "Ada",
        lastName: "Lovelace",
        emailAddresses: [
          {
            emailAddress: "ada@example.com",
          },
        ],
        imageUrl: "https://example.com/avatar.png",
      });

      createUserMock.mockRejectedValue(new Error("User creation failed"));

      await expect(service.findOrCreateUser("clerk_123")).rejects.toThrow("User creation failed");

      expect(createUserMock).toHaveBeenCalledTimes(1);
    });
  });
});
