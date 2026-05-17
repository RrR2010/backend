import { PlatformRole, UserScope } from '@users/user.types'
import { AbilityBuilder, createMongoAbility } from '@casl/ability'
import {
  Action,
  AppAbility,
  AppConditions,
  RequestContext
} from '@authorization/authorization.types'
import { User } from '@users/user.entity'

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

    // Platform USER should NOT have access to tenant-specific resources
    // (ingredients, identities, tenants) - these are managed by tenant policies

    return build()
  }

  // Default: no access for users without explicit roles
  return build()
}
