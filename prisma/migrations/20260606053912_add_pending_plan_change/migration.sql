-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "pendingEffectiveFrom" TIMESTAMP(3),
ADD COLUMN     "pendingNewAmount" INTEGER,
ADD COLUMN     "pendingPlanType" TEXT;
