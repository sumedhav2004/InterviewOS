import { Router } from "express";
import { TestCaseController } from "../controllers/testCase.controller";

const router = Router()
const testCaseController = new TestCaseController

router.get("/:questionId/testcases", testCaseController.findAllTestCasesForAQuestion.bind(testCaseController))
router.get("/:questionId/testcases/visible", testCaseController.findAllVisibleTestCasesForAQuestion.bind(testCaseController))
router.post("/:questionId/testcases", testCaseController.createTestCase.bind(testCaseController) )
router.patch("/:questionId/testcases/:testCaseId", testCaseController.updateTestCase.bind(testCaseController))
router.get("/:questionId/testcases/:testCaseId", testCaseController.findById.bind(testCaseController))
router.delete("/:questionId/testcases/:testCaseId", testCaseController.deleteTestCase.bind(testCaseController))

export default router