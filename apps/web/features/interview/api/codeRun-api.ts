import { apiClient } from "@/lib/api/api-client";

export type CreateCodeRunRequest = {
  interviewQuestionId: string;
  participantId: string;
  language: string;
  sourceCode: string;
};

export type CodeRunTestCaseResult = {
  id: string;
  codeRunId: string;
  testCaseId: string;
  status: string;
  passed: boolean;
  stdout: string | null;
  stderr: string | null;
  executionTimeMS: number | null;
  memoryBytes?: string | null;
};

export type CodeRun = {
  id: string;
  interviewQuestionId: string;
  participantId: string;
  language: string;
  sourceCode: string;
  status: string;
};

export type CodeRunWithResults = CodeRun & {
  codeRunTestCaseResults: CodeRunTestCaseResult[];
};

export const codeRunApi = {
  createCodeRun(data: CreateCodeRunRequest) {
    return apiClient.post<CodeRun>("/coderuns", data);
  },

  executeCodeRun(codeRunId: string) {
    return apiClient.post<CodeRun>(
      `/coderuns/${codeRunId}/execute`,
    );
  },

  getCodeRunResults(codeRunId: string) {
    return apiClient.get<CodeRunWithResults>(
      `/coderuns/${codeRunId}/results`,
    );
  },
};