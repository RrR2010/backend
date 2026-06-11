-- Add provisionedAddressId, provisionedPhoneId to TenantRegistration
ALTER TABLE "TenantRegistration" ADD COLUMN "provisionedAddressId" TEXT;
ALTER TABLE "TenantRegistration" ADD COLUMN "provisionedPhoneId" TEXT;
