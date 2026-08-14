-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "fullName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;
