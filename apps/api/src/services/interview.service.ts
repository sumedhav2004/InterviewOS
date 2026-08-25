import { InterviewStatus } from "@interview-os/database";
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

    async scheduleInterview(userId:string, id:string, scheduledAt: Date){
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

        if(interview.status !== InterviewStatus.DRAFT){
            throw new AppError(
                "Status Not Draft",
                400,
                "STATUS_NOT_DRAFT"
            )
        }

        if (scheduledAt <= new Date()) {
            throw new AppError(
            "Interview must be scheduled for a future date",
            400,
            "INVALID_SCHEDULED_TIME"
            );
        }

        const updatedScheduleInterview = await this.interviewRepository.updateInterviewSchedule(id, InterviewStatus.SCHEDULED, scheduledAt)
        return updatedScheduleInterview
    }

    async startInterview(userId:string, id:string){
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

        if(interview.status !== InterviewStatus.SCHEDULED){
            throw new AppError(
                "Status Not Scheduled",
                400,
                "STATUS_NOT_SCHEDULED"
            )
        }

        const updatedInterview = await this.interviewRepository.updateInterviewStatus(id, InterviewStatus.INPROGRESS)
        return updatedInterview
        
    }

    async completeInterview(userId:string, id:string){
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

        if(interview.status !== InterviewStatus.INPROGRESS){
            throw new AppError(
                "Status Not InProgress",
                400,
                "STATUS_NOT_INPROGRESS"
            )
        }

        const updatedInterview = await this.interviewRepository.updateInterviewStatus(id, InterviewStatus.COMPLETED)
        return updatedInterview
        
    }

    async cancelInterview(userId:string, id:string){
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

        if(interview.status !== (InterviewStatus.DRAFT || InterviewStatus.SCHEDULED)){
            throw new AppError(
                "Status Not InProgress",
                400,
                "STATUS_NOT_INPROGRESS"
            )
        }

        const cancelledInterview = await this.interviewRepository.updateInterviewStatus(id, InterviewStatus.CANCELLED)
        return cancelledInterview
        
    }


}