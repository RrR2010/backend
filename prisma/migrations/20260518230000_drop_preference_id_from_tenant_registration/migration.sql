-- DropIndex
DROP INDEX "TenantRegistration_preferenceId_key";

-- AlterTable
ALTER TABLE "TenantRegistration" DROP COLUMN "preferenceId";
