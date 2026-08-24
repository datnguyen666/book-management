-- CreateEnum
CREATE TYPE "public"."BorrowStatus" AS ENUM ('BORROWING', 'RETURNED');

-- CreateTable
CREATE TABLE "public"."BorrowRecord" (
    "id" SERIAL NOT NULL,
    "borrowerName" TEXT NOT NULL,
    "borrowerCode" TEXT NOT NULL,
    "bookId" INTEGER NOT NULL,
    "borrowedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "returnedAt" TIMESTAMP(3),
    "status" "public"."BorrowStatus" NOT NULL DEFAULT 'BORROWING',
    "processedById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BorrowRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BorrowRecord_bookId_idx" ON "public"."BorrowRecord"("bookId");

-- CreateIndex
CREATE INDEX "BorrowRecord_borrowerCode_idx" ON "public"."BorrowRecord"("borrowerCode");

-- CreateIndex
CREATE INDEX "BorrowRecord_processedById_idx" ON "public"."BorrowRecord"("processedById");

-- CreateIndex
CREATE INDEX "BorrowRecord_status_idx" ON "public"."BorrowRecord"("status");

-- AddForeignKey
ALTER TABLE "public"."BorrowRecord" ADD CONSTRAINT "BorrowRecord_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BorrowRecord" ADD CONSTRAINT "BorrowRecord_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
