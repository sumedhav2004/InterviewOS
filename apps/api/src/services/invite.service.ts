import { InterviewStatus, InviteStatus, Prisma, prisma } from "@interview-os/database";
import { AppError } from "../../core/errors/app-error";
import { InterviewRepository } from "../repositories/interview.repository";
import { InvitesRepository } from "../repositories/invites.repository";
import { ParticipantRepository } from "../repositories/participant.repository";
import { UserRepository } from "../repositories/user.repository";
import { CreateInviteData } from "../types/invite";

export class InviteService{
    constructor(
        private readonly inviteRepository = new InvitesRepository,
        private readonly interviewRepository = new InterviewRepository,
        private readonly userRepository = new UserRepository,
        private readonly participantRepository = new ParticipantRepository
    ){}

    async createInvite(
        senderId: string,
        receiverId: string,
        interviewId: string,
        data: CreateInviteData
    ){
        const interview = await this.interviewRepository.findById(interviewId)

        if(!interview){
            throw new AppError(
                "Interview Not Found",
                404,
                "INTERVIEW_NOT_FOUND"
            )
        }
        if (interview.status !== InterviewStatus.SCHEDULED) {
            throw new AppError(
                "Invites can only be sent for scheduled interviews",
                400,
                "INVALID_INTERVIEW_STATUS"
            );
        }
        if(interview.createdById !== senderId){
            throw new AppError(
                "Unauthorized",
                403,
                "UNAUTHORIZED"
            )
        }

        const receiver = await this.userRepository.findById(receiverId)

        if(!receiver){
            throw new AppError(
                "Receiver Not Found",
                404,
                "RECEIVER_NOT_FOUND"
            )
        }

        const participant = await this.participantRepository.findParticipant(receiverId, interviewId)
        if(participant){
            throw new AppError(
                "User is Already a Participant",
                409,
                "USER_ALREADY_PARTICIPANT"
            )
        }

        const invite = await this.inviteRepository.findByInterviewAndReceiver(interviewId, receiverId)
        if(invite){
            throw new AppError(
                "Invite Already Exists",
                409,
                "INVITE_ALREADY_EXISTS"
            )
        }

        return this.inviteRepository.createInvite(senderId, receiverId, interviewId, data)

    }

    async acceptInvite(
        inviteId: string,
        receiverId: string
    ) {
        const invite =
            await this.inviteRepository.findById(inviteId);

        if (!invite) {
            throw new AppError(
                "Invite Not Found",
                404,
                "INVITE_NOT_FOUND"
            );
        }

        if (invite.receiverId !== receiverId) {
            throw new AppError(
                "Unauthorized",
                403,
                "UNAUTHORIZED"
            );
        }

        if (invite.status !== InviteStatus.PENDING) {
            throw new AppError(
                "Invite Status Not Pending",
                400,
                "INVITE_NOT_PENDING"
            );
        }

        return prisma.$transaction(async (tx) => {

            const updatedInvite =
                await this.inviteRepository.updateInviteStatus(
                    inviteId,
                    InviteStatus.ACCEPTED,
                    new Date(),
                    tx
                );

            const participant =
                await this.participantRepository.createParticipant(
                    receiverId,
                    invite.interviewId,
                    {
                        role: invite.role
                    },
                    tx
                );

            return {
                invite: updatedInvite,
                participant
            };
        });
    }

    async declineInvite(inviteId:string, receiverId:string){
        const invite = await this.inviteRepository.findById(inviteId);

        if (!invite) {
            throw new AppError(
                "Invite Not Found",
                404,
                "INVITE_NOT_FOUND"
            );
        }

        if (invite.receiverId !== receiverId) {
            throw new AppError(
                "Unauthorized",
                403,
                "UNAUTHORIZED"
            );
        }

        if (invite.status !== InviteStatus.PENDING) {
            throw new AppError(
                "Invite Status Not Pending",
                400,
                "INVITE_NOT_PENDING"
            );
        }

        return this.inviteRepository.updateInviteStatus(inviteId, InviteStatus.DECLINED, new Date())
    }

    async cancelInvite(inviteId: string, senderId:string){
        const invite = await this.inviteRepository.findById(inviteId);

        if (!invite) {
            throw new AppError(
                "Invite Not Found",
                404,
                "INVITE_NOT_FOUND"
            );
        }

        if (invite.senderId !== senderId) {
            throw new AppError(
                "Unauthorized",
                403,
                "UNAUTHORIZED"
            );
        }

        if (invite.status !== InviteStatus.PENDING) {
            throw new AppError(
                "Invite Status Not Pending",
                400,
                "INVITE_NOT_PENDING"
            );
        }

        return this.inviteRepository.updateInviteStatus(inviteId, InviteStatus.CANCELLED)

    }
}