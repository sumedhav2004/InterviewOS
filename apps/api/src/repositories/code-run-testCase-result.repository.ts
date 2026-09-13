import { prisma } from "@interview-os/database";
import { CreateCodeRunTestCaseResultData } from "../types/codeRun";

export class CodeRunTestCaseResultRepository {
    async createResult(data: CreateCodeRunTestCaseResultData) {
        return prisma.codeRunTestCaseResult.create({
            data: {
                ...data
            }
        });
    }

    async getResultsForCodeRun(codeRunId: string) {
        return prisma.codeRunTestCaseResult.findMany({
            where: {
                codeRunId
            }
        });
    }
}