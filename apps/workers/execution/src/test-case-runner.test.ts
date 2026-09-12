import { describe, expect, it } from "vitest";
import { runTestCase, runTestCases } from "./test-case-runner";

describe("test-case-runner", () => {
    it("should pass when output matches expected output", async () => {
        const result = await runTestCase(
            {
                id: "job-1",
                participantId: "participant-1",
                interviewQuestionId: "question-1",
                testCaseId: "test-case-1",
                language: "PYTHON",
                sourceCode: `
x = int(input())
print(x * x)
`,
                status: "QUEUED",
            },
            {
                id: "test-1",
                input: "5\n",
                expectedOutput: "25\n",
                isHidden: false,
            }
        );

        expect(result.passed).toBe(true);
        expect(result.actualOutput).toBe("25\n");
        expect(result.exitCode).toBe(0);
    });

    it("should fail when output does not match expected output", async () => {
        const result = await runTestCase(
            {
                id: "job-2",
                participantId: "participant-1",
                interviewQuestionId: "question-1",
                testCaseId: "test-case-1",
                language: "PYTHON",
                sourceCode: `
x = int(input())
print(x + 1)
`,
                status: "QUEUED",
            },
            {
                id: "test-2",
                input: "5\n",
                expectedOutput: "25\n",
                isHidden: false,
            }
        );

        expect(result.passed).toBe(false);
        expect(result.actualOutput).toBe("6\n");
        expect(result.exitCode).toBe(0);
    });

    it("should run multiple test cases", async () => {
        const result = await runTestCases(
            {
                id: "job-3",
                participantId: "participant-1",
                interviewQuestionId: "question-1",
                testCaseId: "test-case-1",
                language: "PYTHON",
                sourceCode: `
x = int(input())
print(x * x)
`,
                status: "QUEUED",
            },
            [
                {
                    id: "test-1",
                    input: "5\n",
                    expectedOutput: "25\n",
                    isHidden: false,
                },
                {
                    id: "test-2",
                    input: "10\n",
                    expectedOutput: "100\n",
                    isHidden: false,
                },
                {
                    id: "test-3",
                    input: "20\n",
                    expectedOutput: "400\n",
                    isHidden: true,
                },
            ]
        );

        expect(result).toHaveLength(3);
        expect(result.every((testCase) => testCase.passed)).toBe(true);
    });
});