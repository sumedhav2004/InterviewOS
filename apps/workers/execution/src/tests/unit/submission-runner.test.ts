import { describe, expect, it } from "vitest";
import { runSubmission } from "../../submission-runner";

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
import json
import sys

x = json.load(sys.stdin)
print(json.dumps(x * x))
`,
        status: "QUEUED",
        target: {
          type: "CODE_RUN",
          codeRunId: "code-run-1",
        },
      },
      [
        {
          id: "test-1",
          input: 5,
          expectedOutput: 25,
          isHidden: false,
        },
        {
          id: "test-2",
          input: 10,
          expectedOutput: 100,
          isHidden: false,
        },
      ],
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
import json
import sys

x = json.load(sys.stdin)
print(json.dumps(x + 1))
`,
        status: "QUEUED",
        target: {
          type: "CODE_RUN",
          codeRunId: "code-run-1",
        },
      },
      [
        {
          id: "test-1",
          input: 5,
          expectedOutput: 25,
          isHidden: false,
        },
      ],
    );

    expect(result.verdict).toBe("WRONG_ANSWER");
    expect(result.passedTestCases).toBe(0);
    expect(result.totalTestCases).toBe(1);
  });
});
