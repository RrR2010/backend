import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

/**
 * Returns the effective tenantId from a RequestContext.
 * - For TENANT scope: returns ctx.tenantId
 * - For PLATFORM scope: returns ctx.impersonatedTenantId (which is null when not impersonating)
 */
export function getEffectiveTenantId(ctx: RequestContext): string | null {
  if (ctx.scope === UserScope.TENANT) {
    return ctx.tenantId
  }
  return ctx.impersonatedTenantId
}
