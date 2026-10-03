export type CodeRunTestCaseResult = {
    id: string;
    codeRunId: string;
    testCaseId: string;
    status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED";
    passed: boolean;
    stdout: string | null;
    stderr: string | null;
    executionTimeMS: number | null;
};