-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'INPROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('INTERVIEWER', 'CANDIDATE', 'OBSERVER');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "QuestionDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "TestCaseVisibility" AS ENUM ('HIDDEN', 'VISIBLE');

-- CreateEnum
CREATE TYPE "ProgrammingLanguage" AS ENUM ('JAVA', 'PYTHON', 'CPP', 'C', 'RUST', 'GO', 'JAVASCRIPT', 'TYPESCRIPT');

-- CreateEnum
CREATE TYPE "ExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('PASSED', 'FAILED', 'PENDING');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "avatarUrl" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Interview" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "InterviewStatus" NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "durationMinutes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" UUID NOT NULL,
    "role" "ParticipantRole" NOT NULL,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3),
    "leftAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "interviewId" UUID NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" UUID NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "interviewId" UUID NOT NULL,
    "senderId" UUID NOT NULL,
    "receiverId" UUID NOT NULL,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "QuestionDifficulty" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewQuestion" (
    "id" UUID NOT NULL,
    "questionOrder" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "belongingInterviewId" UUID NOT NULL,
    "usedQuestionId" UUID NOT NULL,

    CONSTRAINT "InterviewQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCase" (
    "id" UUID NOT NULL,
    "input" JSONB NOT NULL,
    "expectedOutput" JSONB NOT NULL,
    "visibility" "TestCaseVisibility" NOT NULL DEFAULT 'HIDDEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "forQuestionId" UUID NOT NULL,

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RunCode" (
    "id" UUID NOT NULL,
    "language" "ProgrammingLanguage" NOT NULL,
    "sourceCode" TEXT NOT NULL,
    "status" "ExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "stdout" TEXT,
    "stderr" TEXT,
    "executionTimeMS" INTEGER,
    "memoryBytes" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "RanByParticipantId" UUID NOT NULL,
    "RanInterviewQuestionId" UUID NOT NULL,

    CONSTRAINT "RunCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" UUID NOT NULL,
    "language" "ProgrammingLanguage" NOT NULL,
    "sourceCode" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedQuestionId" UUID NOT NULL,
    "submittedByParticipantId" UUID NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" UUID NOT NULL,
    "status" "EvaluationStatus" NOT NULL DEFAULT 'PENDING',
    "score" INTEGER NOT NULL,
    "passedTests" INTEGER NOT NULL,
    "totalTests" INTEGER NOT NULL,
    "executionTimeMS" INTEGER,
    "memoryBytes" BIGINT,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evaluatedSubmissionId" UUID NOT NULL,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Participant_userId_idx" ON "Participant"("userId");

-- CreateIndex
CREATE INDEX "Participant_interviewId_idx" ON "Participant"("interviewId");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_interviewId_userId_key" ON "Participant"("interviewId", "userId");

-- CreateIndex
CREATE INDEX "Invite_senderId_idx" ON "Invite"("senderId");

-- CreateIndex
CREATE INDEX "Invite_receiverId_idx" ON "Invite"("receiverId");

-- CreateIndex
CREATE INDEX "Invite_interviewId_idx" ON "Invite"("interviewId");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_interviewId_receiverId_key" ON "Invite"("interviewId", "receiverId");

-- CreateIndex
CREATE INDEX "Question_createdById_idx" ON "Question"("createdById");

-- CreateIndex
CREATE INDEX "InterviewQuestion_belongingInterviewId_idx" ON "InterviewQuestion"("belongingInterviewId");

-- CreateIndex
CREATE INDEX "InterviewQuestion_usedQuestionId_idx" ON "InterviewQuestion"("usedQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewQuestion_belongingInterviewId_usedQuestionId_key" ON "InterviewQuestion"("belongingInterviewId", "usedQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewQuestion_belongingInterviewId_questionOrder_key" ON "InterviewQuestion"("belongingInterviewId", "questionOrder");

-- CreateIndex
CREATE INDEX "TestCase_forQuestionId_idx" ON "TestCase"("forQuestionId");

-- CreateIndex
CREATE INDEX "RunCode_RanByParticipantId_idx" ON "RunCode"("RanByParticipantId");

-- CreateIndex
CREATE INDEX "RunCode_RanInterviewQuestionId_idx" ON "RunCode"("RanInterviewQuestionId");

-- CreateIndex
CREATE INDEX "Submission_submittedQuestionId_idx" ON "Submission"("submittedQuestionId");

-- CreateIndex
CREATE INDEX "Submission_submittedByParticipantId_idx" ON "Submission"("submittedByParticipantId");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_evaluatedSubmissionId_key" ON "Evaluation"("evaluatedSubmissionId");

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewQuestion" ADD CONSTRAINT "InterviewQuestion_belongingInterviewId_fkey" FOREIGN KEY ("belongingInterviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewQuestion" ADD CONSTRAINT "InterviewQuestion_usedQuestionId_fkey" FOREIGN KEY ("usedQuestionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_forQuestionId_fkey" FOREIGN KEY ("forQuestionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunCode" ADD CONSTRAINT "RunCode_RanByParticipantId_fkey" FOREIGN KEY ("RanByParticipantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunCode" ADD CONSTRAINT "RunCode_RanInterviewQuestionId_fkey" FOREIGN KEY ("RanInterviewQuestionId") REFERENCES "InterviewQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_submittedQuestionId_fkey" FOREIGN KEY ("submittedQuestionId") REFERENCES "InterviewQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_submittedByParticipantId_fkey" FOREIGN KEY ("submittedByParticipantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_evaluatedSubmissionId_fkey" FOREIGN KEY ("evaluatedSubmissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
