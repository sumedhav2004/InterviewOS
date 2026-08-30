import { describe, expect, it, vi } from "vitest";
import { handleExecutionJob } from "./job-handler";
import { processJob } from "./worker";

vi.mock("./worker", () => ({
    processJob: vi.fn(),
}));

const mockedProcessJob = vi.mocked(processJob);

describe("handleExecutionJob", () => {
    it("should process an execution job", async () => {
        const job = {
            id: "job-1",
            participantId: "participant-1",
            interviewQuestionId: "question-1",
            language: "PYTHON" as const,
            sourceCode: 'print("hello")',
            status: "QUEUED" as const,
        };

        mockedProcessJob.mockResolvedValue({
            job: {
                ...job,
                status: "COMPLETED",
            },
            result: {
                stdout: "hello\n",
                stderr: "",
                exitCode: 0,
                timedOut: false,
                outputLimitExceeded: false,
                executionTimeMs: 100,
            },
        });

        const result = await handleExecutionJob(job);

        expect(mockedProcessJob).toHaveBeenCalledWith(job);

        expect(result.job.status).toBe("COMPLETED");
        expect(result.result.stdout).toBe("hello\n");
    });
});