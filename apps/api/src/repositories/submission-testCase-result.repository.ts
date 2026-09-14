import { prisma } from "@interview-os/database";
import { CreateSubmissionTestCaseResultData } from "../types/submission";

export class SubmissionTestCaseResultRepository{
    async createSubmissionResult(data:CreateSubmissionTestCaseResultData){
        return prisma.submissionTestCaseResult.upsert({
            where: {
                submissionId_testCaseId: {
                    submissionId: data.submissionId,
                    testCaseId: data.testCaseId
                }
            },
            create: data,
            update: data
        });
    }

    async getResultsForSubmission(id:string){
        return prisma.submissionTestCaseResult.findMany({
            where:{
                submissionId: id
            }
        })
    }
}