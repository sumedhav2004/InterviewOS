/*
  Warnings:

  - Made the column `title` on table `Resume` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Resume" ALTER COLUMN "title" SET NOT NULL;
