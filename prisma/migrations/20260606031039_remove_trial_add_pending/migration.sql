/*
  Warnings:

  - The values [TRIALING] on the enum `SubscriptionStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `trialDays` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `providerPreapprovalId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `trialEndsAt` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionStatus_new" AS ENUM ('PENDING', 'ACTIVE', 'PAST_DUE', 'GRACE', 'PAUSED', 'CANCELED', 'EXPIRED');
ALTER TYPE "SubscriptionStatus" RENAME TO "SubscriptionStatus_old";
ALTER TYPE "SubscriptionStatus_new" RENAME TO "SubscriptionStatus";
DROP TYPE "public"."SubscriptionStatus_old";
COMMIT;

-- DropIndex
DROP INDEX "Subscription_providerPreapprovalId_key";

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "trialDays";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "providerPreapprovalId",
DROP COLUMN "trialEndsAt";
