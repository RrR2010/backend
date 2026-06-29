-- CreateEnum
CREATE TYPE "SystemState" AS ENUM ('ACTIVE', 'LOCKED', 'DELETED');

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
CREATE TYPE "FlavorOriginType" AS ENUM ('NOT_APPLICABLE', 'NATURAL', 'IDENTICAL_TO_NATURAL', 'ARTIFICIAL', 'NO_FLAVOR');

-- CreateEnum
CREATE TYPE "ColorantOriginType" AS ENUM ('NOT_APPLICABLE', 'NATURAL', 'IDENTICAL_TO_NATURAL', 'SYNTHETIC', 'NO_COLORANT');

-- CreateEnum
CREATE TYPE "NutrientUnit" AS ENUM ('G', 'MG', 'MCG', 'KCAL');

-- CreateEnum
CREATE TYPE "NutrientCategory" AS ENUM ('MANDATORY_DECLARATION', 'SPECIFIC_CARBS', 'FATTY_ACIDS', 'MINERALS', 'FIBER', 'VITAMINS', 'OTHER');

-- CreateEnum
CREATE TYPE "FormulationRevisionStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'HISTORIC');

-- CreateEnum
CREATE TYPE "ProductPanelType" AS ENUM ('MAIN', 'SECONDARY');

-- CreateEnum
CREATE TYPE "MeasurementType" AS ENUM ('MASS', 'VOLUME', 'LENGTH', 'TIME', 'TEMPERATURE', 'UNITY', 'RATIO', 'ENERGY');

-- CreateEnum
CREATE TYPE "MeasurementSystem" AS ENUM ('METRIC', 'IMPERIAL', 'US_CUSTOMARY');

-- CreateEnum
CREATE TYPE "DeclarationFlagScope" AS ENUM ('INGREDIENT', 'FORMULATION', 'BOTH');

-- CreateEnum
CREATE TYPE "AllergenRelationType" AS ENUM ('CONTAINS', 'MAY_CONTAIN');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'GRACE', 'PAUSED', 'CANCELED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('COMPLETED', 'SCHEDULED', 'CANCELED', 'FAILED');

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
    "providerCustomerId" TEXT,

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
    "tenantId" TEXT NOT NULL DEFAULT 'MIGRATION_PLACEHOLDER',
    "type" "AddressType" NOT NULL,
    "streetType" TEXT,
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
    "tenantId" TEXT NOT NULL DEFAULT 'MIGRATION_PLACEHOLDER',
    "type" "PhoneType" NOT NULL,
    "countryCode" TEXT NOT NULL DEFAULT '55',
    "number" TEXT NOT NULL,
    "extension" TEXT,
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
    "providerCustomerId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "handoffTokenHash" TEXT,
    "handoffTokenExpiresAt" TIMESTAMP(3),
    "handoffTokenUsedAt" TIMESTAMP(3),
    "tenantData" JSONB NOT NULL,
    "tenantSiteData" JSONB NOT NULL,
    "userData" JSONB NOT NULL,
    "identityData" JSONB NOT NULL,
    "profileData" JSONB NOT NULL,
    "addressData" JSONB,
    "phoneData" JSONB,
    "provisionedUserId" TEXT,
    "provisionedTenantId" TEXT,
    "provisionedMembershipId" TEXT,
    "provisionedProfileId" TEXT,
    "provisionedIdentityId" TEXT,
    "provisionedTenantSiteId" TEXT,
    "provisionedAddressId" TEXT,
    "provisionedPhoneId" TEXT,
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
    "provider" TEXT NOT NULL DEFAULT 'free',
    "providerSubscriptionId" TEXT NOT NULL,
    "providerCustomerId" TEXT,
    "basePriceSnapshot" INTEGER NOT NULL,
    "additionalUserPriceSnapshot" INTEGER,
    "includedUsersSnapshot" INTEGER NOT NULL,
    "additionalUsers" INTEGER NOT NULL DEFAULT 0,
    "currentAmount" INTEGER NOT NULL,
    "nextBillingAmount" INTEGER,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "graceEndsAt" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "pendingPlanType" TEXT,
    "pendingEffectiveFrom" TIMESTAMP(3),
    "pendingNewAmount" INTEGER,
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
    "actionStatus" "ActionStatus" NOT NULL DEFAULT 'COMPLETED',
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
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "internalName" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "externalCode" TEXT,
    "displayName" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "commercialName" TEXT,
    "saleDenomination" TEXT,
    "productType" TEXT,
    "barcodeGtin" TEXT,
    "notes" TEXT,
    "packagingType" TEXT,
    "batchCode" TEXT,
    "shelfLifeDays" INTEGER,
    "storageConditions" TEXT,
    "declaredWeight" DECIMAL(12,6),
    "declaredVolume" DECIMAL(12,6),
    "productFamilyId" TEXT,
    "commercialLineId" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductLabelField_TE" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "labelFieldId" TEXT NOT NULL,
    "designerValue" TEXT,
    "gerencialValue" TEXT,

    CONSTRAINT "ProductLabelField_TE_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductPanel_TE" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "panelNumber" INTEGER NOT NULL,
    "type" "ProductPanelType" NOT NULL,
    "geometricFormatTypeId" TEXT,
    "geometricFormatValues" JSONB,

    CONSTRAINT "ProductPanel_TE_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductNutrientOverride_TE" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "nutrientId" TEXT NOT NULL,
    "overriddenValue" DECIMAL(12,6) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "ProductNutrientOverride_TE_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductClaim_TE" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductClaim_TE_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulationVersion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
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
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "formulationVersionId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "status" "FormulationRevisionStatus" NOT NULL DEFAULT 'DRAFT',
    "approverId" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "drift" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "FormulationRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulationItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
    "formulationRevisionId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "quantity" DECIMAL(12,6) NOT NULL,
    "unitId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "usageCategory" TEXT,
    "componentGroup" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "FormulationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulationRegulatoryDeclaration_TE" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "formulationRevisionId" TEXT NOT NULL,
    "flagId" TEXT NOT NULL,
    "flagValue" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,

    CONSTRAINT "FormulationRegulatoryDeclaration_TE_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulationAllergen_TE" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "formulationRevisionId" TEXT NOT NULL,
    "allergenDeclaration" TEXT,
    "allergenMayContain" TEXT,

    CONSTRAINT "FormulationAllergen_TE_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulationNutrition_TE" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "formulationRevisionId" TEXT NOT NULL,
    "nutrientId" TEXT NOT NULL,
    "declaredValue" DECIMAL(12,6),
    "calculatedValue" DECIMAL(12,6),
    "refValue" DECIMAL(12,6),
    "notes" TEXT,

    CONSTRAINT "FormulationNutrition_TE_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulationOgmDonor_TE" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "formulationRevisionId" TEXT NOT NULL,
    "ogmDonorSpeciesId" TEXT NOT NULL,

    CONSTRAINT "FormulationOgmDonor_TE_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaseAllergen" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
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
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "name" TEXT NOT NULL,
    "unit" "NutrientUnit" NOT NULL,
    "category" "NutrientCategory" NOT NULL,
    "parentId" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "regulatoryRef" TEXT,

    CONSTRAINT "BaseNutrient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OgmDonorSpecies_PL" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "scientificName" TEXT NOT NULL,
    "commonName" TEXT,
    "category" TEXT,

    CONSTRAINT "OgmDonorSpecies_PL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitOfMeasure_PL" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "code" TEXT NOT NULL,
    "symbol" TEXT,
    "measurementType" "MeasurementType" NOT NULL,
    "measurementSystem" "MeasurementSystem" NOT NULL,

    CONSTRAINT "UnitOfMeasure_PL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitConversion_PL" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "fromUnitId" TEXT NOT NULL,
    "toUnitId" TEXT NOT NULL,
    "factor" DECIMAL(12,6) NOT NULL,

    CONSTRAINT "UnitConversion_PL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeclarationFlag_PL" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "appliesTo" "DeclarationFlagScope" NOT NULL DEFAULT 'BOTH',

    CONSTRAINT "DeclarationFlag_PL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabelField_PL" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "fieldName" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LabelField_PL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicalSourceType_PL" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "TechnicalSourceType_PL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory_PL" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sequentialNumber" INTEGER NOT NULL,

    CONSTRAINT "ProductCategory_PL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSubcategory_PL" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "categoryId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sequentialNumber" INTEGER NOT NULL,

    CONSTRAINT "ProductSubcategory_PL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PanelGeometricFormatType_PL" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "formatName" TEXT NOT NULL,
    "valueFields" JSONB,
    "calculationFormula" TEXT,

    CONSTRAINT "PanelGeometricFormatType_PL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegulatoryBody_PL" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "abbreviation" TEXT,

    CONSTRAINT "RegulatoryBody_PL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegulationType_PL" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "abbreviation" TEXT NOT NULL,

    CONSTRAINT "RegulationType_PL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Regulation_PL" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "number" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "title" TEXT,
    "regulatoryBodyId" TEXT NOT NULL,
    "regulationTypeId" TEXT NOT NULL,
    "publishedAt" TIMESTAMPTZ(3),

    CONSTRAINT "Regulation_PL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceRule_PL" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "ruleType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "condition" JSONB,
    "severity" TEXT NOT NULL DEFAULT 'ERROR',
    "regulationId" TEXT NOT NULL,
    "nutrientId" TEXT,

    CONSTRAINT "ComplianceRule_PL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim_TE" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Claim_TE_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductFamily_TE" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ProductFamily_TE_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommercialLine_TE" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "CommercialLine_TE_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicalSourceType_TE" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "TechnicalSourceType_TE_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FunctionalGroup" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
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
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
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
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "sourceTypePlId" TEXT,
    "sourceTypeTeId" TEXT,
    "referenceName" TEXT NOT NULL,
    "url" TEXT,
    "documentRef" TEXT,
    "notes" TEXT,

    CONSTRAINT "TechnicalInfoSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "internalName" TEXT NOT NULL,
    "externalCode" TEXT,
    "commercialName" TEXT,
    "saleDenomination" TEXT,
    "ingredientFunction" "IngredientFunctionType" NOT NULL,
    "notes" TEXT,
    "usageIndication" TEXT,
    "ingredientsListDesc" TEXT,
    "functionalGroupId" TEXT,
    "manufacturerId" TEXT,
    "supplierId" TEXT,
    "technicalSourceId" TEXT,
    "hasRtiqPiq" BOOLEAN NOT NULL DEFAULT false,
    "gmoIngredient" TEXT,
    "gmoDonorSpecies" TEXT,
    "gmoPercentage" DECIMAL(12,6),
    "irradiatedIngredient" TEXT,
    "flavorOriginType" "FlavorOriginType",
    "colorantOriginType" "ColorantOriginType",
    "containsAddedSugars" BOOLEAN NOT NULL DEFAULT false,
    "containsIngredientWithAddedSugars" BOOLEAN NOT NULL DEFAULT false,
    "containsNaturallyOccurringSugarSubstitutes" BOOLEAN NOT NULL DEFAULT false,
    "usesProcessingThatIncreasesSugars" BOOLEAN NOT NULL DEFAULT false,
    "containsAddedFatsOrOils" BOOLEAN NOT NULL DEFAULT false,
    "containsButterOrMargarine" BOOLEAN NOT NULL DEFAULT false,
    "containsDairyCream" BOOLEAN NOT NULL DEFAULT false,
    "containsIngredientsWithFatsOrCream" BOOLEAN NOT NULL DEFAULT false,
    "pac" DECIMAL(12,6),
    "pod" DECIMAL(12,6),
    "totalSolids" DECIMAL(12,6),
    "ashContent" DECIMAL(12,6),

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientTenantAllergen" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
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
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
    "tenantId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "nutrientId" TEXT NOT NULL,
    "value" DECIMAL(12,6),
    "sourceId" TEXT,

    CONSTRAINT "IngredientTenantNutrient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientFlag_TE" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "flagId" TEXT NOT NULL,
    "flagValue" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,

    CONSTRAINT "IngredientFlag_TE_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientCost_TE" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,
    "systemState" "SystemState" NOT NULL DEFAULT 'ACTIVE',
    "tenantId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "supplierId" TEXT,
    "unitPrice" DECIMAL(12,6) NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "unitOfMeasureId" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "IngredientCost_TE_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "Address_tenantId_idx" ON "Address"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_ownerId_ownerType_type_key" ON "Address"("ownerId", "ownerType", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Phone_id_key" ON "Phone"("id");

-- CreateIndex
CREATE INDEX "Phone_ownerId_ownerType_idx" ON "Phone"("ownerId", "ownerType");

-- CreateIndex
CREATE INDEX "Phone_tenantId_idx" ON "Phone"("tenantId");

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
CREATE INDEX "Product_tenantId_externalCode_idx" ON "Product"("tenantId", "externalCode");

-- CreateIndex
CREATE INDEX "Product_tenantId_idx" ON "Product"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_tenantId_code_key" ON "Product"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Product_tenantId_internalName_key" ON "Product"("tenantId", "internalName");

-- CreateIndex
CREATE INDEX "ProductLabelField_TE_tenantId_idx" ON "ProductLabelField_TE"("tenantId");

-- CreateIndex
CREATE INDEX "ProductLabelField_TE_labelFieldId_idx" ON "ProductLabelField_TE"("labelFieldId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductLabelField_TE_productId_labelFieldId_key" ON "ProductLabelField_TE"("productId", "labelFieldId");

-- CreateIndex
CREATE INDEX "ProductPanel_TE_tenantId_idx" ON "ProductPanel_TE"("tenantId");

-- CreateIndex
CREATE INDEX "ProductPanel_TE_productId_idx" ON "ProductPanel_TE"("productId");

-- CreateIndex
CREATE INDEX "ProductNutrientOverride_TE_tenantId_idx" ON "ProductNutrientOverride_TE"("tenantId");

-- CreateIndex
CREATE INDEX "ProductNutrientOverride_TE_nutrientId_idx" ON "ProductNutrientOverride_TE"("nutrientId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductNutrientOverride_TE_productId_nutrientId_key" ON "ProductNutrientOverride_TE"("productId", "nutrientId");

-- CreateIndex
CREATE INDEX "ProductClaim_TE_tenantId_idx" ON "ProductClaim_TE"("tenantId");

-- CreateIndex
CREATE INDEX "ProductClaim_TE_claimId_idx" ON "ProductClaim_TE"("claimId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductClaim_TE_productId_claimId_key" ON "ProductClaim_TE"("productId", "claimId");

-- CreateIndex
CREATE INDEX "FormulationVersion_tenantId_idx" ON "FormulationVersion"("tenantId");

-- CreateIndex
CREATE INDEX "FormulationVersion_productId_idx" ON "FormulationVersion"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "FormulationVersion_productId_version_key" ON "FormulationVersion"("productId", "version");

-- CreateIndex
CREATE INDEX "FormulationRevision_tenantId_idx" ON "FormulationRevision"("tenantId");

-- CreateIndex
CREATE INDEX "FormulationRevision_formulationVersionId_idx" ON "FormulationRevision"("formulationVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "FormulationRevision_formulationVersionId_revision_key" ON "FormulationRevision"("formulationVersionId", "revision");

-- CreateIndex
CREATE INDEX "FormulationItem_tenantId_idx" ON "FormulationItem"("tenantId");

-- CreateIndex
CREATE INDEX "FormulationItem_formulationRevisionId_idx" ON "FormulationItem"("formulationRevisionId");

-- CreateIndex
CREATE INDEX "FormulationItem_ingredientId_idx" ON "FormulationItem"("ingredientId");

-- CreateIndex
CREATE INDEX "FormulationRegulatoryDeclaration_TE_tenantId_idx" ON "FormulationRegulatoryDeclaration_TE"("tenantId");

-- CreateIndex
CREATE INDEX "FormulationRegulatoryDeclaration_TE_formulationRevisionId_idx" ON "FormulationRegulatoryDeclaration_TE"("formulationRevisionId");

-- CreateIndex
CREATE UNIQUE INDEX "FormulationRegulatoryDeclaration_TE_formulationRevisionId_f_key" ON "FormulationRegulatoryDeclaration_TE"("formulationRevisionId", "flagId");

-- CreateIndex
CREATE UNIQUE INDEX "FormulationAllergen_TE_formulationRevisionId_key" ON "FormulationAllergen_TE"("formulationRevisionId");

-- CreateIndex
CREATE INDEX "FormulationAllergen_TE_tenantId_idx" ON "FormulationAllergen_TE"("tenantId");

-- CreateIndex
CREATE INDEX "FormulationNutrition_TE_tenantId_idx" ON "FormulationNutrition_TE"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "FormulationNutrition_TE_formulationRevisionId_nutrientId_key" ON "FormulationNutrition_TE"("formulationRevisionId", "nutrientId");

-- CreateIndex
CREATE INDEX "FormulationOgmDonor_TE_tenantId_idx" ON "FormulationOgmDonor_TE"("tenantId");

-- CreateIndex
CREATE INDEX "FormulationOgmDonor_TE_ogmDonorSpeciesId_idx" ON "FormulationOgmDonor_TE"("ogmDonorSpeciesId");

-- CreateIndex
CREATE UNIQUE INDEX "FormulationOgmDonor_TE_formulationRevisionId_ogmDonorSpecie_key" ON "FormulationOgmDonor_TE"("formulationRevisionId", "ogmDonorSpeciesId");

-- CreateIndex
CREATE UNIQUE INDEX "BaseAllergen_id_key" ON "BaseAllergen"("id");

-- CreateIndex
CREATE UNIQUE INDEX "BaseAllergen_name_key" ON "BaseAllergen"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BaseNutrient_id_key" ON "BaseNutrient"("id");

-- CreateIndex
CREATE UNIQUE INDEX "BaseNutrient_name_key" ON "BaseNutrient"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OgmDonorSpecies_PL_id_key" ON "OgmDonorSpecies_PL"("id");

-- CreateIndex
CREATE UNIQUE INDEX "OgmDonorSpecies_PL_scientificName_key" ON "OgmDonorSpecies_PL"("scientificName");

-- CreateIndex
CREATE UNIQUE INDEX "UnitOfMeasure_PL_id_key" ON "UnitOfMeasure_PL"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UnitOfMeasure_PL_code_key" ON "UnitOfMeasure_PL"("code");

-- CreateIndex
CREATE INDEX "UnitOfMeasure_PL_code_idx" ON "UnitOfMeasure_PL"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UnitConversion_PL_id_key" ON "UnitConversion_PL"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UnitConversion_PL_fromUnitId_toUnitId_key" ON "UnitConversion_PL"("fromUnitId", "toUnitId");

-- CreateIndex
CREATE UNIQUE INDEX "DeclarationFlag_PL_id_key" ON "DeclarationFlag_PL"("id");

-- CreateIndex
CREATE UNIQUE INDEX "DeclarationFlag_PL_code_key" ON "DeclarationFlag_PL"("code");

-- CreateIndex
CREATE INDEX "DeclarationFlag_PL_code_idx" ON "DeclarationFlag_PL"("code");

-- CreateIndex
CREATE UNIQUE INDEX "LabelField_PL_id_key" ON "LabelField_PL"("id");

-- CreateIndex
CREATE UNIQUE INDEX "LabelField_PL_fieldName_key" ON "LabelField_PL"("fieldName");

-- CreateIndex
CREATE INDEX "LabelField_PL_fieldName_idx" ON "LabelField_PL"("fieldName");

-- CreateIndex
CREATE UNIQUE INDEX "TechnicalSourceType_PL_id_key" ON "TechnicalSourceType_PL"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TechnicalSourceType_PL_code_key" ON "TechnicalSourceType_PL"("code");

-- CreateIndex
CREATE INDEX "TechnicalSourceType_PL_code_idx" ON "TechnicalSourceType_PL"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_PL_id_key" ON "ProductCategory_PL"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_PL_code_key" ON "ProductCategory_PL"("code");

-- CreateIndex
CREATE INDEX "ProductCategory_PL_code_idx" ON "ProductCategory_PL"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSubcategory_PL_id_key" ON "ProductSubcategory_PL"("id");

-- CreateIndex
CREATE INDEX "ProductSubcategory_PL_categoryId_idx" ON "ProductSubcategory_PL"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSubcategory_PL_categoryId_sequentialNumber_key" ON "ProductSubcategory_PL"("categoryId", "sequentialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PanelGeometricFormatType_PL_id_key" ON "PanelGeometricFormatType_PL"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PanelGeometricFormatType_PL_formatName_key" ON "PanelGeometricFormatType_PL"("formatName");

-- CreateIndex
CREATE UNIQUE INDEX "RegulatoryBody_PL_id_key" ON "RegulatoryBody_PL"("id");

-- CreateIndex
CREATE UNIQUE INDEX "RegulatoryBody_PL_code_key" ON "RegulatoryBody_PL"("code");

-- CreateIndex
CREATE INDEX "RegulatoryBody_PL_code_idx" ON "RegulatoryBody_PL"("code");

-- CreateIndex
CREATE UNIQUE INDEX "RegulationType_PL_id_key" ON "RegulationType_PL"("id");

-- CreateIndex
CREATE UNIQUE INDEX "RegulationType_PL_code_key" ON "RegulationType_PL"("code");

-- CreateIndex
CREATE INDEX "RegulationType_PL_code_idx" ON "RegulationType_PL"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Regulation_PL_id_key" ON "Regulation_PL"("id");

-- CreateIndex
CREATE INDEX "Regulation_PL_regulatoryBodyId_idx" ON "Regulation_PL"("regulatoryBodyId");

-- CreateIndex
CREATE INDEX "Regulation_PL_regulationTypeId_idx" ON "Regulation_PL"("regulationTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Regulation_PL_regulatoryBodyId_regulationTypeId_number_year_key" ON "Regulation_PL"("regulatoryBodyId", "regulationTypeId", "number", "year");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceRule_PL_id_key" ON "ComplianceRule_PL"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceRule_PL_code_key" ON "ComplianceRule_PL"("code");

-- CreateIndex
CREATE INDEX "ComplianceRule_PL_regulationId_idx" ON "ComplianceRule_PL"("regulationId");

-- CreateIndex
CREATE INDEX "ComplianceRule_PL_nutrientId_idx" ON "ComplianceRule_PL"("nutrientId");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_TE_id_key" ON "Claim_TE"("id");

-- CreateIndex
CREATE INDEX "Claim_TE_tenantId_idx" ON "Claim_TE"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_TE_tenantId_code_key" ON "Claim_TE"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "ProductFamily_TE_id_key" ON "ProductFamily_TE"("id");

-- CreateIndex
CREATE INDEX "ProductFamily_TE_tenantId_idx" ON "ProductFamily_TE"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductFamily_TE_tenantId_name_key" ON "ProductFamily_TE"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CommercialLine_TE_id_key" ON "CommercialLine_TE"("id");

-- CreateIndex
CREATE INDEX "CommercialLine_TE_tenantId_idx" ON "CommercialLine_TE"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "CommercialLine_TE_tenantId_name_key" ON "CommercialLine_TE"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "TechnicalSourceType_TE_id_key" ON "TechnicalSourceType_TE"("id");

-- CreateIndex
CREATE INDEX "TechnicalSourceType_TE_tenantId_idx" ON "TechnicalSourceType_TE"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TechnicalSourceType_TE_tenantId_name_key" ON "TechnicalSourceType_TE"("tenantId", "name");

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
CREATE INDEX "Ingredient_tenantId_externalCode_idx" ON "Ingredient"("tenantId", "externalCode");

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
CREATE UNIQUE INDEX "Ingredient_tenantId_internalName_key" ON "Ingredient"("tenantId", "internalName");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientTenantAllergen_id_key" ON "IngredientTenantAllergen"("id");

-- CreateIndex
CREATE INDEX "IngredientTenantAllergen_tenantId_idx" ON "IngredientTenantAllergen"("tenantId");

-- CreateIndex
CREATE INDEX "IngredientTenantAllergen_ingredientId_idx" ON "IngredientTenantAllergen"("ingredientId");

-- CreateIndex
CREATE INDEX "IngredientTenantAllergen_allergenId_idx" ON "IngredientTenantAllergen"("allergenId");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientTenantAllergen_ingredientId_allergenId_key" ON "IngredientTenantAllergen"("ingredientId", "allergenId");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientTenantNutrient_id_key" ON "IngredientTenantNutrient"("id");

-- CreateIndex
CREATE INDEX "IngredientTenantNutrient_tenantId_idx" ON "IngredientTenantNutrient"("tenantId");

-- CreateIndex
CREATE INDEX "IngredientTenantNutrient_ingredientId_idx" ON "IngredientTenantNutrient"("ingredientId");

-- CreateIndex
CREATE INDEX "IngredientTenantNutrient_sourceId_idx" ON "IngredientTenantNutrient"("sourceId");

-- CreateIndex
CREATE INDEX "IngredientTenantNutrient_nutrientId_idx" ON "IngredientTenantNutrient"("nutrientId");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientTenantNutrient_ingredientId_nutrientId_key" ON "IngredientTenantNutrient"("ingredientId", "nutrientId");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientFlag_TE_id_key" ON "IngredientFlag_TE"("id");

-- CreateIndex
CREATE INDEX "IngredientFlag_TE_tenantId_idx" ON "IngredientFlag_TE"("tenantId");

-- CreateIndex
CREATE INDEX "IngredientFlag_TE_ingredientId_idx" ON "IngredientFlag_TE"("ingredientId");

-- CreateIndex
CREATE INDEX "IngredientFlag_TE_flagId_idx" ON "IngredientFlag_TE"("flagId");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientFlag_TE_ingredientId_flagId_key" ON "IngredientFlag_TE"("ingredientId", "flagId");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientCost_TE_id_key" ON "IngredientCost_TE"("id");

-- CreateIndex
CREATE INDEX "IngredientCost_TE_tenantId_idx" ON "IngredientCost_TE"("tenantId");

-- CreateIndex
CREATE INDEX "IngredientCost_TE_ingredientId_idx" ON "IngredientCost_TE"("ingredientId");

-- CreateIndex
CREATE INDEX "IngredientCost_TE_unitOfMeasureId_idx" ON "IngredientCost_TE"("unitOfMeasureId");

-- CreateIndex
CREATE INDEX "IngredientCost_TE_tenantId_ingredientId_idx" ON "IngredientCost_TE"("tenantId", "ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientCost_TE_tenantId_ingredientId_effectiveDate_key" ON "IngredientCost_TE"("tenantId", "ingredientId", "effectiveDate");

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
ALTER TABLE "Product" ADD CONSTRAINT "Product_productFamilyId_fkey" FOREIGN KEY ("productFamilyId") REFERENCES "ProductFamily_TE"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_commercialLineId_fkey" FOREIGN KEY ("commercialLineId") REFERENCES "CommercialLine_TE"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductLabelField_TE" ADD CONSTRAINT "ProductLabelField_TE_labelFieldId_fkey" FOREIGN KEY ("labelFieldId") REFERENCES "LabelField_PL"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductLabelField_TE" ADD CONSTRAINT "ProductLabelField_TE_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductLabelField_TE" ADD CONSTRAINT "ProductLabelField_TE_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPanel_TE" ADD CONSTRAINT "ProductPanel_TE_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPanel_TE" ADD CONSTRAINT "ProductPanel_TE_geometricFormatTypeId_fkey" FOREIGN KEY ("geometricFormatTypeId") REFERENCES "PanelGeometricFormatType_PL"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPanel_TE" ADD CONSTRAINT "ProductPanel_TE_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductNutrientOverride_TE" ADD CONSTRAINT "ProductNutrientOverride_TE_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductNutrientOverride_TE" ADD CONSTRAINT "ProductNutrientOverride_TE_nutrientId_fkey" FOREIGN KEY ("nutrientId") REFERENCES "BaseNutrient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductNutrientOverride_TE" ADD CONSTRAINT "ProductNutrientOverride_TE_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductClaim_TE" ADD CONSTRAINT "ProductClaim_TE_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductClaim_TE" ADD CONSTRAINT "ProductClaim_TE_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductClaim_TE" ADD CONSTRAINT "ProductClaim_TE_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim_TE"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationVersion" ADD CONSTRAINT "FormulationVersion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationVersion" ADD CONSTRAINT "FormulationVersion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationRevision" ADD CONSTRAINT "FormulationRevision_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationRevision" ADD CONSTRAINT "FormulationRevision_formulationVersionId_fkey" FOREIGN KEY ("formulationVersionId") REFERENCES "FormulationVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationItem" ADD CONSTRAINT "FormulationItem_formulationRevisionId_fkey" FOREIGN KEY ("formulationRevisionId") REFERENCES "FormulationRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationItem" ADD CONSTRAINT "FormulationItem_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationItem" ADD CONSTRAINT "FormulationItem_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "UnitOfMeasure_PL"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationRegulatoryDeclaration_TE" ADD CONSTRAINT "FormulationRegulatoryDeclaration_TE_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationRegulatoryDeclaration_TE" ADD CONSTRAINT "FormulationRegulatoryDeclaration_TE_formulationRevisionId_fkey" FOREIGN KEY ("formulationRevisionId") REFERENCES "FormulationRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationRegulatoryDeclaration_TE" ADD CONSTRAINT "FormulationRegulatoryDeclaration_TE_flagId_fkey" FOREIGN KEY ("flagId") REFERENCES "DeclarationFlag_PL"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationAllergen_TE" ADD CONSTRAINT "FormulationAllergen_TE_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationAllergen_TE" ADD CONSTRAINT "FormulationAllergen_TE_formulationRevisionId_fkey" FOREIGN KEY ("formulationRevisionId") REFERENCES "FormulationRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationNutrition_TE" ADD CONSTRAINT "FormulationNutrition_TE_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationNutrition_TE" ADD CONSTRAINT "FormulationNutrition_TE_formulationRevisionId_fkey" FOREIGN KEY ("formulationRevisionId") REFERENCES "FormulationRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationNutrition_TE" ADD CONSTRAINT "FormulationNutrition_TE_nutrientId_fkey" FOREIGN KEY ("nutrientId") REFERENCES "BaseNutrient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationOgmDonor_TE" ADD CONSTRAINT "FormulationOgmDonor_TE_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationOgmDonor_TE" ADD CONSTRAINT "FormulationOgmDonor_TE_formulationRevisionId_fkey" FOREIGN KEY ("formulationRevisionId") REFERENCES "FormulationRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationOgmDonor_TE" ADD CONSTRAINT "FormulationOgmDonor_TE_ogmDonorSpeciesId_fkey" FOREIGN KEY ("ogmDonorSpeciesId") REFERENCES "OgmDonorSpecies_PL"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaseNutrient" ADD CONSTRAINT "BaseNutrient_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "BaseNutrient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitConversion_PL" ADD CONSTRAINT "UnitConversion_PL_fromUnitId_fkey" FOREIGN KEY ("fromUnitId") REFERENCES "UnitOfMeasure_PL"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitConversion_PL" ADD CONSTRAINT "UnitConversion_PL_toUnitId_fkey" FOREIGN KEY ("toUnitId") REFERENCES "UnitOfMeasure_PL"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSubcategory_PL" ADD CONSTRAINT "ProductSubcategory_PL_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory_PL"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Regulation_PL" ADD CONSTRAINT "Regulation_PL_regulatoryBodyId_fkey" FOREIGN KEY ("regulatoryBodyId") REFERENCES "RegulatoryBody_PL"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Regulation_PL" ADD CONSTRAINT "Regulation_PL_regulationTypeId_fkey" FOREIGN KEY ("regulationTypeId") REFERENCES "RegulationType_PL"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceRule_PL" ADD CONSTRAINT "ComplianceRule_PL_regulationId_fkey" FOREIGN KEY ("regulationId") REFERENCES "Regulation_PL"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim_TE" ADD CONSTRAINT "Claim_TE_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFamily_TE" ADD CONSTRAINT "ProductFamily_TE_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommercialLine_TE" ADD CONSTRAINT "CommercialLine_TE_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicalSourceType_TE" ADD CONSTRAINT "TechnicalSourceType_TE_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "IngredientTenantAllergen" ADD CONSTRAINT "IngredientTenantAllergen_allergenId_fkey" FOREIGN KEY ("allergenId") REFERENCES "BaseAllergen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientTenantNutrient" ADD CONSTRAINT "IngredientTenantNutrient_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientTenantNutrient" ADD CONSTRAINT "IngredientTenantNutrient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientTenantNutrient" ADD CONSTRAINT "IngredientTenantNutrient_nutrientId_fkey" FOREIGN KEY ("nutrientId") REFERENCES "BaseNutrient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientTenantNutrient" ADD CONSTRAINT "IngredientTenantNutrient_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "TechnicalInfoSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientFlag_TE" ADD CONSTRAINT "IngredientFlag_TE_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientFlag_TE" ADD CONSTRAINT "IngredientFlag_TE_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientFlag_TE" ADD CONSTRAINT "IngredientFlag_TE_flagId_fkey" FOREIGN KEY ("flagId") REFERENCES "DeclarationFlag_PL"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientCost_TE" ADD CONSTRAINT "IngredientCost_TE_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientCost_TE" ADD CONSTRAINT "IngredientCost_TE_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientCost_TE" ADD CONSTRAINT "IngredientCost_TE_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientCost_TE" ADD CONSTRAINT "IngredientCost_TE_unitOfMeasureId_fkey" FOREIGN KEY ("unitOfMeasureId") REFERENCES "UnitOfMeasure_PL"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
