import { describe, expect, it, vi } from "vitest";
import { validate as isValidUUID } from "uuid";
import type { NextFunction, Request, Response } from "express";
import { requestIdMiddleware } from "../../../src/middleware/request-id.middleware";

describe("requestIdMiddleware", () => {
  function createMocks() {
    const req = {
      headers: {},
    } as Request;

    const res = {
      setHeader: vi.fn(),
    } as unknown as Response;

    const next = vi.fn() as unknown as NextFunction;

    return { req, res, next };
  }

  it("attaches a valid UUID to the request and response headers", () => {
    const { req, res, next } = createMocks();

    requestIdMiddleware(req, res, next);

    const requestId = req.headers["x-request-id"];

    expect(requestId).toBeDefined();
    expect(typeof requestId).toBe("string");
    expect(isValidUUID(requestId as string)).toBe(true);

    expect(res.setHeader).toHaveBeenCalledWith(
      "x-request-id",
      requestId,
    );

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("uses the same request ID in both headers", () => {
    const { req, res, next } = createMocks();

    requestIdMiddleware(req, res, next);

    const requestId = req.headers["x-request-id"];

    expect(res.setHeader).toHaveBeenCalledWith(
      "x-request-id",
      requestId,
    );
  });

  it("generates a different ID for each request", () => {
    const first = createMocks();
    const second = createMocks();

    requestIdMiddleware(first.req, first.res, first.next);
    requestIdMiddleware(second.req, second.res, second.next);

    expect(first.req.headers["x-request-id"]).not.toBe(
      second.req.headers["x-request-id"],
    );
  });

  it("sets the response header before calling next", () => {
    const { req, res, next } = createMocks();
    const callOrder: string[] = [];

    vi.mocked(res.setHeader).mockImplementation(() => {
      callOrder.push("setHeader");
      return res;
    });

    (next as ReturnType<typeof vi.fn>).mockImplementation(() => {
      callOrder.push("next");
    });

    requestIdMiddleware(req, res, next);

    expect(callOrder).toEqual(["setHeader", "next"]);
  });
});