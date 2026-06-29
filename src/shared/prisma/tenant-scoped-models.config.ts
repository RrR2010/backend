/**
 * Modelos do Prisma por escopo de tenant.
 * 
 * TENANT_SCOPED_MODELS: possuem coluna `tenantId` direta.
 * HOP_BASED_MODELS: não têm tenantId — resolvem por hop.
 * PLATFORM_SCOPED_MODELS: dados globais, sem tenantId.
 * 
 * Sincronizado com schema.prisma pós EP-005 refactoring.
 */

export const TENANT_SCOPED_MODELS = new Set<string>([
  'Address',
  'Phone',
  'Product_TE',
  'ProductLabelField_TE',
  'ProductPanel_TE',
  'ProductNutrientOverride_TE',
  'ProductClaim_TE',
  'Claim_TE',
  'ProductFamily_TE',
  'CommercialLine_TE',
  'Ingredient_TE',
  'IngredientAllergen_TE',
  'IngredientNutrient_TE',
  'IngredientFlag_TE',
  'IngredientCost_TE',
  'Company_TE',
  'FunctionalGroup_TE',
  'TechnicalSource_TE',
  'TechnicalSourceType_TE',
  'FormulationVersion_TE',
  'FormulationRevision_TE',
  'FormulationItem_TE',
  'FormulationRegulatoryDeclaration_TE',
  'FormulationAllergen_TE',
  'FormulationNutrition_TE',
  'FormulationOgmDonor_TE',
  'TenantSite',
  'TenantMembership',
  'Session',
  'AuditLog',
  'Subscription',
])

export const HOP_BASED_MODELS = new Set<string>([
  'MemberProfile',
  'MemberProfileDocument',
  'Identity',
  'User',
  'SubscriptionEvent',
  'Tenant',
])

export const PLATFORM_SCOPED_MODELS = new Set<string>([
  'Plan',
  'Allergen_PL',
  'Nutrient_PL',
  'TenantRegistration',
  'PlatformMembership',
])
