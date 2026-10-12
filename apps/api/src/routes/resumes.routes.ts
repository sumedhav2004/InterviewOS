import { Router } from "express";
import { ResumeController } from "../controllers/resumes.controller";
import { ResumeService } from "../services/resume.service";

const router = Router();

const resumeService = new ResumeService();
const resumeController = new ResumeController(resumeService);

router.get("/:id", resumeController.getResume.bind(resumeController));
router.get("/", resumeController.getResumes.bind(resumeController));
router.delete("/:id", resumeController.deleteResume.bind(resumeController));
router.patch("/:id", resumeController.updateResume.bind(resumeController));
router.post("/", resumeController.createResume.bind(resumeController));

export default router;
