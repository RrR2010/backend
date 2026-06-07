-- CreateEnum
CREATE TYPE "SystemState" AS ENUM ('ACTIVE', 'LOCKED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "UserScope" AS ENUM ('PLATFORM', 'TENANT');

-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "TenantRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "AuthProviderType" AS ENUM ('EMAIL', 'CPF');

-- CreateEnum
CREATE TYPE "OwnerType" AS ENUM ('MemberProfile', 'TenantSite');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('HOME', 'WORK', 'BILLING', 'SHIPPING');

-- CreateEnum
CREATE TYPE "PhoneType" AS ENUM ('MOBILE', 'HOME', 'WORK', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CPF', 'CNPJ', 'RG', 'PASSPORT');

-- CreateEnum
CREATE TYPE "TenantSiteType" AS ENUM ('FACTORY', 'WAREHOUSE', 'OFFICE');

-- CreateEnum
CREATE TYPE "RegistrationState" AS ENUM ('PENDING', 'APPROVED', 'PROVISIONING', 'PROVISIONED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "IngredientFunctionType" AS ENUM ('ADDITIVE', 'INGREDIENT');

-- CreateEnum
CREATE TYPE "TechnicalInfoSourceType" AS ENUM ('DATASHEET', 'IBGE', 'LAB_REPORT', 'INTERNET', 'REGULATORY_TABLE');

-- CreateEnum
CREATE TYPE "FlavorOriginType" AS ENUM ('NOT_APPLICABLE', 'NATURAL', 'IDENTICAL_TO_NATURAL', 'ARTIFICIAL', 'NO_FLAVOR');

-- CreateEnum
CREATE TYPE "ColorantOriginType" AS ENUM ('NOT_APPLICABLE', 'NATURAL', 'IDENTICAL_TO_NATURAL', 'SYNTHETIC', 'NO_COLORANT');

-- CreateEnum
CREATE TYPE "NutrientUnit" AS ENUM ('G', 'MG', 'MCG', 'KCAL');

-- CreateEnum
CREATE TYPE "NutrientCategory" AS ENUM ('MANDATORY_DECLARATION', 'SPECIFIC_CARBS', 'FATTY_ACIDS', 'MINERALS', 'FIBER', 'VITAMINS', 'OTHER');

-- CreateEnum
CREATE TYPE "AllergenRelationType" AS ENUM ('CONTAINS', 'MAY_CONTAIN');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LabelProfileStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'GRACE', 'PAUSED', 'CANCELED', 'EXPIRED');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "website" TEXT,
    "locale" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "logoUrl" TEXT,
    "settings" JSONB,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "scope" "UserScope" NOT NULL DEFAULT 'TENANT',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformMembership" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "userId" TEXT NOT NULL,
    "roles" "PlatformRole"[] DEFAULT ARRAY['USER']::"PlatformRole"[],

    CONSTRAINT "PlatformMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantMembership" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "roles" "TenantRole"[] DEFAULT ARRAY['USER']::"TenantRole"[],

    CONSTRAINT "TenantMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT,
    "refreshTokenHash" TEXT NOT NULL,
    "deviceInfo" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Identity" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "authProviderType" "AuthProviderType" NOT NULL,
    "identifier" TEXT NOT NULL,
    "secretHash" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Identity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "ownerId" TEXT NOT NULL,
    "ownerType" "OwnerType" NOT NULL,
    "type" "AddressType" NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "district" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'BR',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phone" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "ownerId" TEXT NOT NULL,
    "ownerType" "OwnerType" NOT NULL,
    "type" "PhoneType" NOT NULL,
    "countryCode" TEXT NOT NULL DEFAULT '55',
    "number" TEXT NOT NULL,
    "isWhatsapp" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Phone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberProfile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "externalId" TEXT,
    "fullName" TEXT NOT NULL,
    "displayName" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" "Gender",
    "photoUrl" TEXT,
    "locale" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "platformMembershipId" TEXT,
    "tenantMembershipId" TEXT,

    CONSTRAINT "MemberProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberProfileDocument" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "memberProfileId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "value" TEXT NOT NULL,
    "normalizedValue" TEXT NOT NULL,

    CONSTRAINT "MemberProfileDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "tenantId" TEXT,
    "entityName" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "action" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "description" TEXT,
    "tenant_impersonation_id" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantRegistration" (
    "id" TEXT NOT NULL,
    "externalRef" TEXT NOT NULL,
    "state" "RegistrationState" NOT NULL DEFAULT 'PENDING',
    "paymentId" TEXT,
    "subscriptionId" TEXT,
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
    "approvedAt" TIMESTAMP(3),
    "provisionedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "TenantRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantSite" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "externalId" TEXT,
    "taxId" TEXT NOT NULL,
    "siteType" "TenantSiteType" NOT NULL,
    "isHeadquarters" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TenantSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "basePrice" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "includedUsers" INTEGER NOT NULL,
    "additionalUserPrice" INTEGER,
    "maxProducts" INTEGER,
    "maxRevisions" INTEGER,
    "trialDays" INTEGER,
    "features" JSONB NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "allowsAdditionalUsers" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "provider" TEXT NOT NULL DEFAULT 'mercadopago',
    "providerSubscriptionId" TEXT NOT NULL,
    "providerPreapprovalId" TEXT,
    "providerCustomerId" TEXT,
    "basePriceSnapshot" INTEGER NOT NULL,
    "additionalUserPriceSnapshot" INTEGER,
    "includedUsersSnapshot" INTEGER NOT NULL,
    "additionalUsers" INTEGER NOT NULL DEFAULT 0,
    "currentAmount" INTEGER NOT NULL,
    "nextBillingAmount" INTEGER,
    "trialEndsAt" TIMESTAMP(3),
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "graceEndsAt" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "failedPaymentCount" INTEGER NOT NULL DEFAULT 0,
    "lastPaymentAt" TIMESTAMP(3),
    "lastWebhookAt" TIMESTAMP(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionEvent" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "providerEventId" TEXT,
    "providerEventType" TEXT NOT NULL,
    "statusBefore" TEXT,
    "statusAfter" TEXT,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductNutritionalInfo" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "productId" TEXT NOT NULL,
    "servingSize" DECIMAL(65,30),
    "data" JSONB,

    CONSTRAINT "ProductNutritionalInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabelProfile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "productId" TEXT NOT NULL,
    "status" "LabelProfileStatus" NOT NULL DEFAULT 'DRAFT',
    "designerData" JSONB,
    "gerencialData" JSONB,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "LabelProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulationVersion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "FormulationVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulationRevision" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "formulationVersionId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "notes" TEXT,
    "nutritionalSummary" JSONB,
    "complianceSummary" JSONB,

    CONSTRAINT "FormulationRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulationItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "formulationRevisionId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'g',

    CONSTRAINT "FormulationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaseAllergen" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "name" TEXT NOT NULL,
    "category" TEXT,
    "regulatoryRef" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BaseAllergen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaseNutrient" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "name" TEXT NOT NULL,
    "unit" "NutrientUnit" NOT NULL,
    "category" "NutrientCategory" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BaseNutrient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantAllergen" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "regulatoryRef" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TenantAllergen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantNutrient" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" "NutrientUnit" NOT NULL,
    "category" "NutrientCategory" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TenantNutrient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FunctionalGroup" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FunctionalGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "contactInfo" TEXT,
    "taxId" TEXT,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicalInfoSource" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "sourceType" "TechnicalInfoSourceType" NOT NULL,
    "referenceName" TEXT NOT NULL,
    "url" TEXT,
    "documentRef" TEXT,

    CONSTRAINT "TechnicalInfoSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "internalName" TEXT NOT NULL,
    "commercialName" TEXT,
    "saleDenomination" TEXT,
    "functionalGroupId" TEXT,
    "ingredientFunction" "IngredientFunctionType" NOT NULL,
    "notes" TEXT,
    "manufacturerId" TEXT,
    "supplierId" TEXT,
    "technicalSourceId" TEXT,
    "usageIndication" TEXT,
    "ingredientsListDesc" TEXT,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientTenantAllergen" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "allergenId" TEXT NOT NULL,
    "relationType" "AllergenRelationType" NOT NULL,

    CONSTRAINT "IngredientTenantAllergen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientTenantNutrient" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "nutrientId" TEXT NOT NULL,
    "value" DECIMAL(65,30),

    CONSTRAINT "IngredientTenantNutrient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientBaseAllergen" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "baseAllergenId" TEXT NOT NULL,
    "relationType" "AllergenRelationType" NOT NULL,

    CONSTRAINT "IngredientBaseAllergen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientBaseNutrient" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "baseNutrientId" TEXT NOT NULL,
    "value" DECIMAL(65,30),

    CONSTRAINT "IngredientBaseNutrient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientRegulatoryProfile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "hasRtiq" BOOLEAN NOT NULL DEFAULT false,
    "isGmo" BOOLEAN NOT NULL DEFAULT false,
    "gmoIngredient" TEXT,
    "gmoDonorSpecies" TEXT,
    "gmoPercentage" DECIMAL(65,30),
    "isIrradiated" BOOLEAN NOT NULL DEFAULT false,
    "irradiatedIngredient" TEXT,
    "containsLactose" BOOLEAN NOT NULL DEFAULT false,
    "containsGluten" BOOLEAN NOT NULL DEFAULT false,
    "containsAspartame" BOOLEAN NOT NULL DEFAULT false,
    "flavorOriginType" "FlavorOriginType",
    "colorantOriginType" "ColorantOriginType",

    CONSTRAINT "IngredientRegulatoryProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientLabelingProfile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "containsAddedSugars" BOOLEAN NOT NULL DEFAULT false,
    "containsIngredientWithAddedSugars" BOOLEAN NOT NULL DEFAULT false,
    "containsNaturallyOccurringSugarSubstitutes" BOOLEAN NOT NULL DEFAULT false,
    "usesProcessingThatIncreasesSugars" BOOLEAN NOT NULL DEFAULT false,
    "containsAddedFatsOrOils" BOOLEAN NOT NULL DEFAULT false,
    "containsButterOrMargarine" BOOLEAN NOT NULL DEFAULT false,
    "containsDairyCream" BOOLEAN NOT NULL DEFAULT false,
    "containsIngredientsWithFatsOrCream" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "IngredientLabelingProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientTechnicalProfile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "pac" DECIMAL(65,30),
    "pod" DECIMAL(65,30),
    "totalSolids" DECIMAL(65,30),
    "ashContent" DECIMAL(65,30),

    CONSTRAINT "IngredientTechnicalProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_id_key" ON "Tenant"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_website_key" ON "Tenant"("website");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformMembership_id_key" ON "PlatformMembership"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformMembership_userId_key" ON "PlatformMembership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantMembership_id_key" ON "TenantMembership"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TenantMembership_userId_tenantId_key" ON "TenantMembership"("userId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_id_key" ON "Session"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshTokenHash_key" ON "Session"("refreshTokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Session_refreshTokenHash_idx" ON "Session"("refreshTokenHash");

-- CreateIndex
CREATE INDEX "Identity_identifier_idx" ON "Identity"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Identity_authProviderType_identifier_key" ON "Identity"("authProviderType", "identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Address_id_key" ON "Address"("id");

-- CreateIndex
CREATE INDEX "Address_ownerId_ownerType_idx" ON "Address"("ownerId", "ownerType");

-- CreateIndex
CREATE UNIQUE INDEX "Address_ownerId_ownerType_type_key" ON "Address"("ownerId", "ownerType", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Phone_id_key" ON "Phone"("id");

-- CreateIndex
CREATE INDEX "Phone_ownerId_ownerType_idx" ON "Phone"("ownerId", "ownerType");

-- CreateIndex
CREATE UNIQUE INDEX "Phone_ownerId_ownerType_type_key" ON "Phone"("ownerId", "ownerType", "type");

-- CreateIndex
CREATE UNIQUE INDEX "MemberProfile_id_key" ON "MemberProfile"("id");

-- CreateIndex
CREATE UNIQUE INDEX "MemberProfile_platformMembershipId_key" ON "MemberProfile"("platformMembershipId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberProfile_tenantMembershipId_key" ON "MemberProfile"("tenantMembershipId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberProfileDocument_id_key" ON "MemberProfileDocument"("id");

-- CreateIndex
CREATE UNIQUE INDEX "MemberProfileDocument_memberProfileId_type_key" ON "MemberProfileDocument"("memberProfileId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "AuditLog_id_key" ON "AuditLog"("id");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_idx" ON "AuditLog"("tenantId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entityName_idx" ON "AuditLog"("entityName");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TenantRegistration_externalRef_key" ON "TenantRegistration"("externalRef");

-- CreateIndex
CREATE UNIQUE INDEX "TenantRegistration_paymentId_key" ON "TenantRegistration"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantRegistration_subscriptionId_key" ON "TenantRegistration"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantRegistration_handoffTokenHash_key" ON "TenantRegistration"("handoffTokenHash");

-- CreateIndex
CREATE INDEX "TenantRegistration_state_idx" ON "TenantRegistration"("state");

-- CreateIndex
CREATE INDEX "TenantRegistration_expiresAt_idx" ON "TenantRegistration"("expiresAt");

-- CreateIndex
CREATE INDEX "TenantRegistration_handoffTokenExpiresAt_idx" ON "TenantRegistration"("handoffTokenExpiresAt");

-- CreateIndex
CREATE INDEX "TenantRegistration_subscriptionId_idx" ON "TenantRegistration"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantSite_id_key" ON "TenantSite"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TenantSite_taxId_key" ON "TenantSite"("taxId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantSite_tenantId_taxId_key" ON "TenantSite"("tenantId", "taxId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_type_key" ON "Plan"("type");

-- CreateIndex
CREATE INDEX "Plan_type_idx" ON "Plan"("type");

-- CreateIndex
CREATE INDEX "Plan_isPublic_idx" ON "Plan"("isPublic");

-- CreateIndex
CREATE INDEX "Plan_isActive_idx" ON "Plan"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_tenantId_key" ON "Subscription"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_providerSubscriptionId_key" ON "Subscription"("providerSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_providerPreapprovalId_key" ON "Subscription"("providerPreapprovalId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_planType_idx" ON "Subscription"("planType");

-- CreateIndex
CREATE INDEX "Subscription_currentPeriodEnd_idx" ON "Subscription"("currentPeriodEnd");

-- CreateIndex
CREATE INDEX "Subscription_graceEndsAt_idx" ON "Subscription"("graceEndsAt");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionEvent_providerEventId_key" ON "SubscriptionEvent"("providerEventId");

-- CreateIndex
CREATE INDEX "SubscriptionEvent_subscriptionId_idx" ON "SubscriptionEvent"("subscriptionId");

-- CreateIndex
CREATE INDEX "SubscriptionEvent_providerEventType_idx" ON "SubscriptionEvent"("providerEventType");

-- CreateIndex
CREATE INDEX "SubscriptionEvent_createdAt_idx" ON "SubscriptionEvent"("createdAt");

-- CreateIndex
CREATE INDEX "Product_tenantId_idx" ON "Product"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_tenantId_code_key" ON "Product"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "ProductNutritionalInfo_productId_key" ON "ProductNutritionalInfo"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "LabelProfile_productId_key" ON "LabelProfile"("productId");

-- CreateIndex
CREATE INDEX "FormulationVersion_tenantId_idx" ON "FormulationVersion"("tenantId");

-- CreateIndex
CREATE INDEX "FormulationVersion_productId_idx" ON "FormulationVersion"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "FormulationVersion_productId_version_key" ON "FormulationVersion"("productId", "version");

-- CreateIndex
CREATE INDEX "FormulationRevision_formulationVersionId_idx" ON "FormulationRevision"("formulationVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "FormulationRevision_formulationVersionId_revision_key" ON "FormulationRevision"("formulationVersionId", "revision");

-- CreateIndex
CREATE INDEX "FormulationItem_formulationRevisionId_idx" ON "FormulationItem"("formulationRevisionId");

-- CreateIndex
CREATE INDEX "FormulationItem_ingredientId_idx" ON "FormulationItem"("ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "BaseAllergen_id_key" ON "BaseAllergen"("id");

-- CreateIndex
CREATE UNIQUE INDEX "BaseAllergen_name_key" ON "BaseAllergen"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BaseNutrient_id_key" ON "BaseNutrient"("id");

-- CreateIndex
CREATE UNIQUE INDEX "BaseNutrient_name_key" ON "BaseNutrient"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TenantAllergen_id_key" ON "TenantAllergen"("id");

-- CreateIndex
CREATE INDEX "TenantAllergen_tenantId_idx" ON "TenantAllergen"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantAllergen_tenantId_name_key" ON "TenantAllergen"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "TenantNutrient_id_key" ON "TenantNutrient"("id");

-- CreateIndex
CREATE INDEX "TenantNutrient_tenantId_idx" ON "TenantNutrient"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantNutrient_tenantId_name_key" ON "TenantNutrient"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "FunctionalGroup_id_key" ON "FunctionalGroup"("id");

-- CreateIndex
CREATE INDEX "FunctionalGroup_tenantId_idx" ON "FunctionalGroup"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "FunctionalGroup_tenantId_name_key" ON "FunctionalGroup"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Company_id_key" ON "Company"("id");

-- CreateIndex
CREATE INDEX "Company_tenantId_idx" ON "Company"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_tenantId_taxId_key" ON "Company"("tenantId", "taxId");

-- CreateIndex
CREATE UNIQUE INDEX "TechnicalInfoSource_id_key" ON "TechnicalInfoSource"("id");

-- CreateIndex
CREATE INDEX "TechnicalInfoSource_tenantId_idx" ON "TechnicalInfoSource"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_id_key" ON "Ingredient"("id");

-- CreateIndex
CREATE INDEX "Ingredient_tenantId_idx" ON "Ingredient"("tenantId");

-- CreateIndex
CREATE INDEX "Ingredient_functionalGroupId_idx" ON "Ingredient"("functionalGroupId");

-- CreateIndex
CREATE INDEX "Ingredient_manufacturerId_idx" ON "Ingredient"("manufacturerId");

-- CreateIndex
CREATE INDEX "Ingredient_supplierId_idx" ON "Ingredient"("supplierId");

-- CreateIndex
CREATE INDEX "Ingredient_technicalSourceId_idx" ON "Ingredient"("technicalSourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_tenantId_code_key" ON "Ingredient"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientTenantAllergen_id_key" ON "IngredientTenantAllergen"("id");

-- CreateIndex
CREATE INDEX "IngredientTenantAllergen_tenantId_idx" ON "IngredientTenantAllergen"("tenantId");

-- CreateIndex
CREATE INDEX "IngredientTenantAllergen_ingredientId_idx" ON "IngredientTenantAllergen"("ingredientId");

-- CreateIndex
CREATE INDEX "IngredientTenantAllergen_allergenId_idx" ON "IngredientTenantAllergen"("allergenId");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientTenantAllergen_tenantId_ingredientId_allergenId_r_key" ON "IngredientTenantAllergen"("tenantId", "ingredientId", "allergenId", "relationType");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientTenantNutrient_id_key" ON "IngredientTenantNutrient"("id");

-- CreateIndex
CREATE INDEX "IngredientTenantNutrient_tenantId_idx" ON "IngredientTenantNutrient"("tenantId");

-- CreateIndex
CREATE INDEX "IngredientTenantNutrient_ingredientId_idx" ON "IngredientTenantNutrient"("ingredientId");

-- CreateIndex
CREATE INDEX "IngredientTenantNutrient_nutrientId_idx" ON "IngredientTenantNutrient"("nutrientId");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientTenantNutrient_tenantId_ingredientId_nutrientId_key" ON "IngredientTenantNutrient"("tenantId", "ingredientId", "nutrientId");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientBaseAllergen_id_key" ON "IngredientBaseAllergen"("id");

-- CreateIndex
CREATE INDEX "IngredientBaseAllergen_tenantId_idx" ON "IngredientBaseAllergen"("tenantId");

-- CreateIndex
CREATE INDEX "IngredientBaseAllergen_ingredientId_idx" ON "IngredientBaseAllergen"("ingredientId");

-- CreateIndex
CREATE INDEX "IngredientBaseAllergen_baseAllergenId_idx" ON "IngredientBaseAllergen"("baseAllergenId");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientBaseAllergen_tenantId_ingredientId_baseAllergenId_key" ON "IngredientBaseAllergen"("tenantId", "ingredientId", "baseAllergenId");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientBaseNutrient_id_key" ON "IngredientBaseNutrient"("id");

-- CreateIndex
CREATE INDEX "IngredientBaseNutrient_tenantId_idx" ON "IngredientBaseNutrient"("tenantId");

-- CreateIndex
CREATE INDEX "IngredientBaseNutrient_ingredientId_idx" ON "IngredientBaseNutrient"("ingredientId");

-- CreateIndex
CREATE INDEX "IngredientBaseNutrient_baseNutrientId_idx" ON "IngredientBaseNutrient"("baseNutrientId");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientBaseNutrient_tenantId_ingredientId_baseNutrientId_key" ON "IngredientBaseNutrient"("tenantId", "ingredientId", "baseNutrientId");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientRegulatoryProfile_id_key" ON "IngredientRegulatoryProfile"("id");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientRegulatoryProfile_ingredientId_key" ON "IngredientRegulatoryProfile"("ingredientId");

-- CreateIndex
CREATE INDEX "IngredientRegulatoryProfile_tenantId_idx" ON "IngredientRegulatoryProfile"("tenantId");

-- CreateIndex
CREATE INDEX "IngredientRegulatoryProfile_ingredientId_idx" ON "IngredientRegulatoryProfile"("ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientLabelingProfile_id_key" ON "IngredientLabelingProfile"("id");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientLabelingProfile_ingredientId_key" ON "IngredientLabelingProfile"("ingredientId");

-- CreateIndex
CREATE INDEX "IngredientLabelingProfile_tenantId_idx" ON "IngredientLabelingProfile"("tenantId");

-- CreateIndex
CREATE INDEX "IngredientLabelingProfile_ingredientId_idx" ON "IngredientLabelingProfile"("ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientTechnicalProfile_id_key" ON "IngredientTechnicalProfile"("id");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientTechnicalProfile_ingredientId_key" ON "IngredientTechnicalProfile"("ingredientId");

-- CreateIndex
CREATE INDEX "IngredientTechnicalProfile_tenantId_idx" ON "IngredientTechnicalProfile"("tenantId");

-- CreateIndex
CREATE INDEX "IngredientTechnicalProfile_ingredientId_idx" ON "IngredientTechnicalProfile"("ingredientId");

-- AddForeignKey
ALTER TABLE "PlatformMembership" ADD CONSTRAINT "PlatformMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantMembership" ADD CONSTRAINT "TenantMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantMembership" ADD CONSTRAINT "TenantMembership_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Identity" ADD CONSTRAINT "Identity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberProfile" ADD CONSTRAINT "MemberProfile_platformMembershipId_fkey" FOREIGN KEY ("platformMembershipId") REFERENCES "PlatformMembership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberProfile" ADD CONSTRAINT "MemberProfile_tenantMembershipId_fkey" FOREIGN KEY ("tenantMembershipId") REFERENCES "TenantMembership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberProfileDocument" ADD CONSTRAINT "MemberProfileDocument_memberProfileId_fkey" FOREIGN KEY ("memberProfileId") REFERENCES "MemberProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSite" ADD CONSTRAINT "TenantSite_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionEvent" ADD CONSTRAINT "SubscriptionEvent_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductNutritionalInfo" ADD CONSTRAINT "ProductNutritionalInfo_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabelProfile" ADD CONSTRAINT "LabelProfile_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationVersion" ADD CONSTRAINT "FormulationVersion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationVersion" ADD CONSTRAINT "FormulationVersion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationRevision" ADD CONSTRAINT "FormulationRevision_formulationVersionId_fkey" FOREIGN KEY ("formulationVersionId") REFERENCES "FormulationVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationItem" ADD CONSTRAINT "FormulationItem_formulationRevisionId_fkey" FOREIGN KEY ("formulationRevisionId") REFERENCES "FormulationRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationItem" ADD CONSTRAINT "FormulationItem_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantAllergen" ADD CONSTRAINT "TenantAllergen_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantNutrient" ADD CONSTRAINT "TenantNutrient_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FunctionalGroup" ADD CONSTRAINT "FunctionalGroup_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicalInfoSource" ADD CONSTRAINT "TechnicalInfoSource_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_functionalGroupId_fkey" FOREIGN KEY ("functionalGroupId") REFERENCES "FunctionalGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_technicalSourceId_fkey" FOREIGN KEY ("technicalSourceId") REFERENCES "TechnicalInfoSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientTenantAllergen" ADD CONSTRAINT "IngredientTenantAllergen_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientTenantAllergen" ADD CONSTRAINT "IngredientTenantAllergen_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientTenantAllergen" ADD CONSTRAINT "IngredientTenantAllergen_allergenId_fkey" FOREIGN KEY ("allergenId") REFERENCES "TenantAllergen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientTenantNutrient" ADD CONSTRAINT "IngredientTenantNutrient_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientTenantNutrient" ADD CONSTRAINT "IngredientTenantNutrient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientTenantNutrient" ADD CONSTRAINT "IngredientTenantNutrient_nutrientId_fkey" FOREIGN KEY ("nutrientId") REFERENCES "TenantNutrient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientBaseAllergen" ADD CONSTRAINT "IngredientBaseAllergen_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientBaseAllergen" ADD CONSTRAINT "IngredientBaseAllergen_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientBaseAllergen" ADD CONSTRAINT "IngredientBaseAllergen_baseAllergenId_fkey" FOREIGN KEY ("baseAllergenId") REFERENCES "BaseAllergen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientBaseNutrient" ADD CONSTRAINT "IngredientBaseNutrient_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientBaseNutrient" ADD CONSTRAINT "IngredientBaseNutrient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientBaseNutrient" ADD CONSTRAINT "IngredientBaseNutrient_baseNutrientId_fkey" FOREIGN KEY ("baseNutrientId") REFERENCES "BaseNutrient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientRegulatoryProfile" ADD CONSTRAINT "IngredientRegulatoryProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientRegulatoryProfile" ADD CONSTRAINT "IngredientRegulatoryProfile_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientLabelingProfile" ADD CONSTRAINT "IngredientLabelingProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientLabelingProfile" ADD CONSTRAINT "IngredientLabelingProfile_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientTechnicalProfile" ADD CONSTRAINT "IngredientTechnicalProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientTechnicalProfile" ADD CONSTRAINT "IngredientTechnicalProfile_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
