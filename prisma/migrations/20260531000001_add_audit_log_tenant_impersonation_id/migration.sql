-- AlterTable: add tenantImpersonationId to AuditLog
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "tenant_impersonation_id" TEXT;
