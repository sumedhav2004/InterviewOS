/*
  Warnings:

  - A unique constraint covering the columns `[activeInterviewQuestionId]` on the table `Interview` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "activeInterviewQuestionId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "Interview_activeInterviewQuestionId_key" ON "Interview"("activeInterviewQuestionId");

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_activeInterviewQuestionId_fkey" FOREIGN KEY ("activeInterviewQuestionId") REFERENCES "InterviewQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
