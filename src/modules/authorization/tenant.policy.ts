import { TenantRole } from '@users/user.types'
import { AbilityBuilder, createMongoAbility } from '@casl/ability'
import { Action, AppAbility } from '@authorization/authorization.types'
import { User } from '@users/user.entity'
import { Tenant } from '@tenants/tenant.entity'
import { Ingredient } from '@ingredients/ingredient.entity'
import { Identity } from '@identities/identity.entity'

type TenantCtx = {
  userId: string
  roles: TenantRole[]
  tenantId: string
  isOwner: boolean
}

/**
 * Defines tenant-scoped abilities with automatic tenantId conditions.
 * All permissions are automatically scoped to the user's tenant.
 */
export function defineTenantAbility(ctx: TenantCtx): AppAbility {
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
    can(Action.Read, User, { tenantId: ctx.tenantId })
    can(Action.Update, User, { id: ctx.userId })
    cannot(Action.Delete, User)

    // Can manage ingredients within their tenant
    can(Action.Manage, Ingredient, { tenantId: ctx.tenantId })

    // Can read identities within their tenant
    can(Action.Read, Identity, { tenantId: ctx.tenantId })

    // Can read tenant info
    can(Action.Read, Tenant, { id: ctx.tenantId })

    return build()
  }

  // Default: no access
  return build()
}
