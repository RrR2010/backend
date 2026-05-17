-- CreateTable
CREATE TABLE "TenantRegistration" (
    "id" TEXT NOT NULL,
    "externalRef" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentId" TEXT,
    "preferenceId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "handoffTokenHash" TEXT,
    "handoffTokenExpiresAt" TIMESTAMP(3),
    "handoffTokenUsedAt" TIMESTAMP(3),
    "tenantData" JSONB NOT NULL,
    "tenantSiteData" JSONB NOT NULL,
    "userData" JSONB NOT NULL,
    "identityData" JSONB NOT NULL,
    "profileData" JSONB NOT NULL,
    "provisionedUserId" TEXT,
    "provisionedTenantId" TEXT,
    "provisionedMembershipId" TEXT,
    "provisionedProfileId" TEXT,
    "provisionedIdentityId" TEXT,
    "provisionedTenantSiteId" TEXT,
    "paymentStatus" TEXT,
    "paymentStatusDetail" TEXT,
    "webhookProcessedAt" TIMESTAMP(3),
    "provisionedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "TenantRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantRegistration_externalRef_key" ON "TenantRegistration"("externalRef");

-- CreateIndex
CREATE UNIQUE INDEX "TenantRegistration_paymentId_key" ON "TenantRegistration"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantRegistration_preferenceId_key" ON "TenantRegistration"("preferenceId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantRegistration_handoffTokenHash_key" ON "TenantRegistration"("handoffTokenHash");

-- CreateIndex
CREATE INDEX "TenantRegistration_state_idx" ON "TenantRegistration"("state");

-- CreateIndex
CREATE INDEX "TenantRegistration_expiresAt_idx" ON "TenantRegistration"("expiresAt");

-- CreateIndex
CREATE INDEX "TenantRegistration_externalRef_idx" ON "TenantRegistration"("externalRef");

-- CreateIndex
CREATE INDEX "TenantRegistration_handoffTokenExpiresAt_idx" ON "TenantRegistration"("handoffTokenExpiresAt");
