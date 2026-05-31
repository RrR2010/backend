import { PlatformRole, UserScope } from '@users/user.types'
import { AbilityBuilder, createMongoAbility } from '@casl/ability'
import {
  Action,
  AppAbility,
  AppConditions,
  RequestContext
} from '@authorization/authorization.types'
import { User } from '@users/user.entity'
import { TenantNutrient } from '@ingredients/tenant-nutrient.entity'
import { TenantAllergen } from '@ingredients/tenant-allergen.entity'

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
    if (ctx.impersonatedTenantId) {
      // Allow reading tenant-scoped entities when impersonating
      can(Action.Read, TenantNutrient)
      can(Action.Read, TenantAllergen)
      // Additional tenant-scoped permissions can be added here
      // as needed for the PLATFORM USER role
    }

    return build()
  }

  // Default: no access for users without explicit roles
  return build()
}
