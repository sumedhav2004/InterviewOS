import { prisma} from "@interview-os/database";
import { CreateCodeRunData, UpdateCodeRunData } from "../types/codeRun";

export class CodeRunRepository{
    async createCodeRun(interviewQuestionId: string, participantId:string, data: CreateCodeRunData){
        return prisma.codeRun.create({
            data: {
                ...data,
                interviewQuestionId,
                participantId
            }
        })
    }

    async getCodeRunWithResults(id: string) {
        return prisma.codeRun.findUnique({
            where: {
                id,
            },
            include: {
                codeRunTestCaseResults: true,
            },
        });
    }

    async updateCodeRun(id:string, data: UpdateCodeRunData){
        return prisma.codeRun.update({
            where: {
                id
            },
            data: {
                ...data
            }
        })
    }

    async findById(id:string){
        return prisma.codeRun.findFirst({
            where: {
                id
            }
        })
    }
}