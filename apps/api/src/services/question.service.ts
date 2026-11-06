import { QuestionsRepository } from "../repositories/questions.repository";
import { createQuestionData, updateQuestionData } from "../types/question";
import { AppError } from "../../core/errors/app-error";
import { UserRepository } from "../repositories/user.repository";

type FindQuestionsOptions = {
  page: number;
  limit: number;
  search?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  tag?: string;
};

export class QuestionService {
  constructor(
    private readonly questionsRepository = new QuestionsRepository(),
    private readonly userRepository = new UserRepository(),
  ) {}

  async findAll(options: FindQuestionsOptions) {
    return this.questionsRepository.findAll(options);
  }

  async findById(id: string) {
    const question = await this.questionsRepository.findById(id);

    if (!question) {
      throw new AppError("Question Not Found", 404, "QUESTION_NOT_FOUND");
    }

    return question;
  }

  async findMyQuestions(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError("User Not Found", 404, "USER_NOT_FOUND");
    }

    return this.questionsRepository.findMyQuestions(userId);
  }

  async createQuestion(userId: string, data: createQuestionData) {
    return this.questionsRepository.createQuestion(userId, data);
  }

  async deleteQuestion(id: string, userId: string) {
    const question = await this.questionsRepository.findById(id);

    if (!question) {
      throw new AppError("Question Not Found", 404, "QUESTION_NOT_FOUND");
    }

    if (question.createdById !== userId) {
      throw new AppError("Unauthorized", 403, "UNAUTHORIZED");
    }

    return this.questionsRepository.deleteQuestion(id);
  }

  async updateQuestion(id: string, userId: string, data: updateQuestionData) {
    const question = await this.questionsRepository.findById(id);

    if (!question) {
      throw new AppError("Question Not Found", 404, "QUESTION_NOT_FOUND");
    }

    if (question.createdById !== userId) {
      throw new AppError("Unauthorized", 403, "UNAUTHORIZED");
    }

    return this.questionsRepository.updateQuestion(id, data);
  }
}
