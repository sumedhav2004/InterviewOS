import { Request, Response } from "express";
import { QuestionService } from "../services/question.service";

export class QuestionController {
  constructor(private readonly questionService = new QuestionService()) {}

  async findById(req: Request, res: Response) {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({
        message: "Invalid route parameter",
      });
    }

    const question = await this.questionService.findById(id);
    return res.status(200).json(question);
  }

  async findMyQuestions(req: Request, res: Response) {
    const userId = req.user.id;

    const questions = await this.questionService.findMyQuestions(userId);
    return res.status(200).json(questions);
  }

  async createQuestion(req: Request, res: Response) {
    const userId = req.user.id;
    const data = req.body;

    const question = await this.questionService.createQuestion(userId, data);
    return res.status(200).json(question);
  }

  async deleteQuestion(req: Request, res: Response) {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({
        message: "Invalid route parameter",
      });
    }
    const userId = req.user.id;

    await this.questionService.deleteQuestion(id, userId);
    return res.sendStatus(204);
  }

  async findAll(req: Request, res: Response) {
    const parsePositiveInt = (value: unknown, fallback: number): number => {
      if (typeof value !== "string" || !/^\d+$/.test(value)) {
        return fallback;
      }

      const parsed = Number(value);

      return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
    };

    const page = parsePositiveInt(req.query.page, 1);
    const limit = Math.min(parsePositiveInt(req.query.limit, 10), 100);

    const search =
      typeof req.query.search === "string" ? req.query.search.trim() || undefined : undefined;

    const tag = typeof req.query.tag === "string" ? req.query.tag.trim() || undefined : undefined;

    const rawDifficulty = req.query.difficulty;

    if (
      rawDifficulty !== undefined &&
      (typeof rawDifficulty !== "string" || !["EASY", "MEDIUM", "HARD"].includes(rawDifficulty))
    ) {
      return res.status(400).json({
        message: "Invalid difficulty. Use EASY, MEDIUM, or HARD.",
      });
    }

    const questions = await this.questionService.findAll({
      page,
      limit,
      search,
      difficulty: rawDifficulty as "EASY" | "MEDIUM" | "HARD" | undefined,
      tag,
    });

    return res.status(200).json(questions);
  }

  async updateQuestion(req: Request, res: Response) {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({
        message: "Invalid route parameter",
      });
    }
    const userId = req.user.id;
    const data = req.body;

    const question = await this.questionService.updateQuestion(id, userId, data);
    return res.status(200).json(question);
  }
}
