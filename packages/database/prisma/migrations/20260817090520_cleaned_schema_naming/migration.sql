/*
  Warnings:

  - You are about to drop the column `evaluatedSubmissionId` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `belongingInterviewId` on the `InterviewQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `usedQuestionId` on the `InterviewQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `submittedByParticipantId` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `submittedQuestionId` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `forQuestionId` on the `TestCase` table. All the data in the column will be lost.
  - You are about to drop the `RunCode` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[submissionId]` on the table `Evaluation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[interviewId,questionId]` on the table `InterviewQuestion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[interviewId,questionOrder]` on the table `InterviewQuestion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `submissionId` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interviewId` to the `InterviewQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionId` to the `InterviewQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interviewQuestionId` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `participantId` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionId` to the `TestCase` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Evaluation" DROP CONSTRAINT "Evaluation_evaluatedSubmissionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."InterviewQuestion" DROP CONSTRAINT "InterviewQuestion_belongingInterviewId_fkey";

-- DropForeignKey
ALTER TABLE "public"."InterviewQuestion" DROP CONSTRAINT "InterviewQuestion_usedQuestionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RunCode" DROP CONSTRAINT "RunCode_RanByParticipantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RunCode" DROP CONSTRAINT "RunCode_RanInterviewQuestionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Submission" DROP CONSTRAINT "Submission_submittedByParticipantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Submission" DROP CONSTRAINT "Submission_submittedQuestionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TestCase" DROP CONSTRAINT "TestCase_forQuestionId_fkey";

-- DropIndex
DROP INDEX "public"."Evaluation_evaluatedSubmissionId_key";

-- DropIndex
DROP INDEX "public"."InterviewQuestion_belongingInterviewId_idx";

-- DropIndex
DROP INDEX "public"."InterviewQuestion_belongingInterviewId_questionOrder_key";

-- DropIndex
DROP INDEX "public"."InterviewQuestion_belongingInterviewId_usedQuestionId_key";

-- DropIndex
DROP INDEX "public"."InterviewQuestion_usedQuestionId_idx";

-- DropIndex
DROP INDEX "public"."Submission_submittedByParticipantId_idx";

-- DropIndex
DROP INDEX "public"."Submission_submittedQuestionId_idx";

-- DropIndex
DROP INDEX "public"."TestCase_forQuestionId_idx";

-- AlterTable
ALTER TABLE "Evaluation" DROP COLUMN "evaluatedSubmissionId",
ADD COLUMN     "submissionId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "InterviewQuestion" DROP COLUMN "belongingInterviewId",
DROP COLUMN "usedQuestionId",
ADD COLUMN     "interviewId" UUID NOT NULL,
ADD COLUMN     "questionId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "submittedByParticipantId",
DROP COLUMN "submittedQuestionId",
ADD COLUMN     "interviewQuestionId" UUID NOT NULL,
ADD COLUMN     "participantId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "TestCase" DROP COLUMN "forQuestionId",
ADD COLUMN     "questionId" UUID NOT NULL;

-- DropTable
DROP TABLE "public"."RunCode";

-- CreateTable
CREATE TABLE "CodeRun" (
    "id" UUID NOT NULL,
    "language" "ProgrammingLanguage" NOT NULL,
    "sourceCode" TEXT NOT NULL,
    "status" "ExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "stdout" TEXT,
    "stderr" TEXT,
    "executionTimeMS" INTEGER,
    "memoryBytes" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "participantId" UUID NOT NULL,
    "interviewQuestionId" UUID NOT NULL,

    CONSTRAINT "CodeRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CodeRun_participantId_idx" ON "CodeRun"("participantId");

-- CreateIndex
CREATE INDEX "CodeRun_interviewQuestionId_idx" ON "CodeRun"("interviewQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_submissionId_key" ON "Evaluation"("submissionId");

-- CreateIndex
CREATE INDEX "InterviewQuestion_interviewId_idx" ON "InterviewQuestion"("interviewId");

-- CreateIndex
CREATE INDEX "InterviewQuestion_questionId_idx" ON "InterviewQuestion"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewQuestion_interviewId_questionId_key" ON "InterviewQuestion"("interviewId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewQuestion_interviewId_questionOrder_key" ON "InterviewQuestion"("interviewId", "questionOrder");

-- CreateIndex
CREATE INDEX "Submission_interviewQuestionId_idx" ON "Submission"("interviewQuestionId");

-- CreateIndex
CREATE INDEX "Submission_participantId_idx" ON "Submission"("participantId");

-- CreateIndex
CREATE INDEX "TestCase_questionId_idx" ON "TestCase"("questionId");

-- AddForeignKey
ALTER TABLE "InterviewQuestion" ADD CONSTRAINT "InterviewQuestion_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewQuestion" ADD CONSTRAINT "InterviewQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeRun" ADD CONSTRAINT "CodeRun_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeRun" ADD CONSTRAINT "CodeRun_interviewQuestionId_fkey" FOREIGN KEY ("interviewQuestionId") REFERENCES "InterviewQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_interviewQuestionId_fkey" FOREIGN KEY ("interviewQuestionId") REFERENCES "InterviewQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
