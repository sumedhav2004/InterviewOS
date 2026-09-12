import { describe, expect, it } from "vitest";
import { runSubmission } from "./submission-runner";

describe("runSubmission", () => {
    it("should accept a submission when all test cases pass", async () => {
        const result = await runSubmission(
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
            ]
        );

        expect(result.verdict).toBe("ACCEPTED");
        expect(result.passedTestCases).toBe(2);
        expect(result.totalTestCases).toBe(2);
    });

    it("should reject a submission when a test case fails", async () => {
        const result = await runSubmission(
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
            [
                {
                    id: "test-1",
                    input: "5\n",
                    expectedOutput: "25\n",
                    isHidden: false,
                },
            ]
        );

        expect(result.verdict).toBe("WRONG_ANSWER");
        expect(result.passedTestCases).toBe(0);
        expect(result.totalTestCases).toBe(1);
    });
});