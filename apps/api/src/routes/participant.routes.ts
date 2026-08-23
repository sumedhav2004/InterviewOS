import { Router } from "express";
import { ParticipantController } from "../controllers/participant.controller";

const router = Router()
const participantController = new ParticipantController()

router.get("/:interviewId/participants", participantController.getParticipantsForInterview.bind(participantController))
router.post("/:interviewId/participants", participantController.createParticipant.bind(participantController))
router.patch("/:interviewId/participants/:targetId", participantController.updateParticipant.bind(participantController))

export default router