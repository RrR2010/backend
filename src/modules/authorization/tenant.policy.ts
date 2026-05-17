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
import { Identity } from '@identities/identity.entity'

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

    // Can read identities within their tenant
    can(Action.Read, Identity, {
      tenantId: { $eq: ctx.tenantId }
    } as AppConditions)

    // Can read tenant info
    can(Action.Read, Tenant, { id: { $eq: ctx.tenantId } } as AppConditions)

    return build()
  }

  // Default: no access
  return build()
}
