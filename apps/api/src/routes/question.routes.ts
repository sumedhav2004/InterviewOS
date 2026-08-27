import { Router } from "express";
import { QuestionController } from "../controllers/question.controller";


const router = Router()
const questionController = new QuestionController

router.get("/", questionController.findMyQuestions.bind(questionController))
router.post("/", questionController.createQuestion.bind(questionController))
router.get("/:id", questionController.findById.bind(questionController))
router.delete("/:id", questionController.deleteQuestion.bind(questionController))
router.patch("/:id", questionController.updateQuestion.bind(questionController))

export default router