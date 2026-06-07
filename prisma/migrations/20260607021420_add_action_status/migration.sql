-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('COMPLETED', 'SCHEDULED', 'CANCELED', 'FAILED');

-- AlterTable
ALTER TABLE "SubscriptionEvent" ADD COLUMN     "actionStatus" "ActionStatus" NOT NULL DEFAULT 'COMPLETED';
