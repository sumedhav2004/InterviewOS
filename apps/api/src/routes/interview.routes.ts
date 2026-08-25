import { Router } from "express";
import { InterviewController } from "../controllers/interview.controller";

const router = Router()
const interviewController = new InterviewController()

router.get("/", interviewController.findAllInterviewsByUserId.bind(interviewController))
router.get("/:id", interviewController.findInterviewById.bind(interviewController))
router.post("/", interviewController.createInterview.bind(interviewController))
router.delete("/", interviewController.deleteInterview.bind(interviewController))
router.patch("/:id", interviewController.updateInterview.bind(interviewController))
router.patch("/:id/schedule", interviewController.scheduleInterview.bind(interviewController))
router.patch("/:id/start", interviewController.startInterview.bind(interviewController))
router.patch("/:id/complete", interviewController.completeInterview.bind(interviewController))
router.patch("/:id/cancel", interviewController.cancelInterview.bind(interviewController))

export default router