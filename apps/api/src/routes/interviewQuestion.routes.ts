import { Router } from "express";
import { InterviewQuestionController } from "../controllers/interview-question.controller";

const router = Router()
const interviewQuestionController = new InterviewQuestionController

router.get("/:interviewId/questions/:questionId/:interviewQuestionId", interviewQuestionController.findById.bind(interviewQuestionController))
router.get("/:interviewId/questions", interviewQuestionController.findByInterview.bind(interviewQuestionController))
router.get("/:interviewId/questions/:questionId", interviewQuestionController.findInterviewQuestion.bind(interviewQuestionController))
router.post("/:intrviewId/questions/:questionId", interviewQuestionController.createInterviewQuestion.bind(interviewQuestionController))
router.patch("/:interviewId/questions/:questionId/:interviewQuestionId", interviewQuestionController.updateInterviewQuestion.bind(interviewQuestionController))
router.delete("/:interviewId/questions/:questionId/:interviewQuestionId", interviewQuestionController.deleteInterviewQuestion.bind(interviewQuestionController))


export default router