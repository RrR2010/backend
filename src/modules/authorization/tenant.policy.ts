import { TenantRole, UserScope } from '@users/user.types'
import { AbilityBuilder, createMongoAbility } from '@casl/ability'
import {
  Action,
  AppAbility,
  AppConditions,
  RequestContext
} from '@authorization/authorization.types'
import { User } from '@users/user.entity'
import { Tenant } from '@tenants/tenant.entity'
import { Ingredient_TE } from '@ingredients/ingredient.entity'
import { Company_TE } from '@ingredients/company.entity'
import { FunctionalGroup_TE } from '@ingredients/functional-group.entity'
import { TechnicalSource_TE } from '@ingredients/technical-source-te.entity'
import { Allergen_PL } from '@ingredients/allergen-pl.entity'
import { Nutrient_PL } from '@ingredients/nutrient-pl.entity'
import { DeclarationFlag_PL } from '@ingredients/declaration-flag-pl.entity'
import { OgmDonorSpecies_PL } from '@ingredients/ogm-donor-species-pl.entity'
import { TechnicalSourceType_PL } from '@ingredients/technical-source-type-pl.entity'
import { RegulatoryBody_PL } from '@ingredients/regulatory-body-pl.entity'
import { RegulationType_PL } from '@ingredients/regulation-type-pl.entity'
import { Regulation_PL } from '@ingredients/regulation-pl.entity'
import { ComplianceRule_PL } from '@ingredients/compliance-rule-pl.entity'
import { LabelField_PL } from '@products/label-field-pl.entity'
import { Product_TE } from '@products/product.entity'
import { Claim_TE } from '@products/claim-te.entity'
import { ProductFamily_TE } from '@products/product-family-te.entity'
import { CommercialLine_TE } from '@products/commercial-line-te.entity'
import { ProductLabelField_TE } from '@products/product-label-field-te.entity'
import { ProductPanel_TE } from '@products/product-panel-te.entity'
import { ProductNutrientOverride_TE } from '@products/product-nutrient-override-te.entity'
import { ProductClaim_TE } from '@products/product-claim-te.entity'
import { TechnicalSourceType_TE } from '@ingredients/technical-source-type-te.entity'
import { IngredientAllergen_TE } from '@ingredients/ingredient-allergen-te.entity'
import { IngredientNutrient_TE } from '@ingredients/ingredient-nutrient-te.entity'
import { IngredientFlag_TE } from '@ingredients/ingredient-flag-te.entity'
import { IngredientCost_TE } from '@ingredients/ingredient-cost-te.entity'
import { UnitOfMeasure_PL } from '@formulations/unit-of-measure-pl.entity'
import { UnitConversion_PL } from '@formulations/unit-conversion-pl.entity'
import { FormulationVersion_TE } from '@formulations/formulation-version.entity'
import { FormulationRevision_TE } from '@formulations/formulation-revision.entity'
import { FormulationItem_TE } from '@formulations/formulation-item.entity'
import { FormulationRegulatoryDeclaration_TE } from '@formulations/formulation-regulatory-declaration-te.entity'
import { FormulationAllergen_TE } from '@formulations/formulation-allergen-te.entity'
import { FormulationNutrition_TE } from '@formulations/formulation-nutrition-te.entity'
import { FormulationOgmDonor_TE } from '@formulations/formulation-ogm-donor-te.entity'
import { ProductCategory_PL } from '@products/product-category-pl.entity'
import { ProductSubcategory_PL } from '@products/product-subcategory-pl.entity'
import { PanelGeometricFormatType_PL } from '@products/panel-geometric-format-type-pl.entity'
import { Identity } from '@identities/identity.entity'
import { Address } from '@addresses/address.entity'
import { Phone } from '@phones/phone.entity'

type TenantContext = Extract<RequestContext, { scope: UserScope.TENANT }> & {
  isOwner: boolean
}

/**
 * Defines tenant-scoped abilities with automatic tenantId conditions.
 * All permissions are automatically scoped to the user's tenant.
 */
export function defineTenantAbility(ctx: TenantContext): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(
    createMongoAbility
  )

  // Tenant owner has full access within their tenant
  if (ctx.isOwner) {
    can(Action.Manage, 'all', { tenantId: ctx.tenantId })
    return build()
  }

  // Tenant admin has full access within their tenant
  if (ctx.roles.includes(TenantRole.ADMIN)) {
    can(Action.Manage, 'all', { tenantId: ctx.tenantId })
    return build()
  }

  // Tenant user has limited access within their tenant
  if (ctx.roles.includes(TenantRole.USER)) {
    // Can read and update their own user profile
    can(Action.Read, User, { tenantId: { $eq: ctx.tenantId } } as AppConditions)
    can(Action.Update, User, { id: { $eq: ctx.userId } } as AppConditions)
    cannot(Action.Delete, User)

    // Can manage ingredients within their tenant
    can(Action.Manage, Ingredient_TE, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Manage, Product_TE, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)

    // Can manage ingredient junctions within their tenant
    can(Action.Manage, IngredientAllergen_TE, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Manage, IngredientNutrient_TE, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Manage, IngredientFlag_TE, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Manage, IngredientCost_TE, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)

    // Can read catalog entities within their tenant
    can(Action.Read, Company_TE, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Read, FunctionalGroup_TE, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Read, TechnicalSource_TE, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)

    // Can manage catalog entities (for create/update/lock/unlock/delete operations)
    can(Action.Manage, Company_TE, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Manage, FunctionalGroup_TE, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Manage, TechnicalSource_TE, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Manage, Claim_TE, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Manage, ProductFamily_TE, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Manage, CommercialLine_TE, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Manage, TechnicalSourceType_TE, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Manage, ProductLabelField_TE, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Manage, ProductPanel_TE, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Manage, ProductNutrientOverride_TE, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Manage, ProductClaim_TE, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Manage, FormulationRegulatoryDeclaration_TE, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Manage, FormulationAllergen_TE, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Manage, FormulationNutrition_TE, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Manage, FormulationOgmDonor_TE, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)

    // Can manage formulation versions, revisions, and items within their tenant
    can(Action.Manage, FormulationVersion_TE, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Manage, FormulationRevision_TE, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Manage, FormulationItem_TE, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)

    // Can read global base catalogs (no tenantId — shared reference data)
    can(Action.Read, Allergen_PL)
    can(Action.Read, Nutrient_PL)
    can(Action.Read, DeclarationFlag_PL)
    can(Action.Read, OgmDonorSpecies_PL)
    can(Action.Read, TechnicalSourceType_PL)
    can(Action.Read, RegulatoryBody_PL)
    can(Action.Read, RegulationType_PL)
    can(Action.Read, Regulation_PL)
    can(Action.Read, ComplianceRule_PL)
    can(Action.Read, LabelField_PL)
    can(Action.Read, ProductCategory_PL)
    can(Action.Read, ProductSubcategory_PL)
    can(Action.Read, PanelGeometricFormatType_PL)
    can(Action.Read, UnitOfMeasure_PL)
    can(Action.Read, UnitConversion_PL)

    // Can read identities within their tenant
    can(Action.Read, Identity, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)

    // TODO(EP-002): Evaluate permission level — currently Read-only for USER role.
    // May need Create/Update for self-service address management.
    can(Action.Read, Address, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)

    can(Action.Read, Phone, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)

    // Can read tenant info
    can(Action.Read, Tenant, { id: { $eq: ctx.tenantId } } as AppConditions)

    // Tenant USER cannot unlock resources (only ADMIN/owner can)
    cannot(Action.Unlock, 'all')

    return build()
  }

  // Default: no access
  return build()
}
