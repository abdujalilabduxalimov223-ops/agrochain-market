-- AlterTable
ALTER TABLE "products" ADD COLUMN     "shelfCode" TEXT,
ADD COLUMN     "storedAt" TIMESTAMP(3),
ADD COLUMN     "warehouseLocation" TEXT,
ADD COLUMN     "warehouseName" TEXT;
