import { prisma } from "@interview-os/database";
import { createQuestionData, updateQuestionData } from "../types/question";

export class QuestionsRepository{
    async findById(id:string){
        return prisma.question.findUnique({
            where: {
                id
            }
        })
    }

    async findMyQuestions(userId:string){
        return prisma.question.findMany({
            where: {
                createdById: userId
            }
        })
    }

    async createQuestion(userId:string, data: createQuestionData){
        return prisma.question.create({
            data: {
                ...data,
                createdById: userId
            }
        })
    }
    async deleteQuestion(id:string){
        return prisma.question.delete({
            where: {
                id
            }
        })
    }

    async updateQuestion(id:string, data: updateQuestionData){
        return prisma.question.update({
            where: {
                id
            },
            data
        })
    }
}