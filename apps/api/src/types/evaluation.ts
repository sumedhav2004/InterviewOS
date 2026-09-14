import { EvaluationStatus } from "@interview-os/database";


export type CreateEvaluationData = {
    submissionId: string;
    status: EvaluationStatus;
    score: number;
    passedTests: number;
    totalTests: number;
    executionTimeMS?: number;
    memoryBytes?: bigint;
    feedback?: string;
};