-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "passwordSetupTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "passwordSetupTokenHash" TEXT;
