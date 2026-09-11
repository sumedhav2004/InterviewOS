import { AppError } from "../../core/errors/app-error";
import { QuestionsRepository } from "../repositories/questions.repository";
import { TestCaseRepository } from "../repositories/testCase.repository";
import { UserRepository } from "../repositories/user.repository";
import { createTestCaseData, updateTestCaseData } from "../types/testCase";

export class TestCaseService{
    constructor(
        private readonly questionRepository = new QuestionsRepository,
        private readonly userRepository = new UserRepository,
        private readonly testCaseRepository = new TestCaseRepository
    ){}

    async findById(id:string, requesterId:string, questionId:string){
        const question = await this.questionRepository.findById(questionId)
        if(!question){
            throw new AppError(
                "Question Not Found",
                404,
                "QUESTION_NOT_FOUND"
            )
        }

        if(question.createdById !== requesterId){
            throw new AppError(
                "Unauthorized",
                403,
                "UNAUTHORIZED"
            )
        }

        return this.testCaseRepository.findById(id)
    }

    async findAllTestCasesForAQuestion(questionId:string){
        const question = await this.questionRepository.findById(questionId)
        if(!question){
            throw new AppError(
                "Question Not Found",
                404,
                "QUESTION_NOT_FOUND"
            )
        }

        return this.testCaseRepository.getAllTestCasesForAQuestion(questionId)
    }

    async findVisibleTestCasesForAQuestion(questionId:string){
        const question = await this.questionRepository.findById(questionId)
        if(!question){
            throw new AppError(
                "Question Not Found",
                404,
                "QUESTION_NOT_FOUND"
            )
        }

        return this.testCaseRepository.getVisibleTestCasesForAQuestion(questionId)
    }

    async findHiddenTestCasesForAQuestion(questionId:string){
        const question = await this.questionRepository.findById(questionId)
        if(!question){
            throw new AppError(
                "Question Not Found",
                404,
                "QUESTION_NOT_FOUND"
            )
        }

        return this.testCaseRepository.getHiddenTestCasesForAQuestion(questionId)
    }

    async createTestCase(questionId:string, requesterId:string, data:createTestCaseData){
        const question = await this.questionRepository.findById(questionId)
        if(!question){
            throw new AppError(
                "Question Not Found",
                404,
                "QUESTION_NOT_FOUND"
            )
        }
        if(question.createdById !== requesterId){
            throw new AppError(
                "Unauthorized",
                403,
                "UNAUTHORIZED"
            )
        }

        return this.testCaseRepository.createTestCase(questionId, data)
    }

    async updateTestCase(id:string,questionId:string, requesterId:string, data:updateTestCaseData){
        const testCase = await this.testCaseRepository.findById(id)
        if(!testCase){
            throw new AppError(
                "Test Case Not Found",
                404,
                "TEST_CASE_NOT_FOUND"
            )
        }
        if(testCase.questionId !== questionId){
            throw new AppError(
                "Invalid Question",
                400,
                "INVALID_QUESTION"
            )
        }

        const question = await this.questionRepository.findById(questionId)
        if(!question){
            throw new AppError(
                "Question Not Found",
                404,
                "QUESTION_NOT_FOUND"
            )
        }
        if(question.createdById !== requesterId){
            throw new AppError(
                "Unauthorized",
                403,
                "UNAUTHORIZED"
            )
        }

        return this.testCaseRepository.updateTestCase(id, data)
    }

    async deleteTestCase(id:string, questionId:string, requesterId:string){
        const testCase = await this.testCaseRepository.findById(id)
        if(!testCase){
            throw new AppError(
                "Test Case Not Found",
                404,
                "TEST_CASE_NOT_FOUND"
            )
        }
        if(testCase.questionId !== questionId){
            throw new AppError(
                "Invalid Question",
                400,
                "INVALID_QUESTION"
            )
        }

        const question = await this.questionRepository.findById(questionId)
        if(!question){
            throw new AppError(
                "Question Not Found",
                404,
                "QUESTION_NOT_FOUND"
            )
        }
        if(question.createdById !== requesterId){
            throw new AppError(
                "Unauthorized",
                403,
                "UNAUTHORIZED"
            )
        }

        return this.testCaseRepository.deleteTestCase(id)
    }
}