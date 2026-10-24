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
import healthRoute from "./routes/health.route";
import friendRequestRoutes from "./routes/friend-request.routes";

const app = express();

export function mountCodeRunRoutes(interviewRoom: InterviewRoom) {
  app.use("/coderuns", authMiddleware, createCodeRunRouter(interviewRoom));
}

app.use(
  cors({
    origin: [
      "http://localhost:3000", // Update this if your local frontend runs on a different port (like 5173 for Vite)
      "https://interview-os-flame.vercel.app",
      "https://interview-os.sumedhav.me",
      config.server.frontend_url, // keeps your config variable working too
    ],
    credentials: true,
  }),
);
app.use(requestIdMiddleware);
app.use(loggerMiddleware);
app.use(express.json());
app.use(clerkMiddleware());
app.use("/health", healthRoute);
app.use("/user", authMiddleware, userRoutes);
app.use("/resumes", authMiddleware, resumeRoutes);
app.use("/interviews", authMiddleware, interviewRoutes);
app.use("/interviews", authMiddleware, participantRoutes);
app.use("/", authMiddleware, inviteRoutes);
app.use("/questions", authMiddleware, questionRoutes);
app.use("/interviews", authMiddleware, interviewQuestionRoutes);
app.use("/questions", authMiddleware, testCaseRoutes);
app.use("/submissions", authMiddleware, submissionRoutes);
app.use("/user/friends", authMiddleware, friendRequestRoutes);

app.use(errorHandler);

export default app;
