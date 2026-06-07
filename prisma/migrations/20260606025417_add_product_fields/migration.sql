-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "barcodeGtin" TEXT,
ADD COLUMN     "commercialName" TEXT,
ADD COLUMN     "declaredVolume" DECIMAL(65,30),
ADD COLUMN     "declaredWeight" DECIMAL(65,30),
ADD COLUMN     "denomination" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "productType" TEXT,
ADD COLUMN     "shelfLifeDays" INTEGER,
ADD COLUMN     "storageConditions" TEXT;
