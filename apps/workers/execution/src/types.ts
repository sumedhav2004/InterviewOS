export interface ExecutionResult {
    stdout: string;
    stderr: string;
    exitCode: number | null;
    timedOut: boolean;
    outputLimitExceeded: boolean;
    executionTimeMs: number;
}

export type ExecutionJob = {
    id: string;

    participantId: string;
    interviewQuestionId: string;

    language: "PYTHON";

    sourceCode: string;

    input?: string;

    timeoutMs?: number;
    memoryLimitMB?: number;

    status: ExecutionJobStatus;
};

export type ExecutionJobStatus =
    | "QUEUED"
    | "RUNNING"
    | "COMPLETED"
    | "FAILED";