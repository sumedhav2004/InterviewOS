import { Request, Response } from "express";
import { QuestionService } from "../services/question.service";

export class QuestionController{
    constructor(
        private readonly questionService = new QuestionService
    ){}

    async findById(req:Request, res:Response){
        const id = req.params.questionId

        const question = await this.questionService.findById(id)
        return res.status(200).json(question)
    }

    async findMyQuestions(req:Request, res:Response){
        const userId = req.user.id

        const questions = await this.questionService.findMyQuestions(userId)
        return res.status(200).json(questions)
    }

    async createQuestion(req:Request, res:Response){
        const userId = req.user.id 
        const data = req.body

        const question = await this.questionService.createQuestion(userId, data)
        return res.status(200).json(question)
    }

    async deleteQuestion(req:Request, res:Response){
        const id = req.params.questionId
        const userId = req.user.id 

        await this.questionService.deleteQuestion(id, userId)
        return res.sendStatus(204)
    }

    async updateQuestion(req:Request, res:Response){
        const id = req.params.questionId
        const userId = req.user.id 
        const data = req.body

        const question = await this.questionService.updateQuestion(id, userId, data)
        return res.status(200).json(question)
    }
}