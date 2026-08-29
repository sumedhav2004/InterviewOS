import { describe, expect, it, vi } from "vitest";
import { processJob } from "./worker";
import { executeJob } from "./executor";

vi.mock("./executor", () => ({
    executeJob: vi.fn(),
}));

describe("processJob", () => {
    it("should mark a successful job as COMPLETED", async () => {
        const job = {
            id: "job-1",
            language: "PYTHON" as const,
            sourceCode: 'print("hello")',
            status: "QUEUED" as const,
        };

        vi.mocked(executeJob).mockResolvedValue({
            stdout: "hello\n",
            stderr: "",
            exitCode: 0,
            timedOut: false,
            outputLimitExceeded: false,
            executionTimeMs: 100,
        });

        const result = await processJob(job);

        expect(executeJob).toHaveBeenCalledWith(job);

        expect(result.job.status).toBe("COMPLETED");

        expect(result.result.exitCode).toBe(0);
        expect(result.result.stdout).toBe("hello\n");
    });

    it("should mark a failed execution as FAILED", async () => {
        const job = {
            id: "job-2",
            language: "PYTHON" as const,
            sourceCode: "raise Exception()",
            status: "QUEUED" as const,
        };

        vi.mocked(executeJob).mockResolvedValue({
            stdout: "",
            stderr: "Exception\n",
            exitCode: 1,
            timedOut: false,
            outputLimitExceeded: false,
            executionTimeMs: 100,
        });

        const result = await processJob(job);

        expect(result.job.status).toBe("FAILED");
        expect(result.result.exitCode).toBe(1);
    });
});