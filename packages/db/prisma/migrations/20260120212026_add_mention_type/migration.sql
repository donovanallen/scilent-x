-- CreateEnum
CREATE TYPE "MentionType" AS ENUM ('USER', 'ARTIST', 'ALBUM', 'TRACK');

-- AlterTable
ALTER TABLE "mentions" ADD COLUMN     "type" "MentionType" NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE INDEX "mentions_type_idx" ON "mentions"("type");
