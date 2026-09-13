import { ExecutionStatus, ProgrammingLanguage } from "@interview-os/database"

export type CreateCodeRunData = {
    language: ProgrammingLanguage,
    sourceCode: string
}

export type UpdateCodeRunData = {
    status: ExecutionStatus
}

export type ExecutionJob = {
    id: string;
    codeRunId: string
    participantId: string;
    interviewQuestionId: string;
    testCaseId: string;
    language: "PYTHON" | "JAVASCRIPT" | "JAVA" | "CPP" | "C" | "GO" | "RUST";
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

export type ExecutionCompletedEvent = {
    type: "EXECUTION_COMPLETED"
    testCaseId: string;
    codeRunId: string;
    status: "SUCCESS" | "FAILED";
    stdout: string;
    stderr: string;
    executionTimeMS: number;
};

export type CreateCodeRunTestCaseResultData = {
    codeRunId: string;
    testCaseId: string;
    status: ExecutionStatus;
    passed: boolean;
    stdout?: string;
    stderr?: string;
    executionTimeMS?: number;
    memoryBytes?: number;
};