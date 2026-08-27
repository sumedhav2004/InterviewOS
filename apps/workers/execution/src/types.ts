export interface ExecutionResult {
    stdout: string;
    stderr: string;
    exitCode: number | null;
    timedOut: boolean;
    outputLimitExceeded: boolean;
    executionTimeMs: number;
}