import { ExecutionStatus, ProgrammingLanguage } from "@interview-os/database";
import { ExecutionJobStatus } from "./codeRun";

export type CreateSubmissionData = {
    language: ProgrammingLanguage;
    sourceCode: string;
};

export type CreateSubmissionTestCaseResultData = {
    submissionId: string;
    testCaseId: string;
    status: ExecutionStatus;
    passed: boolean;
    stdout?: string;
    stderr?: string;
    executionTimeMS?: number;
};
