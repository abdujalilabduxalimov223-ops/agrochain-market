/*
  Warnings:

  - A unique constraint covering the columns `[passportSeries]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[jshir]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "VerifyStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "scan_history" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "jshir" TEXT,
ADD COLUMN     "passportSeries" TEXT,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedBy" TEXT,
ADD COLUMN     "verifyStatus" "VerifyStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX "users_passportSeries_key" ON "users"("passportSeries");

-- CreateIndex
CREATE UNIQUE INDEX "users_jshir_key" ON "users"("jshir");

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_transportUserId_fkey" FOREIGN KEY ("transportUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scan_history" ADD CONSTRAINT "scan_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
