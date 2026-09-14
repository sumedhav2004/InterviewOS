import { Request, Response } from "express";
import { SubmissionService } from "../services/submission.service";

export class SubmissionController {
    constructor(
        private readonly submissionService = new SubmissionService
    ) {}

    async createSubmission(req: Request, res: Response) {
        const {
            interviewQuestionId,
            participantId,
            ...data
        } = req.body;

        const requesterId = req.user.id;

        const submission =
            await this.submissionService.createSubmission(
                interviewQuestionId,
                participantId,
                requesterId,
                data
            );

        return res.status(201).json(submission);
    }

    async findById(req: Request, res: Response) {
        const submissionId = req.params.submissionId;
        const requesterId = req.user.id;

        const submission = await this.submissionService.getSubmissionById(
            submissionId,
            requesterId
        );

        return res.status(200).json(submission);
    }
}