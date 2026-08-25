import { prisma } from "@interview-os/database";
import { CreateInterviewQuestionData, UpdateInterviewQuestionData } from "../types/interviewQuestion";

export class InterviewQuestionRepository{
    async findById(id:string){
        return prisma.interviewQuestion.findUnique({
            where: {
                id
            }
        })
    }

    async findInterviewQuestion(interviewId:string, questionId:string){
        return prisma.interviewQuestion.findUnique({
            where: {
                interviewId_questionId: {
                    interviewId,
                    questionId
                }
            }
        })
    }

    async createInterviewQuestion(interviewId:string, questionId:string, data: CreateInterviewQuestionData){
        return prisma.interviewQuestion.create({
            data: {
                ...data,
                interviewId,
                questionId
            }
        })
    }

    async updateInterviewQuestion(id:string, data: UpdateInterviewQuestionData){
        return prisma.interviewQuestion.update({
            where: {
                id
            },
            data
        })
    }

    async deleteInterviewQuestion(id:string){
        return prisma.interviewQuestion.delete({
            where: {
                id
            }
        })
    }

    async findByInterview(interviewId: string) {
        return prisma.interviewQuestion.findMany({
            where: {
                interviewId,
            },
            include: {
                question: true,
            },
            orderBy: {
                questionOrder: "asc",
            },
        });
    }
}