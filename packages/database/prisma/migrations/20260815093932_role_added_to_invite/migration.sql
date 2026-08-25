/*
  Warnings:

  - Added the required column `role` to the `Invite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invite" ADD COLUMN     "role" "ParticipantRole" NOT NULL;
