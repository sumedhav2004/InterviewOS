import { beforeEach, describe, expect, it, vi } from "vitest";
import { QuestionService } from "../../../src/services/question.service";

const mocks = vi.hoisted(() => ({
  findByIdMock: vi.fn(),
  findMyQuestionsMock: vi.fn(),
  createQuestionMock: vi.fn(),
  deleteQuestionMock: vi.fn(),
  updateQuestionMock: vi.fn(),
  findUserByIdMock: vi.fn(),
  findAllMock: vi.fn(),
}));

vi.mock("../../../src/repositories/questions.repository", () => ({
  QuestionsRepository: class {
    findById = mocks.findByIdMock;
    findMyQuestions = mocks.findMyQuestionsMock;
    createQuestion = mocks.createQuestionMock;
    deleteQuestion = mocks.deleteQuestionMock;
    updateQuestion = mocks.updateQuestionMock;
    findAll = mocks.findAllMock;
  },
}));

vi.mock("../../../src/repositories/user.repository", () => ({
  UserRepository: class {
    findById = mocks.findUserByIdMock;
  },
}));

describe("QuestionService", () => {
  let service: QuestionService;

  const questionId = "question-1";
  const userId = "user-1";
  const question = {
    id: questionId,
    createdById: userId,
    title: "JavaScript fundamentals",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new QuestionService();
  });

  describe("findById", () => {
    it("returns the question when found", async () => {
      mocks.findByIdMock.mockResolvedValue(question);

      await expect(service.findById(questionId)).resolves.toEqual(question);
      expect(mocks.findByIdMock).toHaveBeenCalledWith(questionId);
    });

    it("throws QUESTION_NOT_FOUND when the question does not exist", async () => {
      mocks.findByIdMock.mockResolvedValue(null);

      await expect(service.findById(questionId)).rejects.toMatchObject({
        message: "Question Not Found",
        statusCode: 404,
        code: "QUESTION_NOT_FOUND",
      });
    });

    it("propagates repository errors", async () => {
      mocks.findByIdMock.mockRejectedValue(new Error("Database error"));

      await expect(service.findById(questionId)).rejects.toThrow("Database error");
    });
  });

  describe("findMyQuestions", () => {
    it("returns questions when the user exists", async () => {
      const questions = [question, { id: "question-2", createdById: userId }];
      mocks.findUserByIdMock.mockResolvedValue({ id: userId });
      mocks.findMyQuestionsMock.mockResolvedValue(questions);

      await expect(service.findMyQuestions(userId)).resolves.toEqual(questions);
      expect(mocks.findUserByIdMock).toHaveBeenCalledWith(userId);
      expect(mocks.findMyQuestionsMock).toHaveBeenCalledWith(userId);
    });

    it("throws USER_NOT_FOUND when the user does not exist", async () => {
      mocks.findUserByIdMock.mockResolvedValue(null);

      await expect(service.findMyQuestions(userId)).rejects.toMatchObject({
        message: "User Not Found",
        statusCode: 404,
        code: "USER_NOT_FOUND",
      });

      expect(mocks.findMyQuestionsMock).not.toHaveBeenCalled();
    });

    it("propagates user repository errors", async () => {
      mocks.findUserByIdMock.mockRejectedValue(new Error("Database error"));

      await expect(service.findMyQuestions(userId)).rejects.toThrow("Database error");
      expect(mocks.findMyQuestionsMock).not.toHaveBeenCalled();
    });

    it("propagates question repository errors", async () => {
      mocks.findUserByIdMock.mockResolvedValue({ id: userId });
      mocks.findMyQuestionsMock.mockRejectedValue(new Error("Query failed"));

      await expect(service.findMyQuestions(userId)).rejects.toThrow("Query failed");
    });
  });

  describe("createQuestion", () => {
    const data = {
      title: "JavaScript fundamentals",
      description: "Explain closures",
    };

    it("creates a question and returns the result", async () => {
      mocks.createQuestionMock.mockResolvedValue(question);

      await expect(service.createQuestion(userId, data as any)).resolves.toEqual(question);
      expect(mocks.createQuestionMock).toHaveBeenCalledWith(userId, data);
    });

    it("propagates repository errors", async () => {
      mocks.createQuestionMock.mockRejectedValue(new Error("Create failed"));

      await expect(service.createQuestion(userId, data as any)).rejects.toThrow("Create failed");
    });
  });

  describe("deleteQuestion", () => {
    it("deletes a question owned by the requester", async () => {
      mocks.findByIdMock.mockResolvedValue(question);
      mocks.deleteQuestionMock.mockResolvedValue({ id: questionId });

      await expect(service.deleteQuestion(questionId, userId)).resolves.toEqual({ id: questionId });

      expect(mocks.findByIdMock).toHaveBeenCalledWith(questionId);
      expect(mocks.deleteQuestionMock).toHaveBeenCalledWith(questionId);
    });

    it("throws QUESTION_NOT_FOUND when the question does not exist", async () => {
      mocks.findByIdMock.mockResolvedValue(null);

      await expect(service.deleteQuestion(questionId, userId)).rejects.toMatchObject({
        message: "Question Not Found",
        statusCode: 404,
        code: "QUESTION_NOT_FOUND",
      });

      expect(mocks.deleteQuestionMock).not.toHaveBeenCalled();
    });

    it("throws UNAUTHORIZED when the requester is not the owner", async () => {
      mocks.findByIdMock.mockResolvedValue({
        ...question,
        createdById: "other-user",
      });

      await expect(service.deleteQuestion(questionId, userId)).rejects.toMatchObject({
        message: "Unauthorized",
        statusCode: 403,
        code: "UNAUTHORIZED",
      });

      expect(mocks.deleteQuestionMock).not.toHaveBeenCalled();
    });

    it("propagates repository errors", async () => {
      mocks.findByIdMock.mockRejectedValue(new Error("Database error"));

      await expect(service.deleteQuestion(questionId, userId)).rejects.toThrow("Database error");
      expect(mocks.deleteQuestionMock).not.toHaveBeenCalled();
    });
  });

  describe("updateQuestion", () => {
    const data = { title: "Updated question" };

    it("updates a question owned by the requester", async () => {
      const updatedQuestion = { ...question, ...data };
      mocks.findByIdMock.mockResolvedValue(question);
      mocks.updateQuestionMock.mockResolvedValue(updatedQuestion);

      await expect(service.updateQuestion(questionId, userId, data as any)).resolves.toEqual(
        updatedQuestion,
      );

      expect(mocks.updateQuestionMock).toHaveBeenCalledWith(questionId, data);
    });

    it("throws QUESTION_NOT_FOUND when the question does not exist", async () => {
      mocks.findByIdMock.mockResolvedValue(null);

      await expect(service.updateQuestion(questionId, userId, data as any)).rejects.toMatchObject({
        message: "Question Not Found",
        statusCode: 404,
        code: "QUESTION_NOT_FOUND",
      });

      expect(mocks.updateQuestionMock).not.toHaveBeenCalled();
    });

    it("throws UNAUTHORIZED when the requester is not the owner", async () => {
      mocks.findByIdMock.mockResolvedValue({
        ...question,
        createdById: "other-user",
      });

      await expect(service.updateQuestion(questionId, userId, data as any)).rejects.toMatchObject({
        message: "Unauthorized",
        statusCode: 403,
        code: "UNAUTHORIZED",
      });

      expect(mocks.updateQuestionMock).not.toHaveBeenCalled();
    });

    it("propagates repository errors", async () => {
      mocks.findByIdMock.mockRejectedValue(new Error("Database error"));

      await expect(service.updateQuestion(questionId, userId, data as any)).rejects.toThrow(
        "Database error",
      );
      expect(mocks.updateQuestionMock).not.toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("returns questions with the provided filters and pagination", async () => {
      const options = {
        page: 2,
        limit: 20,
        search: "javascript",
        difficulty: "MEDIUM" as const,
        tag: "backend",
      };

      const questions = [
        { id: "question-1", title: "JavaScript fundamentals" },
        { id: "question-2", title: "JavaScript closures" },
      ];

      mocks.findAllMock.mockResolvedValue(questions);

      await expect(service.findAll(options)).resolves.toEqual(questions);

      expect(mocks.findAllMock).toHaveBeenCalledWith(options);
      expect(mocks.findAllMock).toHaveBeenCalledTimes(1);
    });

    it("returns an empty array when no questions are found", async () => {
      mocks.findAllMock.mockResolvedValue([]);

      await expect(service.findAll({ page: 1, limit: 10 })).resolves.toEqual([]);

      expect(mocks.findAllMock).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });

    it("propagates repository errors", async () => {
      mocks.findAllMock.mockRejectedValue(new Error("Query failed"));

      await expect(service.findAll({ page: 1, limit: 10 })).rejects.toThrow("Query failed");
    });
  });
});
