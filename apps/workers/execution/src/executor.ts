import { ExecutionJob, ExecutionResult } from "./types";
import { executePython } from "./docker-executor";
import { executeJS } from "./javascript-executor";

export async function executeJob(
    job: ExecutionJob
): Promise<ExecutionResult> {
    switch (job.language) {
        case "PYTHON":
            return executePython(
                job.sourceCode,
                job.input
            );

        case "JAVASCRIPT":
            return executeJS(
                job.sourceCode,
                job.input
            )

        default:
            throw new Error(`Unsupported language: ${job.language}`);
    }
}