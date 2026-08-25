import { InterviewQuestionRepository } from "../repositories/interview-question.repository";
import { InterviewRepository } from "../repositories/interview.repository"
import { QuestionsRepository } from "../repositories/questions.repository"
import { AppError } from "../../core/errors/app-error";
import { ParticipantRepository } from "../repositories/participant.repository"
import { CreateInterviewQuestionData, UpdateInterviewQuestionData } from "../types/interviewQuestion";
import { InterviewStatus, ParticipantRole } from "@interview-os/database";

export class InterviewQuestionService{
    constructor(
        private readonly interviewQuestionRepository = new InterviewQuestionRepository,
        private readonly interviewRepository = new InterviewRepository,
        private readonly questionRepository = new QuestionsRepository,
        private readonly participantRepository = new ParticipantRepository
    ){}

    async findById(id :string){
        return this.interviewQuestionRepository.findById(id)
    }

    async findByInterview(interviewId: string){
        const interview = await this.interviewRepository.findById(interviewId)
        if(!interview){
            throw new AppError(
                "Interview Not Found",
                404,
                "INTERVIEW_NOT_FOUND"
            )
        }

        return this.interviewQuestionRepository.findByInterview(interviewId)
    }

    async findInterviewQuestion(interviewId:string, questionId:string){
        const interview = await this.interviewRepository.findById(interviewId)
        if(!interview){
            throw new AppError(
                "Interview Not Found",
                404,
                "INTERVIEW_NOT_FOUND"
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

        return this.interviewQuestionRepository.findInterviewQuestion(interviewId, questionId)
    }

    async createInterviewQuestion(interviewId:string, questionId:string, requesterId:string, data:CreateInterviewQuestionData){
        const interview = await this.interviewRepository.findById(interviewId)
        if(!interview){
            throw new AppError(
                "Interview Not Found",
                404,
                "INTERVIEW_NOT_FOUND"
            )
        }

        const participant = await this.participantRepository.findParticipant(interviewId, requesterId);
        if(!participant || participant.role !== ParticipantRole.INTERVIEWER){
            throw new AppError(
                "Unauthorized",
                403,
                "UNAUTHORIZED"
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

        if(interview.status !== InterviewStatus.DRAFT && interview.status !== InterviewStatus.SCHEDULED && interview.status !== InterviewStatus.INPROGRESS){
            throw new AppError(
                "Question Cannot be Added in the current state",
                400,
                "QUESTION_CANT_BE_ADDED"
            )
        }

        const existingInterviewQuestion = await this.interviewQuestionRepository.findInterviewQuestion(interviewId, questionId)
        if(existingInterviewQuestion){
            throw new AppError(
                "Question Already Added",
                409,
                "QUESTION_ALREADY_ADDED"
            )
        }

        const previousInterviewQuestions = await this.interviewQuestionRepository.findByInterview(interviewId)
        const expectedOrder = previousInterviewQuestions.length + 1

        if(data.questionOrder !== expectedOrder){
            throw new AppError(
                "Invalid Order",
                400,
                "INVALID_ORDER"
            )
        }

        if(data.points < 1){
            throw new AppError(
                "Invalid Points",
                400,
                "INVALID_POINTS"
            )
        }

        return this.interviewQuestionRepository.createInterviewQuestion(interviewId, questionId, data)

    }

    async updateInterviewQuestion(
        id:string,
        interviewId: string,
        questionId: string,
        requesterId: string,
        data: UpdateInterviewQuestionData
    ) {
        const interview =
            await this.interviewRepository.findById(interviewId);

        if (!interview) {
            throw new AppError(
                "Interview Not Found",
                404,
                "INTERVIEW_NOT_FOUND"
            );
        }

        const participant =
            await this.participantRepository.findParticipant(
                interviewId,
                requesterId
            );

        if (
            !participant ||
            participant.role !== ParticipantRole.INTERVIEWER
        ) {
            throw new AppError(
                "Unauthorized",
                403,
                "UNAUTHORIZED"
            );
        }

        const interviewQuestion =
            await this.interviewQuestionRepository.findById(id);

        if (!interviewQuestion) {
            throw new AppError(
                "Interview Question Not Found",
                404,
                "INTERVIEW_QUESTION_NOT_FOUND"
            );
        }

        if (interviewQuestion.interviewId !== interviewId ||
             interviewQuestion.questionId !== questionId
        ) {
            throw new AppError(
                "Interview Question Not Found",
                404,
                "INTERVIEW_QUESTION_NOT_FOUND"
            );
        }

        if (
            interview.status !== InterviewStatus.DRAFT &&
            interview.status !== InterviewStatus.SCHEDULED &&
            interview.status !== InterviewStatus.INPROGRESS
        ) {
            throw new AppError(
                "Questions cannot be modified in the current interview state",
                400,
                "QUESTION_CANNOT_BE_MODIFIED"
            );
        }

        if (Object.keys(data).length === 0) {
            throw new AppError(
                "No Updation Data",
                400,
                "NO_UPDATION_DATA"
            );
        }

        if (
            data.points !== undefined &&
            data.points < 1
        ) {
            throw new AppError(
                "Invalid Points",
                400,
                "INVALID_POINTS"
            );
        }

        return this.interviewQuestionRepository.updateInterviewQuestion(
            id,
            data
        );
    }

    async deleteInterviewQuestion(id:string, requesterId:string, interviewId:string, questionId:string){
        const interview = await this.interviewRepository.findById(interviewId)
        if(!interview){
            throw new AppError(
                "Interview Not Found",
                404,
                "INTERVIEW_NOT_FOUND"
            )
        }

        const interviewQuestion = await this.interviewQuestionRepository.findById(id);

            if (!interviewQuestion) {
                throw new AppError(
                    "Interview Question Not Found",
                    404,
                    "INTERVIEW_QUESTION_NOT_FOUND"
                );
            }

        
            if (
                interviewQuestion.interviewId !== interviewId ||
                interviewQuestion.questionId !== questionId
            ) {
                throw new AppError(
                    "Interview Question Not Found",
                    404,
                    "INTERVIEW_QUESTION_NOT_FOUND"
                );
            }

        const participant =
            await this.participantRepository.findParticipant(
                interviewId,
                requesterId
            );

        if (
            !participant ||
            participant.role !== ParticipantRole.INTERVIEWER
        ) {
            throw new AppError(
                "Unauthorized",
                403,
                "UNAUTHORIZED"
            );
        }

        if (
            interview.status !== InterviewStatus.DRAFT &&
            interview.status !== InterviewStatus.SCHEDULED &&
            interview.status !== InterviewStatus.INPROGRESS
        ) {
            throw new AppError(
                "Questions cannot be deleted in the current interview state",
                400,
                "QUESTION_CANNOT_BE_DELETED"
            );
        }

        return this.interviewQuestionRepository.deleteInterviewQuestion(id)
    }
}