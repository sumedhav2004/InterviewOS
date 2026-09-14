type executionLanguage = "PYTHON" | "JAVASCRIPT" | "JAVA" | "CPP" | "C" | "GO" | "RUST"

export interface ExecutionResult {
    stdout: string;
    stderr: string;
    exitCode: number | null;
    timedOut: boolean;
    outputLimitExceeded: boolean;
    executionTimeMS: number;
}
export type ExecutionTarget =
    | {
        type: "CODE_RUN";
        codeRunId: string;
    }
    | {
        type: "SUBMISSION";
        submissionId: string;
    };

export type ExecutionJob = {
    id: string;
    participantId: string;
    interviewQuestionId: string;
    testCaseId: string;

    language:
        | "PYTHON"
        | "JAVASCRIPT"
        | "JAVA"
        | "CPP"
        | "C"
        | "GO"
        | "RUST";

    sourceCode: string;
    input?: string;
    timeoutMs?: number;
    memoryLimitMB?: number;
    status: ExecutionJobStatus;

    target: ExecutionTarget;
};

export type ExecutionJobStatus =
    | "QUEUED"
    | "RUNNING"
    | "COMPLETED"
    | "FAILED";

export type ExecutionTestCase = {
    id: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
};

export type TestCaseResult = {
    testCaseId: string;
    passed: boolean;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    stderr: string;
    executionTimeMS: number;
    timedOut: boolean;
    outputLimitExceeded: boolean;
    exitCode: number | null;
};

export type SubmissionVerdict =
    | "ACCEPTED"
    | "WRONG_ANSWER"
    | "TIME_LIMIT_EXCEEDED"
    | "RUNTIME_ERROR"
    | "OUTPUT_LIMIT_EXCEEDED";

export type SubmissionResult = {
    verdict: SubmissionVerdict;
    passedTestCases: number;
    totalTestCases: number;
    testCases: TestCaseResult[];
};

export type SubmissionMode =
    | "RUN"
    | "SUBMIT";

export type ExecutionCompletedEvent = {
    type: "EXECUTION_COMPLETED";
    target: ExecutionTarget;
    testCaseId: string;

    status: "SUCCESS" | "FAILED";

    stdout: string;
    stderr: string;

    exitCode: number | null;
    timedOut: boolean;
    outputLimitExceeded: boolean;

    executionTimeMS: number;
};