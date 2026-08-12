import { Request, Response } from "express";
import { ResumeService } from "../services/resume.service";

export class ResumeController{
    constructor(
        private resumeService: ResumeService
    ) {}

    async getResumes (req:Request, res:Response){
        const userId = req.user.id;
        const resumes = await this.resumeService.findByUserId(userId);

        return res.status(200).json(resumes);
    }

    async getResume(req:Request, res:Response){
        const id = req.params.id;
        const resume = await this.resumeService.findById(id);

        return res.status(200).json(resume);
    }

    async deleteResume(req:Request, res:Response){
        const id = req.params.id;
        const userId = req.user.id;
        await this.resumeService.deleteResume(id, userId);

        return res.status(204).send()
    }

    async updateResume(req:Request, res:Response){
        const id = req.params.id;
        const userId = req.user.id;
        const data = req.body;

        const updatedResume = await this.resumeService.updateResume(id,userId,data);

        return res.status(200).json(updatedResume);
    }

    async createResume(req:Request, res:Response){
        const userId = req.user.id;
        const data = req.body;

        const createdResume = await this.resumeService.createResume(userId, data);

        return res.status(201).json(createdResume)
    }
}