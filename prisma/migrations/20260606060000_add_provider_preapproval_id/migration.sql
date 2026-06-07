-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "providerPreapprovalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_providerPreapprovalId_key" ON "Subscription"("providerPreapprovalId");
