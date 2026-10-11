import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";

const { getAuthMock, findOrCreateUserMock } = vi.hoisted(() => ({
  getAuthMock: vi.fn(),
  findOrCreateUserMock: vi.fn(),
}));

vi.mock("@clerk/express", () => ({
  getAuth: getAuthMock,
}));

vi.mock("../../../src/services/identity.service", () => ({
  IdentityService: class {
    findOrCreateUser = findOrCreateUserMock;
  },
}));

import { getAuth } from "@clerk/express";
import { authMiddleware } from "../../../src/middleware/auth.middleware";

describe("authMiddleware", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  let statusMock: ReturnType<typeof vi.fn>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let nextMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetAllMocks();

    req = {
      headers: {},
    } as Request;

    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    res = {
      status: statusMock,
    } as unknown as Response;

    nextMock = vi.fn();
    next = nextMock as unknown as NextFunction;
  });

  it("returns 401 when the user is not authenticated", async () => {
    getAuthMock.mockReturnValue({ userId: null });

    await authMiddleware(req, res, next);

    expect(getAuth).toHaveBeenCalledWith(req);
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "401 unauthorized",
    });
    expect(findOrCreateUserMock).not.toHaveBeenCalled();
    expect(nextMock).not.toHaveBeenCalled();
  });

  it("returns 401 when userId is undefined", async () => {
    getAuthMock.mockReturnValue({ userId: undefined });

    await authMiddleware(req, res, next);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "401 unauthorized",
    });
    expect(findOrCreateUserMock).not.toHaveBeenCalled();
    expect(nextMock).not.toHaveBeenCalled();
  });

  it("finds or creates the user and calls next on success", async () => {
    const authenticatedUser = {
      id: "user_123",
      clerkId: "clerk_123",
    };

    getAuthMock.mockReturnValue({ userId: "clerk_123" });
    findOrCreateUserMock.mockResolvedValue(authenticatedUser);

    await authMiddleware(req, res, next);

    expect(findOrCreateUserMock).toHaveBeenCalledWith("clerk_123");
    expect(
      (req as Request & { user?: unknown }).user,
    ).toEqual(authenticatedUser);
    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(statusMock).not.toHaveBeenCalled();
  });

  it("propagates errors when finding or creating the user fails", async () => {
    getAuthMock.mockReturnValue({ userId: "clerk_123" });
    findOrCreateUserMock.mockRejectedValue(
      new Error("Database connection failed"),
    );

    await expect(authMiddleware(req, res, next)).rejects.toThrow(
      "Database connection failed",
    );

    expect(nextMock).not.toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
  });

  it("currently calls next when the service returns null", async () => {
    getAuthMock.mockReturnValue({ userId: "clerk_123" });
    findOrCreateUserMock.mockResolvedValue(null);

    await authMiddleware(req, res, next);

    expect(
      (req as Request & { user?: unknown }).user,
    ).toBeNull();
    expect(nextMock).toHaveBeenCalledTimes(1);
  });
});