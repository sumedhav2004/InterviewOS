import { AppError } from "../../core/errors/app-error";
import { ResumeRepository } from "../repositories/resume.repository";
import { ResumeData, UpdateResumeData } from "../types/resume";

export class ResumeService{
    constructor(
        private readonly resumeRepository = new ResumeRepository()
    ){}

    async createResume(userId: string, data:ResumeData){
        const createdResume = await this.resumeRepository.createResume(userId, data)
        return createdResume;
    }

    async updateResume(
    id: string,
    userId: string,
    data: UpdateResumeData
) {
    const resume = await this.resumeRepository.findById(id);

    if (!resume) {
        throw new AppError("Resume not found", 404, "RESUME_NOT_FOUND");
    }

    if (resume.userId !== userId) {
        throw new AppError("Unauthorized", 403, "UNAUTHORIZED");
    }

    return this.resumeRepository.updateResume(id, data);
}

    async deleteResume(id: string, userId:string){
        const resume = await this.resumeRepository.findById(id);

        if (!resume) {
            throw new AppError("Resume not found", 404, "RESUME_NOT_FOUND");
        }

        if (resume.userId !== userId) {
            throw new AppError("Unauthorized", 403, "UNAUTHORIZED");
        }
        const deletedResume = await this.resumeRepository.deleteResume(id);
        return deletedResume;
    }

    async findById(id: string){
        const resume = await this.resumeRepository.findById(id);
        return resume;
    }

    async findByUserId(userId: string){
        const resumes = await this.resumeRepository.findByUserId(userId);
        return resumes;
    }
}