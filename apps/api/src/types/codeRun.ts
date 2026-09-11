import { ExecutionStatus, ProgrammingLanguage } from "@interview-os/database"

export type CreateCodeRunData = {
    language: ProgrammingLanguage,
    sourceCode: string
}

export type UpdateCodeRunData = {
    status: ExecutionStatus
    stdout?: string 
    stderr?: string 
    executionTimeMS?: number
    memoryBytes?: number
}

export type ExecutionJob = {
    id: string;
    participantId: string;
    interviewQuestionId: string;
    language: "PYTHON" | "JAVASCRIPT" | "JAVA" | "CPP";
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
    codeRunId: string;
    status: "SUCCESS" | "FAILED";
    stdout: string;
    stderr: string;
    executionTimeMS: number;
};