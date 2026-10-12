import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockVerifyToken, mockFindOrCreateUser } = vi.hoisted(() => ({
  mockVerifyToken: vi.fn(),
  mockFindOrCreateUser: vi.fn(),
}));

vi.mock("@clerk/backend", () => ({
  verifyToken: mockVerifyToken,
}));

vi.mock("../../../src/services/identity.service", () => ({
  IdentityService: class {
    findOrCreateUser = mockFindOrCreateUser;
  },
}));

import { authenticateWebSocketToken } from "../../../src/realtime/websocket/websocket-auth";

describe("authenticateWebSocketToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("CLERK_SECRET_KEY", "test-secret-key");
  });

  it("should return the user ID when the token is valid", async () => {
    mockVerifyToken.mockResolvedValue({ sub: "clerk-user-1" });
    mockFindOrCreateUser.mockResolvedValue({ id: "user-1" });

    const result = await authenticateWebSocketToken("valid-token");

    expect(result).toBe("user-1");
    expect(mockVerifyToken).toHaveBeenCalledWith("valid-token", {
      secretKey: "test-secret-key",
      authorizedParties: ["http://localhost:3000"],
    });
    expect(mockFindOrCreateUser).toHaveBeenCalledWith("clerk-user-1");
  });

  it("should return null when the verified token has no subject", async () => {
    mockVerifyToken.mockResolvedValue({});

    const result = await authenticateWebSocketToken("token-without-sub");

    expect(result).toBeNull();
    expect(mockFindOrCreateUser).not.toHaveBeenCalled();
  });

  it("should return null when the subject is an empty string", async () => {
    mockVerifyToken.mockResolvedValue({ sub: "" });

    const result = await authenticateWebSocketToken("token-with-empty-sub");

    expect(result).toBeNull();
    expect(mockFindOrCreateUser).not.toHaveBeenCalled();
  });

  it("should return null when token verification fails", async () => {
    mockVerifyToken.mockRejectedValue(new Error("Invalid token"));

    const result = await authenticateWebSocketToken("invalid-token");

    expect(result).toBeNull();
    expect(mockFindOrCreateUser).not.toHaveBeenCalled();
  });

  it("should return null when identity lookup or creation fails", async () => {
    mockVerifyToken.mockResolvedValue({ sub: "clerk-user-1" });
    mockFindOrCreateUser.mockRejectedValue(new Error("Identity service unavailable"));

    const result = await authenticateWebSocketToken("valid-token");

    expect(result).toBeNull();
    expect(mockFindOrCreateUser).toHaveBeenCalledWith("clerk-user-1");
  });

  it("should pass an undefined secret key when the environment variable is absent", async () => {
    vi.stubEnv("CLERK_SECRET_KEY", undefined as unknown as string);
    mockVerifyToken.mockResolvedValue({ sub: "clerk-user-1" });
    mockFindOrCreateUser.mockResolvedValue({ id: "user-1" });

    await authenticateWebSocketToken("valid-token");

    expect(mockVerifyToken).toHaveBeenCalledWith("valid-token", {
      secretKey: undefined,
      authorizedParties: ["http://localhost:3000"],
    });
  });
});
