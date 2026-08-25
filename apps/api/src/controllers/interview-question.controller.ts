import { Request, Response } from "express";
import { InterviewQuestionService } from "../services/interview-question.service";

export class InterviewQuestionController{
    constructor(
        private readonly interviewQuestionService = new InterviewQuestionService
    ){}

    async findById(req:Request<{interviewQuestionId:string}>, res:Response){
        const id = req.params.interviewQuestionId

        const interviewQuestion = await this.interviewQuestionService.findById(id)
        return res.status(200).json(interviewQuestion)
    }

    async findByInterview(req:Request<{interviewId:string}>, res:Response){
        const interviewId = req.params.interviewId

        const interviewQuestions = await this.interviewQuestionService.findByInterview(interviewId)
        return res.status(200).json(interviewQuestions)
    }

    async findInterviewQuestion(req:Request<{interviewId:string, questionId:string}>, res:Response){
        const {interviewId, questionId} = req.params

        const interviewQuestion = await this.interviewQuestionService.findInterviewQuestion(interviewId, questionId)
        return res.status(200).json(interviewQuestion)
    }

    async createInterviewQuestion(req:Request<{interviewId:string, questionId:string}>, res:Response){
        const requesterId = req.user.id
        const {interviewId, questionId} = req.params 
        const data = req.body

        const interviewQuestion = await this.interviewQuestionService.createInterviewQuestion(interviewId, questionId, requesterId, data)
        return res.status(201).json(interviewQuestion)
    }

    async updateInterviewQuestion(req:Request<{interviewId:string, questionId:string, interviewQuestionId:string}>, res:Response){
        const {interviewId, questionId, interviewQuestionId} = req.params 
        const requesterId = req.user.id
        const data = req.body 

        const interviewQuestion = await this.interviewQuestionService.updateInterviewQuestion(interviewQuestionId , interviewId, questionId, requesterId, data)
        return res.status(200).json(interviewQuestion)
    }

    async deleteInterviewQuestion(req:Request<{interviewId:string, questionId:string, interviewQuestionId:string}>, res:Response){
        const requesterId = req.user.id 
        const {interviewId, questionId, interviewQuestionId} = req.params 

        await this.interviewQuestionService.deleteInterviewQuestion(interviewQuestionId, requesterId, interviewId, questionId)
        return res.sendStatus(204)
    }
}