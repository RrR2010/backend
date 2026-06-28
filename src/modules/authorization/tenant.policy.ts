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
import { Ingredient } from '@ingredients/ingredient.entity'
import { TenantAllergen } from '@ingredients/tenant-allergen.entity'
import { TenantNutrient } from '@ingredients/tenant-nutrient.entity'
import { Company } from '@ingredients/company.entity'
import { FunctionalGroup } from '@ingredients/functional-group.entity'
import { TechnicalInfoSource } from '@ingredients/technical-info-source.entity'
import { BaseAllergen } from '@ingredients/base-allergen.entity'
import { BaseNutrient } from '@ingredients/base-nutrient.entity'
import { Allergen_PL } from '@ingredients/allergen-pl.entity'
import { Nutrient_PL } from '@ingredients/nutrient-pl.entity'
import { DeclarationFlag_PL } from '@ingredients/declaration-flag-pl.entity'
import { LabelField_PL } from '@products/label-field-pl.entity'
import { ProductCategory_PL } from '@products/product-category-pl.entity'
import { ProductSubcategory_PL } from '@products/product-subcategory-pl.entity'
import { PanelGeometricFormatType_PL } from '@products/panel-geometric-format-type-pl.entity'
import { IngredientBaseAllergen } from '@ingredients/ingredient-base-allergen.entity'
import { IngredientBaseNutrient } from '@ingredients/ingredient-base-nutrient.entity'
import { IngredientTenantAllergen } from '@ingredients/ingredient-tenant-allergen.entity'
import { IngredientTenantNutrient } from '@ingredients/ingredient-tenant-nutrient.entity'
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
    can(Action.Manage, Ingredient, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)

    // Can read catalog entities within their tenant
    can(Action.Read, TenantAllergen, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Read, TenantNutrient, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Read, Company, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Read, FunctionalGroup, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Read, TechnicalInfoSource, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)

    // Can manage catalog entities (for create/update/lock/unlock/delete operations)
    can(Action.Manage, TenantAllergen, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Manage, TenantNutrient, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Manage, Company, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Manage, FunctionalGroup, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)
    can(Action.Manage, TechnicalInfoSource, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)

    // Can read global base catalogs (no tenantId — shared reference data)
    can(Action.Read, BaseAllergen)
    can(Action.Read, BaseNutrient)
    can(Action.Read, Allergen_PL)
    can(Action.Read, Nutrient_PL)
    can(Action.Read, DeclarationFlag_PL)
    can(Action.Read, LabelField_PL)
    can(Action.Read, ProductCategory_PL)
    can(Action.Read, ProductSubcategory_PL)
    can(Action.Read, PanelGeometricFormatType_PL)

    // Can manage ingredient-base-allergen junctions within their tenant
    can(Action.Manage, IngredientBaseAllergen, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)

    // Can manage ingredient-base-nutrient junctions within their tenant
    can(Action.Manage, IngredientBaseNutrient, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)

    // Can manage ingredient-tenant-allergen junctions within their tenant
    can(Action.Manage, IngredientTenantAllergen, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)

    // Can manage ingredient-tenant-nutrient junctions within their tenant
    can(Action.Manage, IngredientTenantNutrient, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)

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
