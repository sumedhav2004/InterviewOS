import { Request, Response } from "express";
import { InterviewService } from "../services/interview.service";

export class InterviewController{
    constructor(
        private readonly interviewService = new InterviewService
    ){}

    async findInterviewById(req: Request, res: Response){
        const id = req.params.id

        const interview = await this.interviewService.findInterviewById(id)
        return res.status(200).json(interview)
    }

    async findAllInterviewsByUserId(req: Request, res: Response){
        const userId = req.user.id

        const interviews = await this.interviewService.findAllInterviewsByUserId(userId);
        return res.status(200).json(interviews)
    }

    async createInterview(req: Request, res: Response){
        const userId = req.user.id
        const data = req.body

        const interview = await this.interviewService.createInterview(userId, data)
        return res.status(201).json(interview)
    }

    async deleteInterview(req: Request, res: Response){
        const id = req.params.id
        const userId = req.user.id
        
        await this.interviewService.deleteInterview(id, userId)
        return res.sendStatus(204)
    }

    async updateInterview(req: Request, res: Response){
        const id = req.params.id
        const userId = req.user.id
        const data = req.body

        const updatedInterview = await this.interviewService.updateInterview(id, userId, data);
        return res.status(200).json(updatedInterview)
    }
}