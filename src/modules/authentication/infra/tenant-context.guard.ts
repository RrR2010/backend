import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import {
  AuthTokenPayload,
  AuthScope,
} from '@modules/authentication/domain/token.service';
import { MissingTenantContextError } from '@modules/authentication/domain/auth.errors';

/**
 * Guard that enforces tenant context resolution for authenticated requests.
 *
 * Context resolution rules:
 * - Platform scope: User has full platform access. No tenant required.
 * - Tenant scope: User must have tenantId attached.
 *
 * Security: Fail-closed. Missing or invalid context throws error.
 */
@Injectable()
export class TenantContextGuard implements CanActivate {
  /**
   * Determines if the current user has platform-level access.
   */
  private hasPlatformScope(user: AuthTokenPayload | undefined): boolean {
    return user?.scope === AuthScope.Platform;
  }

  /**
   * Determines if the current user has valid tenant context.
   * For tenant-scoped users, tenantId is required.
   */
  private hasTenantContext(user: AuthTokenPayload | undefined): boolean {
    if (!user || user.scope !== AuthScope.Tenant) {
      return false;
    }
    return !!user.tenantId;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthTokenPayload | undefined;

    // Platform users bypass tenant requirement
    if (this.hasPlatformScope(user)) {
      return true;
    }

    // Tenant users require tenantId in context
    if (!this.hasTenantContext(user)) {
      throw new MissingTenantContextError();
    }

    return true;
  }
}
