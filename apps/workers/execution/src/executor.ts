import { ExecutionJob, ExecutionResult } from "./types";
import { executePython } from "./docker-executor";
import { executeJS } from "./javascript-executor";
import { executeJava } from "./java-executor";
import { executeCpp } from "./cpp-executor";
import { executeC } from "./c-executor";
import { executeRust } from "./rust-executor";
import { executeGo } from "./go-executor";

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

        case "C":
            return executeC(
                job.sourceCode,
                job.input
            );

        case "RUST":
            return executeRust(
                job.sourceCode,
                job.input
            );

        case "GO":
            return executeGo(
                job.sourceCode,
                job.input
            );
        
        default:
            throw new Error(`Unsupported language: ${job.language}`);
    }
}