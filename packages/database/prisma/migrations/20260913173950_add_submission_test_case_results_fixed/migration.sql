-- CreateTable
CREATE TABLE "SubmissionTestCaseResult" (
    "id" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "testCaseId" UUID NOT NULL,
    "status" "ExecutionStatus" NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "stdout" TEXT,
    "stderr" TEXT,
    "executionTimeMS" INTEGER,
    "memoryBytes" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionTestCaseResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubmissionTestCaseResult_submissionId_idx" ON "SubmissionTestCaseResult"("submissionId");

-- CreateIndex
CREATE INDEX "SubmissionTestCaseResult_testCaseId_idx" ON "SubmissionTestCaseResult"("testCaseId");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionTestCaseResult_submissionId_testCaseId_key" ON "SubmissionTestCaseResult"("submissionId", "testCaseId");

-- AddForeignKey
ALTER TABLE "SubmissionTestCaseResult" ADD CONSTRAINT "SubmissionTestCaseResult_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionTestCaseResult" ADD CONSTRAINT "SubmissionTestCaseResult_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
