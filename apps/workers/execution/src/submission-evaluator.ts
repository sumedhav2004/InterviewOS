import { SubmissionResult, SubmissionVerdict, TestCaseResult } from "./types";


export function evaluateSubmission(
    results: TestCaseResult[]
): SubmissionResult {
    const passedTestCases = results.filter(
        (result) => result.passed
    ).length;

    const totalTestCases = results.length;

    const timedOut = results.some(
        (result) => result.timedOut
    );

    const outputLimitExceeded = results.some(
        (result) => result.outputLimitExceeded
    );

    const runtimeError = results.some(
        (result) =>
            result.exitCode !== 0 &&
            !result.timedOut &&
            !result.outputLimitExceeded
    );

    let verdict: SubmissionVerdict;

    if (timedOut) {
        verdict = "TIME_LIMIT_EXCEEDED";
    } else if (outputLimitExceeded) {
        verdict = "OUTPUT_LIMIT_EXCEEDED";
    } else if (runtimeError) {
        verdict = "RUNTIME_ERROR";
    } else if (passedTestCases === totalTestCases) {
        verdict = "ACCEPTED";
    } else {
        verdict = "WRONG_ANSWER";
    }

    return {
        verdict,
        passedTestCases,
        totalTestCases,
        testCases: results,
    };
}