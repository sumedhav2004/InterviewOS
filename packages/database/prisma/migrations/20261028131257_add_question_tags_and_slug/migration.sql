/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Question` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- Add slug as nullable first so existing questions are preserved.
ALTER TABLE "Question" ADD COLUMN "slug" TEXT;

-- Generate slugs from existing question titles.
UPDATE "Question"
SET "slug" = LOWER(
    REGEXP_REPLACE(
        TRIM("title"),
        '[^a-zA-Z0-9]+',
        '-',
        'g'
    )
);

-- Make duplicate slugs unique by appending part of the question ID.
WITH duplicates AS (
    SELECT
        "id",
        "slug",
        ROW_NUMBER() OVER (
            PARTITION BY "slug"
            ORDER BY "id"
        ) AS row_num
    FROM "Question"
)
UPDATE "Question" AS q
SET "slug" = q."slug" || '-' || SUBSTRING(q."id"::TEXT, 1, 8)
FROM duplicates AS d
WHERE q."id" = d."id"
  AND d.row_num > 1;

-- Enforce the required slug constraint.
ALTER TABLE "Question" ALTER COLUMN "slug" SET NOT NULL;

-- CreateTable
CREATE TABLE "Tag" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionTag" (
    "questionId" UUID NOT NULL,
    "tagId" UUID NOT NULL,

    CONSTRAINT "QuestionTag_pkey" PRIMARY KEY ("questionId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "QuestionTag_tagId_idx" ON "QuestionTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "Question_slug_key" ON "Question"("slug");

-- CreateIndex
CREATE INDEX "Question_difficulty_createdAt_idx" ON "Question"("difficulty", "createdAt");

-- AddForeignKey
ALTER TABLE "QuestionTag" ADD CONSTRAINT "QuestionTag_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionTag" ADD CONSTRAINT "QuestionTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
