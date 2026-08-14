import express from "express";
import { loggerMiddleware } from "./middleware/logger.middleware";
import { requestIdMiddleware } from "./middleware/request-id.middleware";
import { errorHandler } from "../core/errors/error-handler";
import { AppError } from "../core/errors/app-error";
import { validate, z } from "../../../packages/validation/src";
import {clerkMiddleware} from "@clerk/express"
import { authMiddleware } from "./middleware/auth.middleware";
import userRoutes from "./routes/user.routes";
import resumeRoutes from "./routes/resumes.routes";
import interviewRoutes from "./routes/interview.routes"
import cors from "cors";

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(requestIdMiddleware);
app.use(loggerMiddleware);
app.use(express.json());

console.log("CLERK_PUBLISHABLE_KEY =", process.env.CLERK_PUBLISHABLE_KEY);
console.log(
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =",
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);
console.log("CLERK_SECRET_KEY =", !!process.env.CLERK_SECRET_KEY);
app.use(clerkMiddleware());

app.use("/user", authMiddleware, userRoutes)
app.use("/resumes", authMiddleware, resumeRoutes)
app.use("/interviews",authMiddleware, interviewRoutes )

app.use(errorHandler);

export default app;