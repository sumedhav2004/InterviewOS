import { prisma } from "@interview-os/database";
import {
  CreateInterviewQuestionData,
  UpdateInterviewQuestionData,
} from "../types/interviewQuestion";

export class InterviewQuestionRepository {
  async findById(id: string) {
    return prisma.interviewQuestion.findUnique({
      where: {
        id,
      },
      include: {
        question: {
          include: {
            testCases: {
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        },
      },
    });
  }

  async findInterviewQuestion(interviewId: string, questionId: string) {
    return prisma.interviewQuestion.findUnique({
      where: {
        interviewId_questionId: {
          interviewId,
          questionId,
        },
      },
    });
  }

  async createInterviewQuestion(
    interviewId: string,
    questionId: string,
    data: CreateInterviewQuestionData,
  ) {
    return prisma.interviewQuestion.create({
      data: {
        ...data,
        interviewId,
        questionId,
      },
    });
  }

  async updateInterviewQuestion(id: string, data: UpdateInterviewQuestionData) {
    return prisma.interviewQuestion.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteInterviewQuestion(id: string) {
    return prisma.$transaction(async (tx) => {
      const interviewQuestion = await tx.interviewQuestion.findUnique({
        where: { id },
        select: {
          interviewId: true,
          questionOrder: true,
        },
      });

      if (!interviewQuestion) return;

      const { interviewId, questionOrder } = interviewQuestion;

      await tx.interviewQuestion.delete({
        where: { id },
      });

      // Move later questions temporarily to avoid unique constraint conflicts
      await tx.interviewQuestion.updateMany({
        where: {
          interviewId,
          questionOrder: { gt: questionOrder },
        },
        data: {
          questionOrder: { increment: 1000000 },
        },
      });

      // Move them back, reducing their order by one
      await tx.interviewQuestion.updateMany({
        where: {
          interviewId,
          questionOrder: { gt: 1000000 },
        },
        data: {
          questionOrder: { decrement: 1000001 },
        },
      });
    });
  }

  async findByInterview(interviewId: string) {
    return prisma.interviewQuestion.findMany({
      where: {
        interviewId,
      },
      include: {
        question: true,
      },
      orderBy: {
        questionOrder: "asc",
      },
    });
  }

  async setActiveInterviewQuestion(interviewId: string, interviewQuestionId: string) {
    return prisma.interview.update({
      where: {
        id: interviewId,
      },
      data: {
        activeInterviewQuestionId: interviewQuestionId,
      },
    });
  }

  async clearActiveInterviewQuestion(interviewId: string) {
    return prisma.interview.update({
      where: {
        id: interviewId,
      },
      data: {
        activeInterviewQuestionId: null,
      },
    });
  }
}
