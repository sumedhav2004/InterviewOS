import { AppError } from "../../core/errors/app-error";
import { InterviewRepository } from "../repositories/interview.repository";
import { ParticipantRepository } from "../repositories/participant.repository";
import { UserRepository } from "../repositories/user.repository";

import {
    CreateParticipantData,
    UpdateParticipantData,
} from "../types/participant";

export class InterviewParticipantService {
    constructor(
        private readonly participantRepository = new ParticipantRepository,
        private readonly interviewRepository = new InterviewRepository,
        private readonly userRepository = new UserRepository
    ) {}

    async createParticipant(
        requesterId: string,
        targetId: string,
        interviewId: string,
        data: CreateParticipantData
    ) {
        // 1. Find interview
        const interview =
            await this.interviewRepository.findById(interviewId);

        if (!interview) {
            throw new AppError(
                "Interview Not Found",
                404,
                "INTERVIEW_NOT_FOUND"
            );
        }

        // 2. Check that requester owns interview
        if (interview.createdById !== requesterId) {
            throw new AppError(
                "Unauthorized",
                403,
                "UNAUTHORIZED"
            );
        }

        // 3. Check that target user exists
        const targetUser =
            await this.userRepository.findById(targetId);

        if (!targetUser) {
            throw new AppError(
                "User Not Found",
                404,
                "USER_NOT_FOUND"
            );
        }

        // 4. Check duplicate participation
        const existing =
            await this.participantRepository.findParticipant(
                interviewId,
                targetId
            );

        if (existing) {
            throw new AppError(
                "User is already a participant",
                409,
                "PARTICIPANT_ALREADY_EXISTS"
            );
        }

        if(!data){
            throw new AppError(
                "Invalid Data",
                400,
                "INVALID_DATA"
            )
        }

        // 5. Finally create
        return this.participantRepository.createParticipant(
            targetId,
            interviewId,
            data
        );
    }

    async updateParticipant(requesterId: string, targetId:string, interviewId:string, data: UpdateParticipantData){
        // 1. Find interview
        const interview =
            await this.interviewRepository.findById(interviewId);

        if (!interview) {
            throw new AppError(
                "Interview Not Found",
                404,
                "INTERVIEW_NOT_FOUND"
            );
        }

        // 2. Check that requester owns interview
        if (interview.createdById !== requesterId) {
            throw new AppError(
                "Unauthorized",
                403,
                "UNAUTHORIZED"
            );
        }

        // 3. Check that target user exists
        const participant =
            await this.participantRepository.findParticipant(
                interviewId,
                targetId
            );

        if (!participant) {
            throw new AppError(
                "Participant Not Found",
                404,
                "PARTICIPANT_NOT_FOUND"
            );
        }

        if(!data){
            throw new AppError(
                "Invalid Data",
                400,
                "INVALID_DATA"
            )
        }

        return this.participantRepository.updateParticipant(targetId, interviewId, data)
    }

    async getParticipantsForInterview(interviewId:string, userId: string){
        const interview = await this.interviewRepository.findById(interviewId);

        if(!interview){
            throw new AppError(
                "Interview Not Found",
                404,
                "INTERVIEW_NOT_FOUND"
            )
        }

        const participant = await this.participantRepository.findParticipant(userId, interviewId)

        if((interview.createdById !== userId) || (participant?.userId !== userId)){
            throw new AppError(
                "Unauthorized",
                403,
                "UNAUTHORIZED"
            )
        }

        return this.participantRepository.findParticipantsForInterview(interviewId)
    }
}