
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestCaseService } from "../../../src/services/testCase.service";

describe("TestCaseService", () => {
    let service: TestCaseService;

    let questionRepository: {
        findById: ReturnType<typeof vi.fn>;
    };

    let userRepository: Record<string, ReturnType<typeof vi.fn>>;

    let testCaseRepository: {
        findById: ReturnType<typeof vi.fn>;
        getAllTestCasesForAQuestion: ReturnType<typeof vi.fn>;
        getVisibleTestCasesForAQuestion: ReturnType<typeof vi.fn>;
        getHiddenTestCasesForAQuestion: ReturnType<typeof vi.fn>;
        createTestCase: ReturnType<typeof vi.fn>;
        updateTestCase: ReturnType<typeof vi.fn>;
        deleteTestCase: ReturnType<typeof vi.fn>;
    };

    const question = {
        id: "question-1",
        createdById: "owner-1",
    };

    const testCase = {
        id: "test-case-1",
        questionId: "question-1",
        input: "1 2",
        expectedOutput: "3",
        isHidden: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();

        questionRepository = {
            findById: vi.fn(),
        };

        userRepository = {};

        testCaseRepository = {
            findById: vi.fn(),
            getAllTestCasesForAQuestion: vi.fn(),
            getVisibleTestCasesForAQuestion: vi.fn(),
            getHiddenTestCasesForAQuestion: vi.fn(),
            createTestCase: vi.fn(),
            updateTestCase: vi.fn(),
            deleteTestCase: vi.fn(),
        };

        service = new TestCaseService(
            questionRepository as never,
            userRepository as never,
            testCaseRepository as never,
        );
    });

    describe("findById", () => {
        it("returns the test case for its question owner", async () => {
            questionRepository.findById.mockResolvedValue(question);
            testCaseRepository.findById.mockResolvedValue(testCase);

            await expect(
                service.findById("test-case-1", "owner-1", "question-1"),
            ).resolves.toEqual(testCase);

            expect(questionRepository.findById).toHaveBeenCalledWith("question-1");
            expect(testCaseRepository.findById).toHaveBeenCalledWith("test-case-1");
        });

        it("throws when the question does not exist", async () => {
            questionRepository.findById.mockResolvedValue(null);

            await expect(
                service.findById("test-case-1", "owner-1", "question-1"),
            ).rejects.toThrow("Question Not Found");

            expect(testCaseRepository.findById).not.toHaveBeenCalled();
        });

        it("rejects a requester who does not own the question", async () => {
            questionRepository.findById.mockResolvedValue(question);

            await expect(
                service.findById("test-case-1", "another-user", "question-1"),
            ).rejects.toThrow("Unauthorized");

            expect(testCaseRepository.findById).not.toHaveBeenCalled();
        });

        it("throws when the test case does not exist", async () => {
            questionRepository.findById.mockResolvedValue(question);
            testCaseRepository.findById.mockResolvedValue(null);

            await expect(
                service.findById("missing-case", "owner-1", "question-1"),
            ).rejects.toThrow("Test Case Not Found");
        });

        it("rejects a test case belonging to a different question", async () => {
            questionRepository.findById.mockResolvedValue(question);
            testCaseRepository.findById.mockResolvedValue({
                ...testCase,
                questionId: "question-2",
            });

            await expect(
                service.findById("test-case-1", "owner-1", "question-1"),
            ).rejects.toThrow("Invalid Question");
        });
    });

    describe("findAllTestCasesForAQuestion", () => {
        it("returns all test cases when the question exists", async () => {
            const cases = [testCase];

            questionRepository.findById.mockResolvedValue(question);
            testCaseRepository.getAllTestCasesForAQuestion.mockResolvedValue(cases);

            await expect(
                service.findAllTestCasesForAQuestion("question-1"),
            ).resolves.toEqual(cases);

            expect(
                testCaseRepository.getAllTestCasesForAQuestion,
            ).toHaveBeenCalledWith("question-1");
        });

        it("throws when the question does not exist", async () => {
            questionRepository.findById.mockResolvedValue(null);

            await expect(
                service.findAllTestCasesForAQuestion("missing-question"),
            ).rejects.toThrow("Question Not Found");

            expect(
                testCaseRepository.getAllTestCasesForAQuestion,
            ).not.toHaveBeenCalled();
        });
    });

    describe("findVisibleTestCasesForAQuestion", () => {
        it("returns visible test cases when the question exists", async () => {
            const cases = [testCase];

            questionRepository.findById.mockResolvedValue(question);
            testCaseRepository.getVisibleTestCasesForAQuestion.mockResolvedValue(cases);

            await expect(
                service.findVisibleTestCasesForAQuestion("question-1"),
            ).resolves.toEqual(cases);

            expect(
                testCaseRepository.getVisibleTestCasesForAQuestion,
            ).toHaveBeenCalledWith("question-1");
        });

        it("throws when the question does not exist", async () => {
            questionRepository.findById.mockResolvedValue(null);

            await expect(
                service.findVisibleTestCasesForAQuestion("missing-question"),
            ).rejects.toThrow("Question Not Found");

            expect(
                testCaseRepository.getVisibleTestCasesForAQuestion,
            ).not.toHaveBeenCalled();
        });
    });

    describe("findHiddenTestCasesForAQuestion", () => {
        it("returns hidden test cases when the question exists", async () => {
            const cases = [{ ...testCase, isHidden: true }];

            questionRepository.findById.mockResolvedValue(question);
            testCaseRepository.getHiddenTestCasesForAQuestion.mockResolvedValue(cases);

            await expect(
                service.findHiddenTestCasesForAQuestion("question-1"),
            ).resolves.toEqual(cases);

            expect(
                testCaseRepository.getHiddenTestCasesForAQuestion,
            ).toHaveBeenCalledWith("question-1");
        });

        it("throws when the question does not exist", async () => {
            questionRepository.findById.mockResolvedValue(null);

            await expect(
                service.findHiddenTestCasesForAQuestion("missing-question"),
            ).rejects.toThrow("Question Not Found");

            expect(
                testCaseRepository.getHiddenTestCasesForAQuestion,
            ).not.toHaveBeenCalled();
        });
    });

    describe("createTestCase", () => {
        const data = {
            input: "1 2",
            expectedOutput: "3",
            isHidden: false,
        };

        it("creates a test case for the question owner", async () => {
            questionRepository.findById.mockResolvedValue(question);
            testCaseRepository.createTestCase.mockResolvedValue(testCase);

            await expect(
                service.createTestCase("question-1", "owner-1", data as never),
            ).resolves.toEqual(testCase);

            expect(testCaseRepository.createTestCase).toHaveBeenCalledWith(
                "question-1",
                data,
            );
        });

        it("throws when the question does not exist", async () => {
            questionRepository.findById.mockResolvedValue(null);

            await expect(
                service.createTestCase("question-1", "owner-1", data as never),
            ).rejects.toThrow("Question Not Found");

            expect(testCaseRepository.createTestCase).not.toHaveBeenCalled();
        });

        it("rejects a non-owner", async () => {
            questionRepository.findById.mockResolvedValue(question);

            await expect(
                service.createTestCase("question-1", "another-user", data as never),
            ).rejects.toThrow("Unauthorized");

            expect(testCaseRepository.createTestCase).not.toHaveBeenCalled();
        });
    });

    describe("updateTestCase", () => {
        const data = { expectedOutput: "updated" };

        it("updates a test case owned by the requester", async () => {
            testCaseRepository.findById.mockResolvedValue(testCase);
            questionRepository.findById.mockResolvedValue(question);
            testCaseRepository.updateTestCase.mockResolvedValue({
                ...testCase,
                ...data,
            });

            await expect(
                service.updateTestCase(
                    "test-case-1",
                    "question-1",
                    "owner-1",
                    data as never,
                ),
            ).resolves.toEqual({ ...testCase, ...data });

            expect(testCaseRepository.updateTestCase).toHaveBeenCalledWith(
                "test-case-1",
                data,
            );
        });

        it("throws when the test case does not exist", async () => {
            testCaseRepository.findById.mockResolvedValue(null);

            await expect(
                service.updateTestCase(
                    "missing-case",
                    "question-1",
                    "owner-1",
                    data as never,
                ),
            ).rejects.toThrow("Test Case Not Found");

            expect(questionRepository.findById).not.toHaveBeenCalled();
        });

        it("rejects a test case associated with another question", async () => {
            testCaseRepository.findById.mockResolvedValue({
                ...testCase,
                questionId: "question-2",
            });

            await expect(
                service.updateTestCase(
                    "test-case-1",
                    "question-1",
                    "owner-1",
                    data as never,
                ),
            ).rejects.toThrow("Invalid Question");

            expect(questionRepository.findById).not.toHaveBeenCalled();
            expect(testCaseRepository.updateTestCase).not.toHaveBeenCalled();
        });

        it("throws when the associated question does not exist", async () => {
            testCaseRepository.findById.mockResolvedValue(testCase);
            questionRepository.findById.mockResolvedValue(null);

            await expect(
                service.updateTestCase(
                    "test-case-1",
                    "question-1",
                    "owner-1",
                    data as never,
                ),
            ).rejects.toThrow("Question Not Found");

            expect(testCaseRepository.updateTestCase).not.toHaveBeenCalled();
        });

        it("rejects a non-owner", async () => {
            testCaseRepository.findById.mockResolvedValue(testCase);
            questionRepository.findById.mockResolvedValue(question);

            await expect(
                service.updateTestCase(
                    "test-case-1",
                    "question-1",
                    "another-user",
                    data as never,
                ),
            ).rejects.toThrow("Unauthorized");

            expect(testCaseRepository.updateTestCase).not.toHaveBeenCalled();
        });
    });

    describe("deleteTestCase", () => {
        it("deletes a test case owned by the requester", async () => {
            testCaseRepository.findById.mockResolvedValue(testCase);
            questionRepository.findById.mockResolvedValue(question);
            testCaseRepository.deleteTestCase.mockResolvedValue(testCase);

            await expect(
                service.deleteTestCase("test-case-1", "question-1", "owner-1"),
            ).resolves.toEqual(testCase);

            expect(testCaseRepository.deleteTestCase).toHaveBeenCalledWith(
                "test-case-1",
            );
        });

        it("throws when the test case does not exist", async () => {
            testCaseRepository.findById.mockResolvedValue(null);

            await expect(
                service.deleteTestCase("missing-case", "question-1", "owner-1"),
            ).rejects.toThrow("Test Case Not Found");

            expect(questionRepository.findById).not.toHaveBeenCalled();
        });

        it("rejects a test case associated with another question", async () => {
            testCaseRepository.findById.mockResolvedValue({
                ...testCase,
                questionId: "question-2",
            });

            await expect(
                service.deleteTestCase("test-case-1", "question-1", "owner-1"),
            ).rejects.toThrow("Invalid Question");

            expect(testCaseRepository.deleteTestCase).not.toHaveBeenCalled();
        });

        it("throws when the associated question does not exist", async () => {
            testCaseRepository.findById.mockResolvedValue(testCase);
            questionRepository.findById.mockResolvedValue(null);

            await expect(
                service.deleteTestCase("test-case-1", "question-1", "owner-1"),
            ).rejects.toThrow("Question Not Found");

            expect(testCaseRepository.deleteTestCase).not.toHaveBeenCalled();
        });

        it("rejects a non-owner", async () => {
            testCaseRepository.findById.mockResolvedValue(testCase);
            questionRepository.findById.mockResolvedValue(question);

            await expect(
                service.deleteTestCase(
                    "test-case-1",
                    "question-1",
                    "another-user",
                ),
            ).rejects.toThrow("Unauthorized");

            expect(testCaseRepository.deleteTestCase).not.toHaveBeenCalled();
        });
    });
});
