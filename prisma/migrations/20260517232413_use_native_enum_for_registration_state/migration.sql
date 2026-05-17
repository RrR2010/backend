/*
  Warnings:

  - The `state` column on the `TenantRegistration` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "RegistrationState" AS ENUM ('PENDING', 'APPROVED', 'PROVISIONING', 'PROVISIONED', 'REJECTED', 'EXPIRED');

-- DropIndex
DROP INDEX "TenantRegistration_externalRef_idx";

-- AlterTable
ALTER TABLE "TenantRegistration" DROP COLUMN "state",
ADD COLUMN     "state" "RegistrationState" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "TenantRegistration_state_idx" ON "TenantRegistration"("state");
