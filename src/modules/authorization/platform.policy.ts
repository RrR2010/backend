import { PlatformRole } from '@users/user.types'
import { AbilityBuilder, createMongoAbility } from '@casl/ability'
import { Action, AppAbility } from '@authorization/authorization.types'
import { User } from '@users/user.entity'
import { Tenant } from '@tenants/tenant.entity'
import { Ingredient } from '@ingredients/ingredient.entity'
import { Identity } from '@identities/identity.entity'

type PlatformCtx = { userId: string; roles: PlatformRole[] }

export function definePlatformAbility(ctx: PlatformCtx): AppAbility {
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
    can([Action.Read, Action.Update], User, { id: ctx.userId })
    cannot(Action.Delete, User)

    // Platform USER should NOT have access to tenant-specific resources
    // (ingredients, identities, tenants) - these are managed by tenant policies

    return build()
  }

  // Default: read-only access
  can(Action.Read, 'all')
  return build()
}
