import { prisma } from "@interview-os/database";
import { createTestCaseData, updateTestCaseData } from "../types/testCase";

export class TestCaseRepository{
    async createTestCase(questionId:string, data:createTestCaseData){
        return prisma.testCase.create({
            data: {
                questionId,
                ...data
            }
        })
    }

    async updateTestCase(id:string, data:updateTestCaseData){
        return prisma.testCase.update({
            where: {
                id
            }, 
            data
        })
    }

    async deleteTestCase(id:string){
        return prisma.testCase.delete({
            where: {
                id
            }
        })
    }

    async getAllTestCasesForAQuestion(questionId:string){
        return prisma.testCase.findMany({
            where: {
                questionId
            }
        })
    }

    async getVisibleTestCasesForAQuestion(questionId:string){
        return prisma.testCase.findMany({
            where: {
                questionId,
                visibility: "VISIBLE"
            }
        })
    }

    async getHiddenTestCasesForAQuestion(questionId:string){
        return prisma.testCase.findMany({
            where: {
                questionId,
                visibility: "HIDDEN"
            }
        })
    }

    async findById(id:string){
        return prisma.testCase.findFirst({
            where: {
                id
            }
        })
    }
}