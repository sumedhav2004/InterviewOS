import { ExecutionJob, ExecutionResult } from "./types";
import { executeJob } from "./executor";

export type WorkerResult = {
    job: ExecutionJob;
    result: ExecutionResult;
};

export async function processJob(
    job: ExecutionJob
): Promise<WorkerResult> {
    job.status = "RUNNING";

    try {
        const result = await executeJob(job);

        job.status = result.exitCode === 0
            ? "COMPLETED"
            : "FAILED";

        return {
            job,
            result,
        };
    } catch (error) {
        job.status = "FAILED";
        throw error;
    }
}