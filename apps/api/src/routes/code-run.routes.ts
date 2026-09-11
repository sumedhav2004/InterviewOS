import { Router } from "express";
import { CodeRunController } from "../controllers/code-run.controller";

const router = Router()
const codeRunController = new CodeRunController

router.post("/", codeRunController.createCodeRun.bind(codeRunController))
router.patch("/:id", codeRunController.updateCodeRun.bind(codeRunController))
router.post(
    "/:id/execute",
    codeRunController.executeCodeRun.bind(codeRunController)
);
export default router