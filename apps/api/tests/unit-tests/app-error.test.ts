import { describe, expect, it } from "vitest";
import { AppError } from "../../core/errors/app-error";


describe("AppError", () => {
    it("should create an AppError with the correct properties", () => {
        const err = new AppError(
            "Interview not found",
            404,
            "INTERVIEW_NOT_FOUND"
        );

        expect(err).toBeInstanceOf(AppError);
        expect(err).toBeInstanceOf(Error);

        expect(err.message).toBe("Interview not found");
        expect(err.statusCode).toBe(404);
        expect(err.code).toBe("INTERVIEW_NOT_FOUND");
        expect(err.isOperational).toBe(true);
        expect(err.name).toBe("AppError");
    });

    it("should allow overriding isOperational", () => {
        const err = new AppError(
            "Database crashed",
            500,
            "DATABASE_ERROR",
            false
        );

        expect(err.isOperational).toBe(false);
    });
});