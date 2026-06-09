-- AlterTable: Add providerCustomerId to TenantRegistration
ALTER TABLE "TenantRegistration" ADD COLUMN "providerCustomerId" TEXT;

-- AlterTable: Add providerCustomerId to Tenant
ALTER TABLE "Tenant" ADD COLUMN "providerCustomerId" TEXT;

-- AlterTable: Remove providerPreapprovalId from Subscription
DROP INDEX IF EXISTS "Subscription_providerPreapprovalId_key";
ALTER TABLE "Subscription" DROP COLUMN "providerPreapprovalId";
