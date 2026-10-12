import { ExecutionStatus, ProgrammingLanguage } from "@interview-os/database";

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
