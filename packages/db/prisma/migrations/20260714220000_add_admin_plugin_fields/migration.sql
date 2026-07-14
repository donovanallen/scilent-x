-- Better Auth admin plugin fields
-- https://www.better-auth.com/docs/plugins/admin#schema

-- AlterTable
ALTER TABLE "users" ADD COLUMN "role" TEXT DEFAULT 'user';
ALTER TABLE "users" ADD COLUMN "banned" BOOLEAN DEFAULT false;
ALTER TABLE "users" ADD COLUMN "banReason" TEXT;
ALTER TABLE "users" ADD COLUMN "banExpires" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN "impersonatedBy" TEXT;
