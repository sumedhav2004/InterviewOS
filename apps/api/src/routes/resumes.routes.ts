import { Router } from "express";
import { ResumeController } from "../controllers/resumes.controller";

const router = Router();

const resumeController = new ResumeController();

router.get("/:id", resumeController.getResume.bind(resumeController));
router.get("/", resumeController.getResumes.bind(resumeController));
router.delete("/:id", resumeController.deleteResume.bind(resumeController));
router.patch("/:id", resumeController.updateResume.bind(resumeController));
router.post("/", resumeController.createResume.bind(resumeController))

export default router;