import { executeJob } from "./executor";
import { ExecutionJob } from "./types";

async function main() {
    const job: ExecutionJob = {
        id: "test-js",
        participantId: "test-participant",
        interviewQuestionId: "test-question",
        language: "JAVASCRIPT",
        sourceCode: `console.log("Hello from executeJob");`,
        input: "",
        status: "QUEUED",
    };

    const result = await executeJob(job);

    console.log("RESULT:", result);
}

main().catch(console.error);