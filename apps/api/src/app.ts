import express from "express";
import { loggerMiddleware } from "./middleware/logger.middleware";
import { requestIdMiddleware } from "./middleware/request-id.middleware";
import { errorHandler } from "../core/errors/error-handler";
import { clerkMiddleware } from "@clerk/express";
import { authMiddleware } from "./middleware/auth.middleware";
import userRoutes from "./routes/user.routes";
import resumeRoutes from "./routes/resumes.routes";
import interviewRoutes from "./routes/interview.routes";
import inviteRoutes from "./routes/invite.routes";
import cors from "cors";
import participantRoutes from "./routes/participant.routes";
import questionRoutes from "./routes/question.routes";
import interviewQuestionRoutes from "./routes/interviewQuestion.routes";
import { InterviewRoom } from "./realtime/websocket/interview-room";
import { createCodeRunRouter } from "./routes/code-run.routes";
import testCaseRoutes from "./routes/test-case.routes";
import submissionRoutes from "./routes/submission.routes";
import { config } from "@interview-os/config";

const app = express();

export function mountCodeRunRoutes(interviewRoom: InterviewRoom) {
  app.use("/coderuns", authMiddleware, createCodeRunRouter(interviewRoom));
}

app.use(
  cors({
    origin: config.server.frontend_url,
    credentials: true,
  }),
);
app.use(requestIdMiddleware);
app.use(loggerMiddleware);
app.use(express.json());
app.use(clerkMiddleware());

app.use("/user", authMiddleware, userRoutes);
app.use("/resumes", authMiddleware, resumeRoutes);
app.use("/interviews", authMiddleware, interviewRoutes);
app.use("/interviews", authMiddleware, participantRoutes);
app.use("/", authMiddleware, inviteRoutes);
app.use("/questions", authMiddleware, questionRoutes);
app.use("/interviews", authMiddleware, interviewQuestionRoutes);
app.use("/questions", authMiddleware, testCaseRoutes);
app.use("/submissions", authMiddleware, submissionRoutes);

app.use(errorHandler);

export default app;
