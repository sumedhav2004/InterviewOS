export type SubmissionState =
  | "IDLE"
  | "SUBMITTING"
  | "COMPLETED"
  | "FAILED";

export type CreateSubmissionRequest = {
  interviewQuestionId: string;
  participantId: string;
  language: string;
  sourceCode: string;
};

export type SubmissionTestCaseResult = {
  id: string;
  submissionId: string;
  testCaseId: string;
  status: string;
  passed: boolean;
  stdout: string | null;
  stderr: string | null;
  executionTimeMS: number | null;
  memoryBytes?: string | null;
};

export type Submission = {
  id: string;
  interviewQuestionId: string;
  participantId: string;
  language: string;
  sourceCode: string;
  status: string;
};

export type SubmissionEvaluation = {
  status: string;
  score: number;
  passedTests: number;
  totalTests: number;
  executionTimeMS: number | null;
};