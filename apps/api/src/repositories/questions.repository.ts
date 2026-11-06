import { prisma } from "@interview-os/database";
import { createQuestionData, updateQuestionData } from "../types/question";

type FindQuestionsOptions = {
  page: number;
  limit: number;
  search?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  tag?: string;
};

export class QuestionsRepository {
  async findById(id: string) {
    return prisma.question.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  // Shared question bank: questions from every creator.
  async findAll(options: FindQuestionsOptions) {
    const { page, limit, search, difficulty, tag } = options;

    const where = {
      ...(search
        ? {
            title: {
              contains: search,
              mode: "insensitive" as const,
            },
          }
        : {}),
      ...(difficulty ? { difficulty } : {}),
      ...(tag
        ? {
            tags: {
              some: {
                tag: {
                  slug: tag,
                },
              },
            },
          }
        : {}),
    };

    const [questions, total] = await prisma.$transaction([
      prisma.question.findMany({
        where,
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.question.count({ where }),
    ]);

    return {
      data: questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findMyQuestions(userId: string) {
    return prisma.question.findMany({
      where: { createdById: userId },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async createQuestion(userId: string, data: createQuestionData) {
    const { tags, ...questionData } = data;

    return prisma.question.create({
      data: {
        ...questionData,
        createdById: userId,
        ...(tags?.length
          ? {
              tags: {
                create: tags.map((tagSlug) => ({
                  tag: {
                    connect: { slug: tagSlug },
                  },
                })),
              },
            }
          : {}),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async deleteQuestion(id: string) {
    return prisma.question.delete({
      where: { id },
    });
  }

  async updateQuestion(id: string, data: updateQuestionData) {
    const { tags, ...questionData } = data;

    return prisma.question.update({
      where: { id },
      data: {
        ...questionData,
        ...(tags !== undefined
          ? {
              tags: {
                deleteMany: {},
                ...(tags.length
                  ? {
                      create: tags.map((tagSlug) => ({
                        tag: {
                          connect: { slug: tagSlug },
                        },
                      })),
                    }
                  : {}),
              },
            }
          : {}),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }
}
