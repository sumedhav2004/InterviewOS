import { apiClient } from "@/lib/api";

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

export type SubmissionWithResults = Submission & {
  codeRunTestCaseResults: SubmissionTestCaseResult[];
};

export const submissionApi = {
  createSubmission(
    data: CreateSubmissionRequest,
  ) {
    return apiClient.post<Submission>(
      `/submissions`,
      data,
    );
  },

  getSubmission(
    submissionId: string,
  ) {
    return apiClient.get<SubmissionWithResults>(
      `/submissions/${submissionId}`,
    );
  },
};