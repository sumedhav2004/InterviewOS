import { ExecutionJob, ExecutionResult } from "./types";
import { executePython } from "./docker-executor";
import { executeJS } from "./javascript-executor";
import { executeJava } from "./java-executor";
import { executeCpp } from "./cpp-executor";

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

        case "JAVA":
            return executeJava(
                job.sourceCode,
                job.input
            )

        case "CPP":
        return executeCpp(
            job.sourceCode,
            job.input
        );
        default:
            throw new Error(`Unsupported language: ${job.language}`);
    }
}