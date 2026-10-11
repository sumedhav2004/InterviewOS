
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    questionFindById: vi.fn(),
    userFindById: vi.fn(),
    testCaseFindById: vi.fn(),
    getAllTestCases: vi.fn(),
    getVisibleTestCases: vi.fn(),
    getHiddenTestCases: vi.fn(),
    createTestCase: vi.fn(),
    updateTestCase: vi.fn(),
    deleteTestCase: vi.fn(),
}));

vi.mock("../../../src/repositories/questions.repository", () => ({
    QuestionsRepository: class {
        findById = mocks.questionFindById;
    },
}));

vi.mock("../../../src/repositories/user.repository", () => ({
    UserRepository: class {
        findById = mocks.userFindById;
    },
}));

vi.mock("../../../src/repositories/testCase.repository", () => ({
    TestCaseRepository: class {
        findById = mocks.testCaseFindById;
        getAllTestCasesForAQuestion = mocks.getAllTestCases;
        getVisibleTestCasesForAQuestion = mocks.getVisibleTestCases;
        getHiddenTestCasesForAQuestion = mocks.getHiddenTestCases;
        createTestCase = mocks.createTestCase;
        updateTestCase = mocks.updateTestCase;
        deleteTestCase = mocks.deleteTestCase;
    },
}));

import { TestCaseService } from "../../../src/services/testCase.service";

describe("TestCaseService", () => {
    let service: TestCaseService;

    const questionId = "question-1";
    const testCaseId = "test-case-1";
    const requesterId = "user-1";

    const question = {
        id: questionId,
        createdById: requesterId,
    };

    const testCase = {
        id: testCaseId,
        questionId,
        input: "2 3",
        expectedOutput: "5",
        isHidden: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        service = new TestCaseService();
    });

    describe("findById", () => {
        it("returns a test case when the requester owns its question", async () => {
            mocks.questionFindById.mockResolvedValue(question);
            mocks.testCaseFindById.mockResolvedValue(testCase);

            await expect(
                service.findById(testCaseId, requesterId, questionId),
            ).resolves.toEqual(testCase);

            expect(mocks.questionFindById).toHaveBeenCalledWith(questionId);
            expect(mocks.testCaseFindById).toHaveBeenCalledWith(testCaseId);
        });

        it("throws when the question does not exist", async () => {
            mocks.questionFindById.mockResolvedValue(null);

            await expect(
                service.findById(testCaseId, requesterId, questionId),
            ).rejects.toMatchObject({
                statusCode: 404,
                code: "QUESTION_NOT_FOUND",
            });

            expect(mocks.testCaseFindById).not.toHaveBeenCalled();
        });

        it("rejects a requester who does not own the question", async () => {
            mocks.questionFindById.mockResolvedValue({
                ...question,
                createdById: "other-user",
            });

            await expect(
                service.findById(testCaseId, requesterId, questionId),
            ).rejects.toMatchObject({
                statusCode: 403,
                code: "UNAUTHORIZED",
            });

            expect(mocks.testCaseFindById).not.toHaveBeenCalled();
        });

        it("throws when the test case does not exist", async () => {
            mocks.questionFindById.mockResolvedValue(question);
            mocks.testCaseFindById.mockResolvedValue(null);

            await expect(
                service.findById(testCaseId, requesterId, questionId),
            ).rejects.toMatchObject({
                statusCode: 404,
                code: "TEST_CASE_NOT_FOUND",
            });
        });

        it("rejects a test case belonging to a different question", async () => {
            mocks.questionFindById.mockResolvedValue(question);
            mocks.testCaseFindById.mockResolvedValue({
                ...testCase,
                questionId: "another-question",
            });

            await expect(
                service.findById(testCaseId, requesterId, questionId),
            ).rejects.toMatchObject({
                statusCode: 400,
                code: "INVALID_QUESTION",
            });
        });

        it("propagates repository errors", async () => {
            mocks.questionFindById.mockRejectedValue(new Error("Database error"));

            await expect(
                service.findById(testCaseId, requesterId, questionId),
            ).rejects.toThrow("Database error");
        });
    });

    describe("findAllTestCasesForAQuestion", () => {
        it("returns all test cases for an existing question", async () => {
            const testCases = [testCase, { ...testCase, id: "test-case-2" }];
            mocks.questionFindById.mockResolvedValue(question);
            mocks.getAllTestCases.mockResolvedValue(testCases);

            await expect(
                service.findAllTestCasesForAQuestion(questionId),
            ).resolves.toEqual(testCases);

            expect(mocks.getAllTestCases).toHaveBeenCalledWith(questionId);
        });

        it("throws when the question does not exist", async () => {
            mocks.questionFindById.mockResolvedValue(null);

            await expect(
                service.findAllTestCasesForAQuestion(questionId),
            ).rejects.toMatchObject({ code: "QUESTION_NOT_FOUND" });

            expect(mocks.getAllTestCases).not.toHaveBeenCalled();
        });

        it("propagates repository errors", async () => {
            mocks.questionFindById.mockResolvedValue(question);
            mocks.getAllTestCases.mockRejectedValue(new Error("Database error"));

            await expect(
                service.findAllTestCasesForAQuestion(questionId),
            ).rejects.toThrow("Database error");
        });
    });

    describe("findVisibleTestCasesForAQuestion", () => {
        it("returns visible test cases", async () => {
            const visibleCases = [testCase];
            mocks.questionFindById.mockResolvedValue(question);
            mocks.getVisibleTestCases.mockResolvedValue(visibleCases);

            await expect(
                service.findVisibleTestCasesForAQuestion(questionId),
            ).resolves.toEqual(visibleCases);

            expect(mocks.getVisibleTestCases).toHaveBeenCalledWith(questionId);
        });

        it("throws when the question does not exist", async () => {
            mocks.questionFindById.mockResolvedValue(null);

            await expect(
                service.findVisibleTestCasesForAQuestion(questionId),
            ).rejects.toMatchObject({ code: "QUESTION_NOT_FOUND" });

            expect(mocks.getVisibleTestCases).not.toHaveBeenCalled();
        });

        it("propagates repository errors", async () => {
            mocks.questionFindById.mockResolvedValue(question);
            mocks.getVisibleTestCases.mockRejectedValue(new Error("Query failed"));

            await expect(
                service.findVisibleTestCasesForAQuestion(questionId),
            ).rejects.toThrow("Query failed");
        });
    });

    describe("findHiddenTestCasesForAQuestion", () => {
        it("returns hidden test cases", async () => {
            const hiddenCases = [{ ...testCase, isHidden: true }];
            mocks.questionFindById.mockResolvedValue(question);
            mocks.getHiddenTestCases.mockResolvedValue(hiddenCases);

            await expect(
                service.findHiddenTestCasesForAQuestion(questionId),
            ).resolves.toEqual(hiddenCases);

            expect(mocks.getHiddenTestCases).toHaveBeenCalledWith(questionId);
        });

        it("throws when the question does not exist", async () => {
            mocks.questionFindById.mockResolvedValue(null);

            await expect(
                service.findHiddenTestCasesForAQuestion(questionId),
            ).rejects.toMatchObject({ code: "QUESTION_NOT_FOUND" });

            expect(mocks.getHiddenTestCases).not.toHaveBeenCalled();
        });

        it("propagates repository errors", async () => {
            mocks.questionFindById.mockResolvedValue(question);
            mocks.getHiddenTestCases.mockRejectedValue(new Error("Query failed"));

            await expect(
                service.findHiddenTestCasesForAQuestion(questionId),
            ).rejects.toThrow("Query failed");
        });
    });

    describe("createTestCase", () => {
        const data = {
            input: "2 3",
            expectedOutput: "5",
            isHidden: false,
        };

        it("creates a test case for a question owned by the requester", async () => {
            mocks.questionFindById.mockResolvedValue(question);
            mocks.createTestCase.mockResolvedValue(testCase);

            await expect(
                service.createTestCase(questionId, requesterId, data as any),
            ).resolves.toEqual(testCase);

            expect(mocks.createTestCase).toHaveBeenCalledWith(questionId, data);
        });

        it("throws when the question does not exist", async () => {
            mocks.questionFindById.mockResolvedValue(null);

            await expect(
                service.createTestCase(questionId, requesterId, data as any),
            ).rejects.toMatchObject({ code: "QUESTION_NOT_FOUND" });

            expect(mocks.createTestCase).not.toHaveBeenCalled();
        });

        it("rejects a requester who does not own the question", async () => {
            mocks.questionFindById.mockResolvedValue({
                ...question,
                createdById: "other-user",
            });

            await expect(
                service.createTestCase(questionId, requesterId, data as any),
            ).rejects.toMatchObject({ code: "UNAUTHORIZED" });

            expect(mocks.createTestCase).not.toHaveBeenCalled();
        });

        it("propagates repository errors", async () => {
            mocks.questionFindById.mockResolvedValue(question);
            mocks.createTestCase.mockRejectedValue(new Error("Create failed"));

            await expect(
                service.createTestCase(questionId, requesterId, data as any),
            ).rejects.toThrow("Create failed");
        });
    });

    describe("updateTestCase", () => {
        const data = { expectedOutput: "6" };

        it("updates a test case belonging to the requester's question", async () => {
            mocks.testCaseFindById.mockResolvedValue(testCase);
            mocks.questionFindById.mockResolvedValue(question);
            mocks.updateTestCase.mockResolvedValue({ ...testCase, ...data });

            await expect(
                service.updateTestCase(testCaseId, questionId, requesterId, data as any),
            ).resolves.toEqual({ ...testCase, ...data });

            expect(mocks.updateTestCase).toHaveBeenCalledWith(testCaseId, data);
        });

        it("throws when the test case does not exist", async () => {
            mocks.testCaseFindById.mockResolvedValue(null);

            await expect(
                service.updateTestCase(testCaseId, questionId, requesterId, data as any),
            ).rejects.toMatchObject({ code: "TEST_CASE_NOT_FOUND" });

            expect(mocks.questionFindById).not.toHaveBeenCalled();
            expect(mocks.updateTestCase).not.toHaveBeenCalled();
        });

        it("rejects a test case belonging to another question", async () => {
            mocks.testCaseFindById.mockResolvedValue({
                ...testCase,
                questionId: "another-question",
            });

            await expect(
                service.updateTestCase(testCaseId, questionId, requesterId, data as any),
            ).rejects.toMatchObject({ code: "INVALID_QUESTION" });

            expect(mocks.updateTestCase).not.toHaveBeenCalled();
        });

        it("throws when the question does not exist", async () => {
            mocks.testCaseFindById.mockResolvedValue(testCase);
            mocks.questionFindById.mockResolvedValue(null);

            await expect(
                service.updateTestCase(testCaseId, questionId, requesterId, data as any),
            ).rejects.toMatchObject({ code: "QUESTION_NOT_FOUND" });

            expect(mocks.updateTestCase).not.toHaveBeenCalled();
        });

        it("rejects a requester who does not own the question", async () => {
            mocks.testCaseFindById.mockResolvedValue(testCase);
            mocks.questionFindById.mockResolvedValue({
                ...question,
                createdById: "other-user",
            });

            await expect(
                service.updateTestCase(testCaseId, questionId, requesterId, data as any),
            ).rejects.toMatchObject({ code: "UNAUTHORIZED" });

            expect(mocks.updateTestCase).not.toHaveBeenCalled();
        });

        it("propagates repository errors", async () => {
            mocks.testCaseFindById.mockRejectedValue(new Error("Database error"));

            await expect(
                service.updateTestCase(testCaseId, questionId, requesterId, data as any),
            ).rejects.toThrow("Database error");
        });
    });

    describe("deleteTestCase", () => {
        it("deletes a test case belonging to the requester's question", async () => {
            mocks.testCaseFindById.mockResolvedValue(testCase);
            mocks.questionFindById.mockResolvedValue(question);
            mocks.deleteTestCase.mockResolvedValue({ id: testCaseId });

            await expect(
                service.deleteTestCase(testCaseId, questionId, requesterId),
            ).resolves.toEqual({ id: testCaseId });

            expect(mocks.deleteTestCase).toHaveBeenCalledWith(testCaseId);
        });

        it("throws when the test case does not exist", async () => {
            mocks.testCaseFindById.mockResolvedValue(null);

            await expect(
                service.deleteTestCase(testCaseId, questionId, requesterId),
            ).rejects.toMatchObject({ code: "TEST_CASE_NOT_FOUND" });

            expect(mocks.deleteTestCase).not.toHaveBeenCalled();
        });

        it("rejects a test case belonging to another question", async () => {
            mocks.testCaseFindById.mockResolvedValue({
                ...testCase,
                questionId: "another-question",
            });

            await expect(
                service.deleteTestCase(testCaseId, questionId, requesterId),
            ).rejects.toMatchObject({ code: "INVALID_QUESTION" });

            expect(mocks.questionFindById).not.toHaveBeenCalled();
            expect(mocks.deleteTestCase).not.toHaveBeenCalled();
        });

        it("throws when the question does not exist", async () => {
            mocks.testCaseFindById.mockResolvedValue(testCase);
            mocks.questionFindById.mockResolvedValue(null);

            await expect(
                service.deleteTestCase(testCaseId, questionId, requesterId),
            ).rejects.toMatchObject({ code: "QUESTION_NOT_FOUND" });

            expect(mocks.deleteTestCase).not.toHaveBeenCalled();
        });

        it("rejects a requester who does not own the question", async () => {
            mocks.testCaseFindById.mockResolvedValue(testCase);
            mocks.questionFindById.mockResolvedValue({
                ...question,
                createdById: "other-user",
            });

            await expect(
                service.deleteTestCase(testCaseId, questionId, requesterId),
            ).rejects.toMatchObject({ code: "UNAUTHORIZED" });

            expect(mocks.deleteTestCase).not.toHaveBeenCalled();
        });

        it("propagates repository errors", async () => {
            mocks.testCaseFindById.mockRejectedValue(new Error("Database error"));

            await expect(
                service.deleteTestCase(testCaseId, questionId, requesterId),
            ).rejects.toThrow("Database error");
        });
    });
});
