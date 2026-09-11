import { CodeRunService } from "../services/code-run.service";
import { Request, Response } from "express";

export class CodeRunController{
    constructor(
        private readonly codeRunService = new CodeRunService
    ){}

    async createCodeRun(req:Request, res:Response){
        const {interviewQuestionId, participantId, ...data} = req.body
        const requesterId = req.user.id
        const createdCodeRun = await this.codeRunService.createCodeRun(interviewQuestionId,participantId,requesterId, data)
        return res.status(201).json(createdCodeRun)
    }

    async updateCodeRun(req:Request, res:Response){
        const id = req.params.id 
        const requesterId = req.user.id
        const {interviewQuestionId, participantId, ...data} = req.body
        const updatedCodeRun = await this.codeRunService.updateCodeRun(id, participantId,requesterId, data )
        return res.status(200).json(updatedCodeRun)
    }

    async executeCodeRun(req: Request, res: Response) {
        const id  = req.params.id;
        const requesterId = req.user.id;

        const result = await this.codeRunService.executeCodeRun(
            id,
            requesterId
        );

        return res.status(202).json(result);
    }
}