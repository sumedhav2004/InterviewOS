import { request, Request, Response } from "express";
import { TestCaseService } from "../services/testCase.service";

export class TestCaseController{
    constructor(
        private readonly testCaseService = new TestCaseService
    ){}

    async findById(req:Request, res:Response){
        const testCaseId = req.params.testCaseId
        const questionId = req.params.questionId
        const requesterId = req.user.id

        const testCase = await this.testCaseService.findById(testCaseId, requesterId, questionId)
        return res.status(200).json(testCase)
    }

    async findAllTestCasesForAQuestion(req:Request, res:Response){
        
        const questionId = req.params.questionId
        const requesterId =req.user.id 

        const testCases = await this.testCaseService.findAllTestCasesForAQuestion(questionId)
        return res.status(200).json(testCases)
    }

    async findAllVisibleTestCasesForAQuestion(req:Request, res:Response){
        const {questionId} = req.params 
        const requesterId = req.user.id 

        const visibleTestCases = await this.testCaseService.findVisibleTestCasesForAQuestion(questionId)
        return res.status(200).json(visibleTestCases)
    }

    async findAllHiddenTestCasesForAQuestion(req:Request, res:Response){
        const {questionId} = req.params 
        const requesterId = req.user.id 

        const hiddenTestCases = await this.testCaseService.findHiddenTestCasesForAQuestion(questionId)
        return res.status(200).json(hiddenTestCases)
    }

    async createTestCase(req:Request, res:Response){
        const {questionId} = req.params 
        const requesterId = req.user.id 
        const data = req.body 

        const createdTestCase = await this.testCaseService.createTestCase(questionId, requesterId, data)
        return res.status(201).json(createdTestCase)
    }

    async updateTestCase(req:Request, res:Response){
        const {questionId, testCaseId} = req.params 
        const requesterId = req.user.id 
        const data = req.body 

        const updatedTestCase = await this.testCaseService.updateTestCase(testCaseId, questionId, requesterId, data)
        return res.status(200).json(updatedTestCase)
    }

    async deleteTestCase(req:Request, res:Response){
        const {questionId, testCaseId} = req.params
        const requesterId = req.user.id 
        
        await this.testCaseService.deleteTestCase(testCaseId,questionId, requesterId)
        return res.sendStatus(204)
    }
}