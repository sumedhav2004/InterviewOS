import { Router } from "express";
import { InterviewController } from "../controllers/interview.controller";

const router = Router()
const interviewController = new InterviewController()

router.get("/", interviewController.findAllInterviewsByUserId.bind(interviewController))
router.get("/:id", interviewController.findInterviewById.bind(interviewController))
router.post("/", interviewController.createInterview.bind(interviewController))
router.delete("/", interviewController.deleteInterview.bind(interviewController))
router.patch("/:id", interviewController.updateInterview.bind(interviewController))

export default router