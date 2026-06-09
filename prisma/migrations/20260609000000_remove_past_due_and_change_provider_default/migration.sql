-- AlterEnum: Remove PAST_DUE from SubscriptionStatus
-- This migration manually handles removing a value from an enum
ALTER TYPE "SubscriptionStatus" RENAME TO "SubscriptionStatus_old";
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'GRACE', 'PAUSED', 'CANCELED', 'EXPIRED');
ALTER TABLE "Subscription" ALTER COLUMN "status" TYPE "SubscriptionStatus" USING ("status"::text::"SubscriptionStatus");
ALTER TABLE "SubscriptionEvent" ALTER COLUMN "statusBefore" TYPE "SubscriptionStatus" USING ("statusBefore"::text::"SubscriptionStatus");
ALTER TABLE "SubscriptionEvent" ALTER COLUMN "statusAfter" TYPE "SubscriptionStatus" USING ("statusAfter"::text::"SubscriptionStatus");
DROP TYPE "SubscriptionStatus_old";

-- AlterTable: Change Subscription provider default from "mercadopago" to "free"
ALTER TABLE "Subscription" ALTER COLUMN "provider" SET DEFAULT 'free';
