import { prisma, Prisma } from "@interview-os/database";
import { ResumeData, UpdateResumeData } from "../types/resume";



export class ResumeRepository{
    async findById(id: string){
        return prisma.resume.findUnique({
            where: {
                id,
            }
        })
    }

    async findByUserId(userId: string){
        return prisma.resume.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        })
    }

    async createResume(userId: string , data: ResumeData){
        return prisma.resume.create({
            data: {
                ...data,
                userId
            }
        })
    }

    async deleteResume(id: string){
        return prisma.resume.delete({
            where: {
                id,
            }
        })
    }

    async updateResume(id: string , data: UpdateResumeData){
        return prisma.resume.update({
            where: {
                id,
            },
            data,
        })
    }
}