import { Request, Response } from "express";
import { InterviewParticipantService } from "../services/interviewParticipant.service";

export class ParticipantController {
  constructor(private readonly participantService = new InterviewParticipantService()) {}

  async createParticipant(req: Request, res: Response) {
    const requesterId = req.user.id;
    const interviewId = req.params.interviewId;

    if (typeof interviewId !== "string") {
      return res.status(400).json({
        message: "Invalid route parameter",
      });
    }
    const { targetId, ...data } = req.body;

    const participant = await this.participantService.createParticipant(
      requesterId,
      targetId,
      interviewId,
      data,
    );
    return res.status(201).json(participant);
  }

  async updateParticipant(req: Request, res: Response) {
    const requesterId = req.user.id;
    const interviewId = req.params.interviewId;

    if (typeof interviewId !== "string") {
      return res.status(400).json({
        message: "Invalid route parameter",
      });
    }
    const { targetId, ...data } = req.body;

    const participant = await this.participantService.updateParticipant(
      requesterId,
      targetId,
      interviewId,
      data,
    );
    return res.status(200).json(participant);
  }

  async getParticipantsForInterview(req: Request, res: Response) {
    const userId = req.user.id;
    const interviewId = req.params.interviewId;

    if (typeof interviewId !== "string") {
      return res.status(400).json({
        message: "Invalid route parameter",
      });
    }

    const participants = await this.participantService.getParticipantsForInterview(
      interviewId,
      userId,
    );
    return res.status(200).json(participants);
  }
}
