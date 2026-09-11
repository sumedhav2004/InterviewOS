import { evaluateSubmission } from "./submission-evaluator";
import { runTestCases } from "./test-case-runner";

import { ExecutionJob, ExecutionTestCase, SubmissionResult } from "./types";


export async function runSubmission(
    job: ExecutionJob,
    testCases: ExecutionTestCase[]
): Promise<SubmissionResult> {
    const results = await runTestCases(
        job,
        testCases
    );

    return evaluateSubmission(results);
}