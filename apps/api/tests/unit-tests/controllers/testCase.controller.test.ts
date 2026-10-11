
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestCaseController } from "../../../src/controllers/testCase.controller";

const {
    mockFindById,
    mockFindAllTestCasesForAQuestion,
    mockFindVisibleTestCasesForAQuestion,
    mockCreateTestCase,
    mockUpdateTestCase,
    mockDeleteTestCase,
} = vi.hoisted(() => ({
    mockFindById: vi.fn(),
    mockFindAllTestCasesForAQuestion: vi.fn(),
    mockFindVisibleTestCasesForAQuestion: vi.fn(),
    mockCreateTestCase: vi.fn(),
    mockUpdateTestCase: vi.fn(),
    mockDeleteTestCase: vi.fn(),
}));

vi.mock("../../../src/services/testCase.service", () => ({
    TestCaseService: class {
        findById = mockFindById;
        findAllTestCasesForAQuestion = mockFindAllTestCasesForAQuestion;
        findVisibleTestCasesForAQuestion =
            mockFindVisibleTestCasesForAQuestion;
        createTestCase = mockCreateTestCase;
        updateTestCase = mockUpdateTestCase;
        deleteTestCase = mockDeleteTestCase;
    },
}));

describe("TestCaseController", () => {
    let controller: TestCaseController;
    let req: any;
    let res: any;

    beforeEach(() => {
        vi.clearAllMocks();

        controller = new TestCaseController();

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
        it("should return a test case with status 200", async () => {
            const testCase = { id: "test-case-1", expectedOutput: "4" };

            req.params.testCaseId = "test-case-1";
            req.params.questionId = "question-1";
            mockFindById.mockResolvedValue(testCase);

            await controller.findById(req, res);

            expect(mockFindById).toHaveBeenCalledWith(
                "test-case-1",
                "user-1",
                "question-1",
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(testCase);
        });

        it("should propagate service errors", async () => {
            req.params.testCaseId = "test-case-1";
            req.params.questionId = "question-1";
            mockFindById.mockRejectedValue(new Error("Lookup failed"));

            await expect(
                controller.findById(req, res),
            ).rejects.toThrow("Lookup failed");
        });
    });

    describe("findAllTestCasesForAQuestion", () => {
        it("should return all test cases with status 200", async () => {
            const testCases = [
                { id: "test-case-1" },
                { id: "test-case-2" },
            ];

            req.params.questionId = "question-1";
            mockFindAllTestCasesForAQuestion.mockResolvedValue(testCases);

            await controller.findAllTestCasesForAQuestion(req, res);

            expect(mockFindAllTestCasesForAQuestion).toHaveBeenCalledWith(
                "question-1",
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(testCases);
        });

        it("should propagate service errors", async () => {
            req.params.questionId = "question-1";
            mockFindAllTestCasesForAQuestion.mockRejectedValue(
                new Error("Retrieval failed"),
            );

            await expect(
                controller.findAllTestCasesForAQuestion(req, res),
            ).rejects.toThrow("Retrieval failed");
        });
    });

    describe("findAllVisibleTestCasesForAQuestion", () => {
        it("should return visible test cases with status 200", async () => {
            const testCases = [{ id: "visible-test-case-1" }];

            req.params.questionId = "question-1";
            mockFindVisibleTestCasesForAQuestion.mockResolvedValue(testCases);

            await controller.findAllVisibleTestCasesForAQuestion(req, res);

            expect(
                mockFindVisibleTestCasesForAQuestion,
            ).toHaveBeenCalledWith("question-1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(testCases);
        });

        it("should propagate service errors", async () => {
            req.params.questionId = "question-1";
            mockFindVisibleTestCasesForAQuestion.mockRejectedValue(
                new Error("Visible test case lookup failed"),
            );

            await expect(
                controller.findAllVisibleTestCasesForAQuestion(req, res),
            ).rejects.toThrow("Visible test case lookup failed");
        });
    });

    describe("createTestCase", () => {
        it("should create a test case and return status 201", async () => {
            const data = {
                input: "2 2",
                expectedOutput: "4",
                isVisible: true,
            };
            const createdTestCase = { id: "test-case-1", ...data };

            req.params.questionId = "question-1";
            req.body = data;
            mockCreateTestCase.mockResolvedValue(createdTestCase);

            await controller.createTestCase(req, res);

            expect(mockCreateTestCase).toHaveBeenCalledWith(
                "question-1",
                "user-1",
                data,
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(createdTestCase);
        });

        it("should propagate service errors", async () => {
            req.params.questionId = "question-1";
            req.body = { input: "2 2", expectedOutput: "4" };
            mockCreateTestCase.mockRejectedValue(
                new Error("Creation failed"),
            );

            await expect(
                controller.createTestCase(req, res),
            ).rejects.toThrow("Creation failed");
        });
    });

    describe("updateTestCase", () => {
        it("should update a test case and return status 200", async () => {
            const data = { expectedOutput: "5" };
            const updatedTestCase = { id: "test-case-1", ...data };

            req.params.questionId = "question-1";
            req.params.testCaseId = "test-case-1";
            req.body = data;
            mockUpdateTestCase.mockResolvedValue(updatedTestCase);

            await controller.updateTestCase(req, res);

            expect(mockUpdateTestCase).toHaveBeenCalledWith(
                "test-case-1",
                "question-1",
                "user-1",
                data,
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(updatedTestCase);
        });

        it("should propagate service errors", async () => {
            req.params.questionId = "question-1";
            req.params.testCaseId = "test-case-1";
            req.body = { expectedOutput: "5" };
            mockUpdateTestCase.mockRejectedValue(
                new Error("Update failed"),
            );

            await expect(
                controller.updateTestCase(req, res),
            ).rejects.toThrow("Update failed");
        });
    });

    describe("deleteTestCase", () => {
        it("should delete a test case and return status 204", async () => {
            req.params.questionId = "question-1";
            req.params.testCaseId = "test-case-1";
            mockDeleteTestCase.mockResolvedValue(undefined);

            await controller.deleteTestCase(req, res);

            expect(mockDeleteTestCase).toHaveBeenCalledWith(
                "test-case-1",
                "question-1",
                "user-1",
            );
            expect(res.sendStatus).toHaveBeenCalledWith(204);
        });

        it("should propagate service errors", async () => {
            req.params.questionId = "question-1";
            req.params.testCaseId = "test-case-1";
            mockDeleteTestCase.mockRejectedValue(
                new Error("Deletion failed"),
            );

            await expect(
                controller.deleteTestCase(req, res),
            ).rejects.toThrow("Deletion failed");
        });
    });
});
