import { PlatformRole, UserScope } from '@users/user.types'
import { AbilityBuilder, createMongoAbility } from '@casl/ability'
import {
  Action,
  AppAbility,
  AppConditions,
  RequestContext
} from '@authorization/authorization.types'
import { User } from '@users/user.entity'
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
import { ProductCategory_PL } from '@products/product-category-pl.entity'
import { ProductSubcategory_PL } from '@products/product-subcategory-pl.entity'
import { PanelGeometricFormatType_PL } from '@products/panel-geometric-format-type-pl.entity'
import { UnitOfMeasure_PL } from '@formulations/unit-of-measure-pl.entity'
import { UnitConversion_PL } from '@formulations/unit-conversion-pl.entity'
import { Claim_TE } from '@products/claim-te.entity'
import { ProductFamily_TE } from '@products/product-family-te.entity'
import { CommercialLine_TE } from '@products/commercial-line-te.entity'
import { ProductLabelField_TE } from '@products/product-label-field-te.entity'
import { ProductPanel_TE } from '@products/product-panel-te.entity'
import { ProductNutrientOverride_TE } from '@products/product-nutrient-override-te.entity'
import { ProductClaim_TE } from '@products/product-claim-te.entity'
import { TechnicalSourceType_TE } from '@ingredients/technical-source-type-te.entity'
import { TechnicalSource_TE } from '@ingredients/technical-source-te.entity'
import { IngredientAllergen_TE } from '@ingredients/ingredient-allergen-te.entity'
import { IngredientNutrient_TE } from '@ingredients/ingredient-nutrient-te.entity'
import { IngredientFlag_TE } from '@ingredients/ingredient-flag-te.entity'
import { IngredientCost_TE } from '@ingredients/ingredient-cost-te.entity'

type PlatformContext = Extract<RequestContext, { scope: UserScope.PLATFORM }>

export function definePlatformAbility(ctx: PlatformContext): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(
    createMongoAbility
  )

  // Platform admin has full access to everything
  if (ctx.roles.includes(PlatformRole.ADMIN)) {
    can(Action.Manage, 'all')
    return build()
  }

  // Platform user has limited access
  if (ctx.roles.includes(PlatformRole.USER)) {
    // Can read and update their own user profile only
    can([Action.Read, Action.Update], User, {
      id: { $eq: ctx.userId }
    } as AppConditions)
    cannot(Action.Delete, User)

    // If impersonating, add tenant-scoped permissions
    // The actual tenantId filtering happens at the repository level
    // via getEffectiveTenantId(), not in CASL conditions
    // Platform-scoped catalogs are readable by PLATFORM USER
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

    if (ctx.impersonatedTenantId) {
      // Allow reading tenant-scoped entities when impersonating
      can(Action.Read, Claim_TE)
      can(Action.Read, ProductFamily_TE)
      can(Action.Read, CommercialLine_TE)
      can(Action.Read, TechnicalSourceType_TE)
      can(Action.Read, TechnicalSource_TE)
      can(Action.Read, IngredientAllergen_TE)
      can(Action.Read, IngredientNutrient_TE)
      can(Action.Read, IngredientFlag_TE)
      can(Action.Read, IngredientCost_TE)
      can(Action.Read, ProductLabelField_TE)
      can(Action.Read, ProductPanel_TE)
      can(Action.Read, ProductNutrientOverride_TE)
      can(Action.Read, ProductClaim_TE)
      // Additional tenant-scoped permissions can be added here
      // as needed for the PLATFORM USER role
    }

    return build()
  }

  // Default: no access for users without explicit roles
  return build()
}
