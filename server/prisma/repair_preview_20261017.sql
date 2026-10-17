-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."BorrowStatus" ADD VALUE 'PENDING';
ALTER TYPE "public"."BorrowStatus" ADD VALUE 'REJECTED';
ALTER TYPE "public"."BorrowStatus" ADD VALUE 'CANCELLED';

-- AlterEnum
ALTER TYPE "public"."Role" ADD VALUE 'MEMBER';

-- DropForeignKey
ALTER TABLE "public"."BorrowRecord" DROP CONSTRAINT "BorrowRecord_processedById_fkey";

-- AlterTable
ALTER TABLE "public"."BorrowRecord" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "rejectReason" TEXT,
ADD COLUMN     "renewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "userId" INTEGER,
ALTER COLUMN "status" SET DEFAULT 'PENDING',
ALTER COLUMN "processedById" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "memberCode" TEXT,
ADD COLUMN     "phone" TEXT;

-- CreateIndex
CREATE INDEX "BorrowRecord_userId_idx" ON "public"."BorrowRecord"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_memberCode_key" ON "public"."User"("memberCode");

-- AddForeignKey
ALTER TABLE "public"."BorrowRecord" ADD CONSTRAINT "BorrowRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BorrowRecord" ADD CONSTRAINT "BorrowRecord_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
