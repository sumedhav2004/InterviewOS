import { Prisma, prisma } from "@interview-os/database";
import { CreateParticipantData, UpdateParticipantData } from "../types/participant";

export class ParticipantRepository{
    async createParticipant(userId: string, interviewId: string, data: CreateParticipantData, db: Prisma.TransactionClient | typeof prisma = prisma){
        const participant = await db.participant.create({
            data: {
                ...data,
                userId,
                interviewId
            }
        })
        return participant
    }

    async updateParticipant(userId: string, interviewId: string, data: UpdateParticipantData){
        const participant = await prisma.participant.update({
            where: {
                interviewId_userId: {
                    userId,
                    interviewId
                }
            },
            data
        })
        return participant
    }

    async deleteParticipant(userId: string, interviewId:string){
        return prisma.participant.delete({
            where: {
                interviewId_userId: {
                    userId,
                    interviewId
                }
            }
        })
    }

    async findParticipantsForInterview(interviewId: string){
        return prisma.participant.findMany({
            where: {
                interviewId
            },
            orderBy: {
                createdAt: "desc",
            }
        })
    }

    async findParticipationOfUser(userId: string){
        return prisma.participant.findMany({
            where: {
                userId
            },
            orderBy: {
                createdAt: "desc",
            }
        })
    }

    async findParticipant(userId:string, interviewId:string){
        return prisma.participant.findUnique({
            where: {
                interviewId_userId: {
                    userId,
                    interviewId
                }
            }
        })
    }


}