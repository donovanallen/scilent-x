-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('USER', 'VOICE', 'ARTIST');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "profileType" "ProfileType" NOT NULL DEFAULT 'USER';
