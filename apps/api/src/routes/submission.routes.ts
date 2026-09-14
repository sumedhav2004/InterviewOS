import { Router } from "express";
import { SubmissionController } from "../controllers/submission.controller";

const router = Router();

const submissionController = new SubmissionController();

router.post(
    "/",
    submissionController.createSubmission.bind(submissionController)
);

router.get(
    "/:submissionId",
    submissionController.findById.bind(submissionController)
);

export default router;