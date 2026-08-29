import { describe, expect, it } from "vitest";
import { executeJob } from "./executor";

describe("executeJob", () => {
    it("should execute a Python job", async () => {
        const result = await executeJob({
            id: "job-1",
            language: "PYTHON",
            sourceCode: 'print("Hello from job")',
            status: "QUEUED",
        });

        expect(result.stdout).toBe("Hello from job\n");
        expect(result.stderr).toBe("");
        expect(result.exitCode).toBe(0);
        expect(result.timedOut).toBe(false);
        expect(result.outputLimitExceeded).toBe(false);
    });
});