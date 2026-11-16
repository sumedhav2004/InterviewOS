import { describe, expect, it } from "vitest";
import { executeJob } from "../../executor";

describe("executeJob", () => {
  it("should execute a Python job", async () => {
    const result = await executeJob({
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

      input: 5,

      status: "QUEUED",
      target: {
        type: "CODE_RUN",
        codeRunId: "code-run-1",
      },
    });

    expect(result.stdout).toBe("25\n");
    expect(result.stderr).toBe("");
    expect(result.exitCode).toBe(0);
    expect(result.timedOut).toBe(false);
    expect(result.outputLimitExceeded).toBe(false);
  });
});
