
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InterviewQuestionController } from "../../../src/controllers/interview-question.controller";

const {
    mockFindById,
    mockFindByInterview,
    mockFindInterviewQuestion,
    mockCreateInterviewQuestion,
    mockSetActiveInterviewQuestion,
    mockClearActiveInterviewQuestion,
    mockUpdateInterviewQuestion,
    mockDeleteInterviewQuestion,
} = vi.hoisted(() => ({
    mockFindById: vi.fn(),
    mockFindByInterview: vi.fn(),
    mockFindInterviewQuestion: vi.fn(),
    mockCreateInterviewQuestion: vi.fn(),
    mockSetActiveInterviewQuestion: vi.fn(),
    mockClearActiveInterviewQuestion: vi.fn(),
    mockUpdateInterviewQuestion: vi.fn(),
    mockDeleteInterviewQuestion: vi.fn(),
}));

vi.mock("../../../src/services/interview-question.service", () => ({
    InterviewQuestionService: class {
        findById = mockFindById;
        findByInterview = mockFindByInterview;
        findInterviewQuestion = mockFindInterviewQuestion;
        createInterviewQuestion = mockCreateInterviewQuestion;
        setActiveInterviewQuestion = mockSetActiveInterviewQuestion;
        clearActiveInterviewQuestion = mockClearActiveInterviewQuestion;
        updateInterviewQuestion = mockUpdateInterviewQuestion;
        deleteInterviewQuestion = mockDeleteInterviewQuestion;
    },
}));

describe("InterviewQuestionController", () => {
    let controller: InterviewQuestionController;
    let req: any;
    let res: any;

    beforeEach(() => {
        vi.clearAllMocks();

        controller = new InterviewQuestionController();

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
        it("should return an interview question with status 200", async () => {
            const interviewQuestion = { id: "iq-1", questionId: "q-1" };
            req.params.interviewQuestionId = "iq-1";
            mockFindById.mockResolvedValue(interviewQuestion);

            await controller.findById(req, res);

            expect(mockFindById).toHaveBeenCalledWith("iq-1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(interviewQuestion);
        });

        it("should propagate service errors", async () => {
            req.params.interviewQuestionId = "iq-1";
            mockFindById.mockRejectedValue(new Error("Lookup failed"));

            await expect(controller.findById(req, res)).rejects.toThrow(
                "Lookup failed",
            );
        });
    });

    describe("findByInterview", () => {
        it("should return interview questions with status 200", async () => {
            const questions = [
                { id: "iq-1", questionId: "q-1" },
                { id: "iq-2", questionId: "q-2" },
            ];
            req.params.interviewId = "interview-1";
            mockFindByInterview.mockResolvedValue(questions);

            await controller.findByInterview(req, res);

            expect(mockFindByInterview).toHaveBeenCalledWith("interview-1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(questions);
        });

        it("should propagate service errors", async () => {
            req.params.interviewId = "interview-1";
            mockFindByInterview.mockRejectedValue(new Error("Lookup failed"));

            await expect(
                controller.findByInterview(req, res),
            ).rejects.toThrow("Lookup failed");
        });
    });

    describe("findInterviewQuestion", () => {
        it("should return the matching interview question with status 200", async () => {
            const interviewQuestion = { id: "iq-1", questionId: "q-1" };
            req.params = {
                interviewId: "interview-1",
                questionId: "q-1",
            };
            mockFindInterviewQuestion.mockResolvedValue(interviewQuestion);

            await controller.findInterviewQuestion(req, res);

            expect(mockFindInterviewQuestion).toHaveBeenCalledWith(
                "interview-1",
                "q-1",
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(interviewQuestion);
        });

        it("should propagate service errors", async () => {
            req.params = {
                interviewId: "interview-1",
                questionId: "q-1",
            };
            mockFindInterviewQuestion.mockRejectedValue(
                new Error("Lookup failed"),
            );

            await expect(
                controller.findInterviewQuestion(req, res),
            ).rejects.toThrow("Lookup failed");
        });
    });

    describe("createInterviewQuestion", () => {
        it("should create an interview question and return 201", async () => {
            const data = { order: 1, duration: 30 };
            const created = { id: "iq-1", ...data };
            req.params = {
                interviewId: "interview-1",
                questionId: "q-1",
            };
            req.body = data;
            mockCreateInterviewQuestion.mockResolvedValue(created);

            await controller.createInterviewQuestion(req, res);

            expect(mockCreateInterviewQuestion).toHaveBeenCalledWith(
                "interview-1",
                "q-1",
                "user-1",
                data,
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(created);
        });

        it("should propagate service errors", async () => {
            req.params = {
                interviewId: "interview-1",
                questionId: "q-1",
            };
            req.body = { order: 1 };
            mockCreateInterviewQuestion.mockRejectedValue(
                new Error("Creation failed"),
            );

            await expect(
                controller.createInterviewQuestion(req, res),
            ).rejects.toThrow("Creation failed");
        });
    });

    describe("setActiveInterviewQuestion", () => {
        it("should set the active question and return status 200", async () => {
            const result = { id: "iq-1", isActive: true };
            req.params = {
                interviewId: "interview-1",
                interviewQuestionId: "iq-1",
            };
            mockSetActiveInterviewQuestion.mockResolvedValue(result);

            await controller.setActiveInterviewQuestion(req, res);

            expect(mockSetActiveInterviewQuestion).toHaveBeenCalledWith(
                "interview-1",
                "iq-1",
                "user-1",
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(result);
        });

        it("should propagate service errors", async () => {
            req.params = {
                interviewId: "interview-1",
                interviewQuestionId: "iq-1",
            };
            mockSetActiveInterviewQuestion.mockRejectedValue(
                new Error("Activation failed"),
            );

            await expect(
                controller.setActiveInterviewQuestion(req, res),
            ).rejects.toThrow("Activation failed");
        });
    });

    describe("clearActiveInterviewQuestion", () => {
        it("should clear the active question and return status 200", async () => {
            const result = { id: "interview-1", activeQuestionId: null };
            req.params.interviewId = "interview-1";
            mockClearActiveInterviewQuestion.mockResolvedValue(result);

            await controller.clearActiveInterviewQuestion(req, res);

            expect(mockClearActiveInterviewQuestion).toHaveBeenCalledWith(
                "interview-1",
                "user-1",
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(result);
        });

        it("should propagate service errors", async () => {
            req.params.interviewId = "interview-1";
            mockClearActiveInterviewQuestion.mockRejectedValue(
                new Error("Clearing failed"),
            );

            await expect(
                controller.clearActiveInterviewQuestion(req, res),
            ).rejects.toThrow("Clearing failed");
        });
    });

    describe("updateInterviewQuestion", () => {
        it("should update an interview question and return status 200", async () => {
            const data = { order: 2 };
            const updated = { id: "iq-1", order: 2 };
            req.params = {
                interviewId: "interview-1",
                questionId: "q-1",
                interviewQuestionId: "iq-1",
            };
            req.body = data;
            mockUpdateInterviewQuestion.mockResolvedValue(updated);

            await controller.updateInterviewQuestion(req, res);

            expect(mockUpdateInterviewQuestion).toHaveBeenCalledWith(
                "iq-1",
                "interview-1",
                "q-1",
                "user-1",
                data,
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(updated);
        });

        it("should propagate service errors", async () => {
            req.params = {
                interviewId: "interview-1",
                questionId: "q-1",
                interviewQuestionId: "iq-1",
            };
            req.body = { order: 2 };
            mockUpdateInterviewQuestion.mockRejectedValue(
                new Error("Update failed"),
            );

            await expect(
                controller.updateInterviewQuestion(req, res),
            ).rejects.toThrow("Update failed");
        });
    });

    describe("deleteInterviewQuestion", () => {
        it("should delete an interview question and return status 204", async () => {
            req.params = {
                interviewId: "interview-1",
                questionId: "q-1",
                interviewQuestionId: "iq-1",
            };
            mockDeleteInterviewQuestion.mockResolvedValue(undefined);

            await controller.deleteInterviewQuestion(req, res);

            expect(mockDeleteInterviewQuestion).toHaveBeenCalledWith(
                "iq-1",
                "user-1",
                "interview-1",
                "q-1",
            );
            expect(res.sendStatus).toHaveBeenCalledWith(204);
        });

        it("should propagate service errors", async () => {
            req.params = {
                interviewId: "interview-1",
                questionId: "q-1",
                interviewQuestionId: "iq-1",
            };
            mockDeleteInterviewQuestion.mockRejectedValue(
                new Error("Deletion failed"),
            );

            await expect(
                controller.deleteInterviewQuestion(req, res),
            ).rejects.toThrow("Deletion failed");
        });
    });
});
