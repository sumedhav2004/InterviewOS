import { describe, expect, it } from "vitest";
import { executeJob } from "./executor";

describe("executeJob", () => {
    it("should execute a Python job", async () => {
        const result = await executeJob({
            id: "job-1",

            participantId: "participant-1",
            interviewQuestionId: "question-1",

            language: "PYTHON",

            sourceCode: `
x = int(input())
print(x * x)
`,

            input: "5\n",

            status: "QUEUED",
        });

        expect(result.stdout).toBe("25\n");
        expect(result.stderr).toBe("");
        expect(result.exitCode).toBe(0);
        expect(result.timedOut).toBe(false);
        expect(result.outputLimitExceeded).toBe(false);
    });
});