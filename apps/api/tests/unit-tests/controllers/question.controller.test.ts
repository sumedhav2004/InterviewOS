
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QuestionController } from "../../../src/controllers/question.controller";

const {
    mockFindById,
    mockFindMyQuestions,
    mockCreateQuestion,
    mockDeleteQuestion,
    mockUpdateQuestion,
} = vi.hoisted(() => ({
    mockFindById: vi.fn(),
    mockFindMyQuestions: vi.fn(),
    mockCreateQuestion: vi.fn(),
    mockDeleteQuestion: vi.fn(),
    mockUpdateQuestion: vi.fn(),
}));

vi.mock("../../../src/services/question.service", () => ({
    QuestionService: class {
        findById = mockFindById;
        findMyQuestions = mockFindMyQuestions;
        createQuestion = mockCreateQuestion;
        deleteQuestion = mockDeleteQuestion;
        updateQuestion = mockUpdateQuestion;
    },
}));

describe("QuestionController", () => {
    let controller: QuestionController;
    let req: any;
    let res: any;

    beforeEach(() => {
        vi.clearAllMocks();

        controller = new QuestionController();

        req = {
            params: {},
            body: {},
            user: { id: "user-1" },
        };

        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
            sendStatus: vi.fn().mockReturnThis(),
        };
    });

    describe("findById", () => {
        it("should return a question with status 200", async () => {
            const question = {
                id: "question-1",
                title: "JavaScript basics",
            };
            req.params.id = "question-1";
            mockFindById.mockResolvedValue(question);

            await controller.findById(req, res);

            expect(mockFindById).toHaveBeenCalledWith("question-1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(question);
        });

        it("should return 400 when id is not a string", async () => {
            req.params.id = ["question-1"];

            await controller.findById(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Invalid route parameter",
            });
            expect(mockFindById).not.toHaveBeenCalled();
        });

        it("should propagate service errors", async () => {
            req.params.id = "question-1";
            mockFindById.mockRejectedValue(new Error("Question lookup failed"));

            await expect(
                controller.findById(req, res),
            ).rejects.toThrow("Question lookup failed");
        });
    });

    describe("findMyQuestions", () => {
        it("should return the user's questions with status 200", async () => {
            const questions = [
                { id: "question-1" },
                { id: "question-2" },
            ];
            mockFindMyQuestions.mockResolvedValue(questions);

            await controller.findMyQuestions(req, res);

            expect(mockFindMyQuestions).toHaveBeenCalledWith("user-1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(questions);
        });

        it("should propagate service errors", async () => {
            mockFindMyQuestions.mockRejectedValue(
                new Error("Question retrieval failed"),
            );

            await expect(
                controller.findMyQuestions(req, res),
            ).rejects.toThrow("Question retrieval failed");
        });
    });

    describe("createQuestion", () => {
        it("should create a question and return status 200", async () => {
            const data = {
                title: "JavaScript basics",
                content: "Explain closures",
            };
            const question = { id: "question-1", ...data };

            req.body = data;
            mockCreateQuestion.mockResolvedValue(question);

            await controller.createQuestion(req, res);

            expect(mockCreateQuestion).toHaveBeenCalledWith("user-1", data);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(question);
        });

        it("should propagate service errors", async () => {
            req.body = { title: "JavaScript basics" };
            mockCreateQuestion.mockRejectedValue(
                new Error("Question creation failed"),
            );

            await expect(
                controller.createQuestion(req, res),
            ).rejects.toThrow("Question creation failed");
        });
    });

    describe("deleteQuestion", () => {
        it("should delete a question and return 204", async () => {
            req.params.id = "question-1";
            mockDeleteQuestion.mockResolvedValue(undefined);

            await controller.deleteQuestion(req, res);

            expect(mockDeleteQuestion).toHaveBeenCalledWith(
                "question-1",
                "user-1",
            );
            expect(res.sendStatus).toHaveBeenCalledWith(204);
        });

        it("should return 400 when id is not a string", async () => {
            req.params.id = ["question-1"];

            await controller.deleteQuestion(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Invalid route parameter",
            });
            expect(mockDeleteQuestion).not.toHaveBeenCalled();
        });

        it("should propagate service errors", async () => {
            req.params.id = "question-1";
            mockDeleteQuestion.mockRejectedValue(
                new Error("Question deletion failed"),
            );

            await expect(
                controller.deleteQuestion(req, res),
            ).rejects.toThrow("Question deletion failed");
        });
    });

    describe("updateQuestion", () => {
        it("should update a question and return status 200", async () => {
            const data = { title: "Updated question" };
            const question = { id: "question-1", ...data };

            req.params.id = "question-1";
            req.body = data;
            mockUpdateQuestion.mockResolvedValue(question);

            await controller.updateQuestion(req, res);

            expect(mockUpdateQuestion).toHaveBeenCalledWith(
                "question-1",
                "user-1",
                data,
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(question);
        });

        it("should return 400 when id is not a string", async () => {
            req.params.id = ["question-1"];

            await controller.updateQuestion(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Invalid route parameter",
            });
            expect(mockUpdateQuestion).not.toHaveBeenCalled();
        });

        it("should propagate service errors", async () => {
            req.params.id = "question-1";
            req.body = { title: "Updated question" };
            mockUpdateQuestion.mockRejectedValue(
                new Error("Question update failed"),
            );

            await expect(
                controller.updateQuestion(req, res),
            ).rejects.toThrow("Question update failed");
        });
    });
});
