import { UserScope, PlatformRole, TenantRole } from '@users/user.types'
import { getEffectiveTenantId } from './tenant-context.helper'
import { RequestContext } from '@authorization/authorization.types'

describe('getEffectiveTenantId', () => {
  it('should return ctx.tenantId for TENANT scope', () => {
    const ctx: RequestContext = {
      userId: 'user-1',
      scope: UserScope.TENANT,
      tenantId: 'tenant-abc',
      roles: [TenantRole.ADMIN],
    }
    expect(getEffectiveTenantId(ctx)).toBe('tenant-abc')
  })

  it('should return impersonatedTenantId for PLATFORM scope with impersonation', () => {
    const ctx: RequestContext = {
      userId: 'user-1',
      scope: UserScope.PLATFORM,
      roles: [PlatformRole.ADMIN],
      impersonatedTenantId: 'tenant-xyz',
    }
    expect(getEffectiveTenantId(ctx)).toBe('tenant-xyz')
  })

  it('should return null for PLATFORM scope without impersonation', () => {
    const ctx: RequestContext = {
      userId: 'user-1',
      scope: UserScope.PLATFORM,
      roles: [PlatformRole.ADMIN],
      impersonatedTenantId: null,
    }
    expect(getEffectiveTenantId(ctx)).toBeNull()
  })
})
