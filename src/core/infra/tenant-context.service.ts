import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { AuthScope } from '@modules/authentication/domain/token.service';

/**
 * Custom error thrown when tenant context is required but not present.
 */
export class MissingTenantContextError extends Error {
  constructor() {
    super(
      'Tenant context is required for this operation. ' +
        'Ensure the request is authenticated with tenant scope.',
    );
    this.name = 'MissingTenantContextError';
  }
}

/**
 * TenantContextService - Provides tenant context from the current request.
 *
 * SECURITY REQUIREMENT (TASK_005_009):
 * - This service reads tenantId from the authenticated request context.
 * - TenantId is derived from the JWT payload set by the auth guard, NEVER from request parameters.
 * - Tenant-scoped operations MUST use getTenantId() which throws if tenant context is missing.
 * - Platform operations use getOptionalTenantId() when explicit tenant filtering is desired.
 * - isPlatformScope() checks if the user has platform-level access.
 *
 * SCOPE:
 * - Request-scoped to ensure each request gets its own tenant context.
 * - Must be provided at module level with REQUEST scope.
 */
@Injectable({ scope: Scope.REQUEST })
export class TenantContextService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  /**
   * Returns the tenantId from the current request context.
   * THROWS MissingTenantContextError if tenantId is not present.
   *
   * Usage: Required for all tenant-scoped repository operations.
   */
  getTenantId(): string {
    const user = (this.request as any).user;
    if (!user?.tenantId) {
      throw new MissingTenantContextError();
    }
    return user.tenantId;
  }

  /**
   * Returns the tenantId from the current request context, or undefined if not present.
   *
   * NOTE: Returns undefined for BOTH of these scenarios:
   * - User is unauthenticated (no user object)
   * - User has platform scope (platform users don't have tenantId)
   *
   * If you need to distinguish these cases, check isPlatformScope() separately.
   *
   * Usage: Platform queries that optionally filter by tenantId.
   * - For platform scope: May return the tenantId the platform user is querying
   * - For tenant scope: Returns the enforced tenantId (same as getTenantId())
   */
  getOptionalTenantId(): string | undefined {
    const user = (this.request as any).user;
    return user?.tenantId;
  }

  /**
   * Determines if the current context is platform-scoped.
   * Platform-scoped requests bypass tenant filtering requirements.
   */
  isPlatformScope(): boolean {
    const user = (this.request as any).user;
    return user?.scope === AuthScope.Platform;
  }
}