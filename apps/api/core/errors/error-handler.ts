import { Request, Response, NextFunction } from "express";
import { AppError } from "./app-error";
import { logger } from "../../../../packages/logger/src";

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (err instanceof AppError) {
        logger.error(err);

        return res.status(err.statusCode).json({
            success: false,
            code: err.code,
            message: err.message,
            requestId: req.headers["x-request-id"],
        });
    }

    logger.error(err);

    return res.status(500).json({
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
        requestId: req.headers["x-request-id"],
    });
}