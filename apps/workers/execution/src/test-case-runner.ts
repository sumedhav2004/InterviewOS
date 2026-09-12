import { executeJob } from "./executor";

import { ExecutionJob, ExecutionTestCase, TestCaseResult } from "./types";

export async function runTestCase(
    job: ExecutionJob,
    testCase: ExecutionTestCase
): Promise<TestCaseResult> {
    const result = await executeJob({
        ...job,
        input: testCase.input,
    });

    const passed =
        result.exitCode === 0 &&
        !result.timedOut &&
        !result.outputLimitExceeded &&
        result.stdout === testCase.expectedOutput;

    return {
        testCaseId: testCase.id,
        passed,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: result.stdout,
        stderr: result.stderr,
        executionTimeMS: result.executionTimeMS,
        timedOut: result.timedOut,
        outputLimitExceeded: result.outputLimitExceeded,
        exitCode: result.exitCode,
    };
}

export async function runTestCases(
    job: ExecutionJob,
    testCases: ExecutionTestCase[]
): Promise<TestCaseResult[]> {
    const results: TestCaseResult[] = [];

    for (const testCase of testCases) {
        const result = await runTestCase(job, testCase);

        results.push(result);

        if (!result.passed) {
            break;
        }
    }

    return results;
}