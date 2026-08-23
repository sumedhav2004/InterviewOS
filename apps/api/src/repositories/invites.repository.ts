import { InviteStatus, prisma, Prisma } from "@interview-os/database";
import { CreateInviteData, UpdateInviteData } from "../types/invite";

export class InvitesRepository{
    async getSentInvites(userId : string){
        return prisma.invite.findMany({
            where: {
                senderId: userId
            }
        })
    }

    async getReceivedInvites(userId : string){
        return prisma.invite.findMany({
            where: {
                receiverId: userId
            }
        })
    }

    async createInvite(senderId:string, receiverId:string, interviewId:string, data: CreateInviteData){
        return prisma.invite.create({
            data: {
                ...data,
                senderId,
                receiverId,
                interviewId
            }
        })
    }

    async findByInterviewAndReceiver(
        interviewId: string,
        receiverId: string
    ) {
        return prisma.invite.findUnique({
            where: {
                interviewId_receiverId: {
                    interviewId,
                    receiverId,
                },
            },
        });
    }

    async deleteInvite(interviewId: string, receiverId: string) {
        return prisma.invite.delete({
            where: {
                interviewId_receiverId: {
                    interviewId,
                    receiverId,
                },
            },
        });
    }

    async updateInvite(interviewId:string, receiverId:string, data: UpdateInviteData){
        return prisma.invite.update({
            where: {
                interviewId_receiverId: {
                    interviewId,
                    receiverId
                }
            },
            data
        })
    }

    async findById(id: string) {
        return prisma.invite.findUnique({
            where: {
                id,
            },
        });
    }

    async updateInviteStatus(
        id: string,
        status: InviteStatus,
        respondedAt: Date | null = null,
        db: Prisma.TransactionClient | typeof prisma = prisma
    ) {
        return db.invite.update({
            where: {
                id
            },
            data: {
                status,
                respondedAt
            }
        });
    }

}