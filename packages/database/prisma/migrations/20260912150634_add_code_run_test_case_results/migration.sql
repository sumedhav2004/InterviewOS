/*
  Warnings:

  - The values [TYPESCRIPT] on the enum `ProgrammingLanguage` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `executionTimeMS` on the `CodeRun` table. All the data in the column will be lost.
  - You are about to drop the column `memoryBytes` on the `CodeRun` table. All the data in the column will be lost.
  - You are about to drop the column `stderr` on the `CodeRun` table. All the data in the column will be lost.
  - You are about to drop the column `stdout` on the `CodeRun` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProgrammingLanguage_new" AS ENUM ('JAVA', 'PYTHON', 'CPP', 'C', 'RUST', 'GO', 'JAVASCRIPT');
ALTER TABLE "CodeRun" ALTER COLUMN "language" TYPE "ProgrammingLanguage_new" USING ("language"::text::"ProgrammingLanguage_new");
ALTER TABLE "Submission" ALTER COLUMN "language" TYPE "ProgrammingLanguage_new" USING ("language"::text::"ProgrammingLanguage_new");
ALTER TYPE "ProgrammingLanguage" RENAME TO "ProgrammingLanguage_old";
ALTER TYPE "ProgrammingLanguage_new" RENAME TO "ProgrammingLanguage";
DROP TYPE "public"."ProgrammingLanguage_old";
COMMIT;

-- AlterTable
ALTER TABLE "CodeRun" DROP COLUMN "executionTimeMS",
DROP COLUMN "memoryBytes",
DROP COLUMN "stderr",
DROP COLUMN "stdout";

-- CreateTable
CREATE TABLE "CodeRunTestCaseResult" (
    "id" UUID NOT NULL,
    "codeRunId" UUID NOT NULL,
    "testCaseId" UUID NOT NULL,
    "status" "ExecutionStatus" NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "stdout" TEXT,
    "stderr" TEXT,
    "executionTimeMS" INTEGER,
    "memoryBytes" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeRunTestCaseResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CodeRunTestCaseResult_codeRunId_idx" ON "CodeRunTestCaseResult"("codeRunId");

-- CreateIndex
CREATE INDEX "CodeRunTestCaseResult_testCaseId_idx" ON "CodeRunTestCaseResult"("testCaseId");

-- CreateIndex
CREATE UNIQUE INDEX "CodeRunTestCaseResult_codeRunId_testCaseId_key" ON "CodeRunTestCaseResult"("codeRunId", "testCaseId");

-- AddForeignKey
ALTER TABLE "CodeRunTestCaseResult" ADD CONSTRAINT "CodeRunTestCaseResult_codeRunId_fkey" FOREIGN KEY ("codeRunId") REFERENCES "CodeRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeRunTestCaseResult" ADD CONSTRAINT "CodeRunTestCaseResult_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
