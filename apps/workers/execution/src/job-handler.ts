import { ExecutionJob, ExecutionResult } from "./types";
import { processJob } from "./worker";

export type JobHandlerResult = {
    job: ExecutionJob;
    result: ExecutionResult;
};

export async function handleExecutionJob(
    job: ExecutionJob
): Promise<JobHandlerResult> {
    return processJob(job);
}