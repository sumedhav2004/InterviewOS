import { prisma } from "@interview-os/database";
import { CreateEvaluationData } from "../types/evaluation";

export class EvaluationRepository {
    async createEvaluation(data: CreateEvaluationData) {
        return prisma.evaluation.create({
            data
        })
    }

    async findBySubmissionId(submissionId: string) {
        return prisma.evaluation.findUnique({
            where: {
                submissionId
            }
        })
    }
}