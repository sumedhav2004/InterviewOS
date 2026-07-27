import { describe, expect, it, vi, beforeEach } from "vitest";
import { Request, Response } from "express";
import { logger } from "@interview-os/logger";
import { AppError } from "../../core/errors/app-error";
import { errorHandler } from "../../core/errors/error-handler";

vi.mock("@interview-os/logger", () => ({
    logger: {
        error: vi.fn(),
    },
}));

describe("errorHandler()", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        req = {
            headers: {
                "x-request-id": "abc-123",
            },
        };

        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
    });

    it("should return AppError response", () => {
        const err = new AppError(
            "Interview not found",
            404,
            "INTERVIEW_NOT_FOUND"
        );

        errorHandler(
            err,
            req as Request,
            res as Response,
            vi.fn()
        );

        expect(logger.error).toHaveBeenCalledWith(err);

        expect(res.status).toHaveBeenCalledWith(404);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            code: "INTERVIEW_NOT_FOUND",
            message: "Interview not found",
            requestId: "abc-123",
        });
    });

        it("should return 500 for unknown errors", () => {
        const err = new Error("Boom");

        errorHandler(
            err,
            req as Request,
            res as Response,
            vi.fn()
        );

        expect(logger.error).toHaveBeenCalledWith(err);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
            requestId: "abc-123",
        });
    });
});
