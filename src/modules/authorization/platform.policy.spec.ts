import { definePlatformAbility } from './platform.policy'
import { UserScope, PlatformRole } from '@users/user.types'
import { Action } from '@authorization/authorization.types'
import { IngredientAllergen_TE } from '@ingredients/ingredient-allergen-te.entity'
import { IngredientNutrient_TE } from '@ingredients/ingredient-nutrient-te.entity'

describe('definePlatformAbility with impersonatedTenantId', () => {
  it('should allow PLATFORM ADMIN to manage all', () => {
    const ability = definePlatformAbility({
      userId: 'user-1',
      scope: UserScope.PLATFORM,
      roles: [PlatformRole.ADMIN],
      impersonatedTenantId: null,
    })
    expect(ability.can(Action.Manage, 'all')).toBe(true)
  })

  it('should grant tenant-scoped read to PLATFORM USER when impersonating', () => {
    const ability = definePlatformAbility({
      userId: 'user-1',
      scope: UserScope.PLATFORM,
      roles: [PlatformRole.USER],
      impersonatedTenantId: 'tenant-xyz',
    })
    expect(ability.can(Action.Read, IngredientAllergen_TE)).toBe(true)
    expect(ability.can(Action.Read, IngredientNutrient_TE)).toBe(true)
  })

  it('should NOT grant tenant-scoped read to PLATFORM USER without impersonation', () => {
    const ability = definePlatformAbility({
      userId: 'user-1',
      scope: UserScope.PLATFORM,
      roles: [PlatformRole.USER],
      impersonatedTenantId: null,
    })
    expect(ability.can(Action.Read, IngredientAllergen_TE)).toBe(false)
    expect(ability.can(Action.Read, IngredientNutrient_TE)).toBe(false)
  })

  it('should use platform policy, NOT tenant policy', () => {
    // Platform USER cannot Delete even when impersonating
    const ability = definePlatformAbility({
      userId: 'user-1',
      scope: UserScope.PLATFORM,
      roles: [PlatformRole.USER],
      impersonatedTenantId: 'tenant-xyz',
    })
    expect(ability.can(Action.Delete, IngredientAllergen_TE)).toBe(false)
    expect(ability.can(Action.Delete, IngredientNutrient_TE)).toBe(false)
  })

  it('should allow PLATFORM ADMIN impersonating to still manage all', () => {
    const ability = definePlatformAbility({
      userId: 'user-1',
      scope: UserScope.PLATFORM,
      roles: [PlatformRole.ADMIN],
      impersonatedTenantId: 'tenant-xyz',
    })
    // ADMIN can manage all regardless of impersonation
    expect(ability.can(Action.Manage, 'all')).toBe(true)
    expect(ability.can(Action.Read, IngredientAllergen_TE)).toBe(true)
    expect(ability.can(Action.Create, IngredientNutrient_TE)).toBe(true)
    expect(ability.can(Action.Delete, 'all')).toBe(true)
  })
})
