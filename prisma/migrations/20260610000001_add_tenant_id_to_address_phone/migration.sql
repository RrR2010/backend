-- Add tenantId, streetType to Address
ALTER TABLE "Address" ADD COLUMN "tenantId" TEXT NOT NULL DEFAULT 'MIGRATION_PLACEHOLDER';
ALTER TABLE "Address" ADD COLUMN "streetType" TEXT;
CREATE INDEX "Address_tenantId_idx" ON "Address"("tenantId");

-- Add tenantId, extension to Phone
ALTER TABLE "Phone" ADD COLUMN "tenantId" TEXT NOT NULL DEFAULT 'MIGRATION_PLACEHOLDER';
ALTER TABLE "Phone" ADD COLUMN "extension" TEXT;
CREATE INDEX "Phone_tenantId_idx" ON "Phone"("tenantId");

-- Add addressData, phoneData to TenantRegistration
ALTER TABLE "TenantRegistration" ADD COLUMN "addressData" JSONB;
ALTER TABLE "TenantRegistration" ADD COLUMN "phoneData" JSONB;
