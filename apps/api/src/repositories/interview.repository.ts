import { prisma } from "@interview-os/database";
import { createInterviewData, updateInterviewData } from "../types/interview";

export class InterviewRepository{
    async createInterview(userId: string, data: createInterviewData){
        return prisma.interview.create({
            data: {
                ...data,
                createdById: userId,
            }
        })
    }
    async deleteInterview(id: string){
        return prisma.interview.delete({
            where: {
                id
            }
        })
    }

    async updateInterview(id: string, data: updateInterviewData){
        return prisma.interview.update({
            where: {
                id,
            },
            data,
        })
    }

    async findById(id: string){
        return prisma.interview.findUnique({
            where: {
                id,
            }
        })
    }

    async findByUserId(userId: string){
        return prisma.interview.findMany({
            where: {
                createdById: userId
            },
            orderBy: {
                createdAt: "desc",
            },
        })
    }
}