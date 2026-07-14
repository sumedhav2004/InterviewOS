import express from "express";
import { loggerMiddleware } from "./middleware/logger.middleware";
import { requestIdMiddleware } from "./middleware/request-id.middleware";
import { errorHandler } from "../core/errors/error-handler";
import { AppError } from "../core/errors/app-error";
import { validate, z } from "../../../packages/validation/src";

const app = express();

app.use(requestIdMiddleware);
app.use(loggerMiddleware);
app.use(express.json());

const schema = z.object({
    name: z.string(),
    age: z.number()
})

const v = validate(schema, {
    name: "Sumedhav",
    age: "24"
})
console.log("validation: ", v);

app.get("/health", (_, res) => {
    res.status(200).json({
        status: "healthy",
    });
});

app.get("/test", () => {
    throw new AppError(
        "Interview not found",
        404,
        "INTERVIEW_NOT_FOUND"
    );
});

app.use(errorHandler);

export default app;