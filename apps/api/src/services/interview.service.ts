import { AppError } from "../../core/errors/app-error";
import { InterviewRepository } from "../repositories/interview.repository";
import { createInterviewData, updateInterviewData } from "../types/interview";

export class InterviewService{
    constructor(
        private readonly interviewRepository = new InterviewRepository
    ){}

    async findInterviewById(id: string){
        const interview = await this.interviewRepository.findById(id);
        return interview
    }

    async createInterview(userId: string, data: createInterviewData){
        const interview = await this.interviewRepository.createInterview(userId, data);
        return interview
    }

    async updateInterview(id: string, userId: string, data: updateInterviewData){
        const interview = await this.findInterviewById(id)
        if(!interview){
            throw new AppError(
                "Interview Not Found",
                404,
                "INTERVIEW_NOT_FOUND"
            )
        }
        if(interview.createdById !== userId){
            throw new AppError(
                "Unauthorized",
                403,
                "UNAUTHORIZED"
            )
        }

        const updatedInterview = await this.interviewRepository.updateInterview(id,data);
        return updatedInterview
    }

    async findAllInterviewsByUserId(userId: string){
        const interviews = await this.interviewRepository.findByUserId(userId);
        return interviews
    }

    async deleteInterview(id: string, userId: string){
        const interview = await this.findInterviewById(id)

        if(!interview){
            throw new AppError(
                "Interview Not Found",
                404,
                "INTERVIEW_NOT_FOUND"
            )
        }
        if(interview.createdById !== userId){
            throw new AppError(
                "Unauthorized",
                403,
                "UNAUTHORIZED"
            )
        }

        await this.interviewRepository.deleteInterview(id)
    }
}