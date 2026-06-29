import { UserScope, TenantRole } from '@users/user.types'
import type { RequestContext } from '@authorization/authorization.types'

/**
 * Creates a tenant-scoped RequestContext for tests.
 */
export function createTenantContext(overrides?: Partial<RequestContext>): RequestContext {
  return {
    userId: 'test-user-id',
    scope: UserScope.TENANT,
    tenantId: 'test-tenant-id',
    roles: [TenantRole.USER],
    ...overrides,
  } as RequestContext
}

/**
 * Creates a platform-scoped RequestContext for tests.
 */
export function createPlatformContext(overrides?: Partial<RequestContext>): RequestContext {
  return {
    userId: 'test-platform-user',
    scope: UserScope.PLATFORM,
    roles: [],
    impersonatedTenantId: null,
    ...overrides,
  } as RequestContext
}
