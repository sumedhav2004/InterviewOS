import { prisma } from "@interview-os/database";
import { CreateSubmissionData } from "../types/submission";

export class SubmissionRepository {
    async createSubmission(
        interviewQuestionId: string,
        participantId: string,
        data: CreateSubmissionData
    ) {
        return prisma.submission.create({
            data: {
                ...data,
                interviewQuestionId,
                participantId,
            },
        });
    }

    async findById(id: string) {
        return prisma.submission.findFirst({
            where: { id },
        });
    }
}