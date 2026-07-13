-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('POST', 'REVIEW');

-- CreateEnum
CREATE TYPE "ReviewSubjectType" AS ENUM ('RELEASE', 'TRACK');

-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE 'REVIEW_CREATED';

-- AlterTable
ALTER TABLE "posts" ADD COLUMN "type" "PostType" NOT NULL DEFAULT 'POST';

-- CreateIndex
CREATE INDEX "posts_type_idx" ON "posts"("type");

-- CreateTable
CREATE TABLE "review_subjects" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "type" "ReviewSubjectType" NOT NULL,
    "gtin" TEXT,
    "isrc" TEXT,
    "mbid" TEXT,
    "title" TEXT NOT NULL,
    "artistLabel" TEXT,
    "artworkUrl" TEXT,
    "releaseDate" TEXT,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "review_subjects_postId_key" ON "review_subjects"("postId");

-- CreateIndex
CREATE INDEX "review_subjects_gtin_idx" ON "review_subjects"("gtin");

-- CreateIndex
CREATE INDEX "review_subjects_isrc_idx" ON "review_subjects"("isrc");

-- CreateIndex
CREATE INDEX "review_subjects_mbid_idx" ON "review_subjects"("mbid");

-- CreateIndex
CREATE INDEX "review_subjects_type_idx" ON "review_subjects"("type");

-- AddForeignKey
ALTER TABLE "review_subjects" ADD CONSTRAINT "review_subjects_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
