/**
 * AuthorizationGuard
 *
 * Guards routes by checking authorization metadata against user permissions.
 *
 * Flow:
 * 1. Check if route is marked as @Public() - allow if so
 * 2. Get @Authorize metadata from the route handler
 * 3. Extract user context from request (set by JwtStrategy)
 * 4. Build AbilityFactoryInput with membership support
 * 5. Use AbilityFactory to check if permission is allowed
 * 
 * Requires JwtAuthGuard to run first (sets request.user with token payload).
 */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthorizationScope, PermissionAction, PermissionSubject } from '@core/domain/authorization';
import type { PermissionSpec } from '@core/domain/authorization';
import type { AuthTokenPayload } from '@modules/authentication/domain/token.service';
import type { AbilityFactory } from '../domain';
import type { AbilityFactoryInput, MembershipInput } from '../domain';
import type { AuthorizationMetadata } from '../domain/authorization-metadata';
import { AUTHORIZATION_KEY } from './authorization.decorator';

/**
 * Metadata key for public routes
 */
const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  private readonly logger = new Logger(AuthorizationGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly abilityFactory: AbilityFactory,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const handler = context.getHandler();
    const controller = context.getClass();

    // 1. Check if route is marked as @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      handler,
      controller,
    ]);

    if (isPublic) {
      return true;
    }

    // 2. Get authorization metadata from the route
    const authMetadata = this.reflector.getAllAndOverride<AuthorizationMetadata>(
      AUTHORIZATION_KEY,
      [handler, controller],
    );

    // No @Authorize decorator = deny access (fail-closed)
    if (!authMetadata) {
      const request = context.switchToHttp().getRequest();
      const user = request.user as AuthTokenPayload | undefined;
      this.logger.warn(
        `Access denied: Route ${request.method} ${request.path} has no @Authorize metadata. ` +
        `User: ${user?.sub ?? 'anonymous'} | IP: ${request.ip}`,
      );
      return false;
    }

    // 3. Extract user from request (set by JwtAuthGuard)
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthTokenPayload | undefined;

    if (!user || !user.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // 4. Build AbilityFactoryInput from token payload (new pattern)
    const factoryInput = this.buildFactoryInput(user, request);

    // 5. Check permissions based on metadata
    const permissions = Array.isArray(authMetadata.permission)
      ? authMetadata.permission
      : [authMetadata.permission];

    const hasPermission = this.checkPermissions(
      factoryInput,
      permissions,
      authMetadata.requireAll ?? false,
    );

    if (!hasPermission) {
      const request = context.switchToHttp().getRequest();
      this.logger.warn(
        `Access denied: Insufficient permissions for ${request.method} ${request.path}. ` +
        `User: ${user?.sub ?? 'unknown'} | Required: ${JSON.stringify(permissions)}`,
      );
      throw new ForbiddenException('Insufficient permissions');
    }

    // 6. Validate scope if specified in metadata
    if (authMetadata.scope && factoryInput.scope !== authMetadata.scope) {
      const request = context.switchToHttp().getRequest();
      this.logger.warn(
        `Access denied: Invalid scope for ${request.method} ${request.path}. ` +
        `User: ${user?.sub ?? 'unknown'} | Required scope: ${authMetadata.scope} | Actual: ${factoryInput.scope}`,
      );
      throw new ForbiddenException('Invalid scope');
    }

    return true;
  }

  /**
   * Build AbilityFactoryInput from token payload
   * Supports both platform and tenant scopes with membership data.
   */
  private buildFactoryInput(
    user: AuthTokenPayload,
    request: any,
  ): AbilityFactoryInput {
    const scope = user.scope === 'platform' 
      ? AuthorizationScope.Platform 
      : AuthorizationScope.Tenant;

    const input: AbilityFactoryInput = {
      userId: user.sub,
      scope,
    };

    // Platform scope: use platform roles from token
    if (scope === AuthorizationScope.Platform) {
      if (user.platformRoles && user.platformRoles.length > 0) {
        // Convert string roles to typed roles
        const typedRoles = user.platformRoles.map(role => {
          // Handle both uppercase and lowercase role strings
          const normalized = role.toUpperCase();
          if (normalized === 'ADMIN') {
            return 'ADMIN' as const;
          }
          if (normalized === 'SUPER_ADMIN') {
            return 'SUPER_ADMIN' as const;
          }
          return 'USER' as const;
        });
        input.platformRoles = typedRoles;
      } else {
        input.platformRoles = ['USER'];
      }
    }
    // Tenant scope: use membership from request (loaded by guard or service)
    else {
      // Membership can be set by a previous middleware or loaded here
      const membership = request.membership as MembershipInput | undefined;
      
      if (membership) {
        input.membership = membership;
      } else {
        // FIX (Critical 2): If membership is undefined, throw ForbiddenException
        // Tenant-scoped users MUST have valid membership to access tenant resources
        throw new ForbiddenException(
          'Tenant membership required. You must belong to a tenant to access tenant-scoped resources.',
        );
      }
    }

    // Add resource attributes if available
    if (request.resource) {
      input.resource = request.resource;
    } else if (request.params?.id && input.membership?.tenantId) {
      // Only set resource tenantId from membership if explicitly available
      // Don't rely on user token for resource tenant context
      input.resource = {
        tenantId: input.membership.tenantId,
      };
    }

    return input;
  }

  /**
   * Check permissions against the ability factory
   * Uses the new createFromInput/allowWithInput methods when available.
   */
  private checkPermissions(
    input: AbilityFactoryInput,
    permissions: PermissionSpec[],
    requireAll: boolean,
  ): boolean {
    // Cast to any to access new methods (factory interface is generic)
    const factory = this.abilityFactory as any;

    // Use new method if available, fall back to legacy
    const allowMethod = factory.allowWithInput 
      ? (input: AbilityFactoryInput, perm: PermissionSpec) => factory.allowWithInput(input, perm)
      : (input: AbilityFactoryInput, perm: PermissionSpec) => {
          // Convert to legacy context format
          const context = {
            request: {
              userId: input.userId,
              scope: input.scope,
              roles: input.scope === AuthorizationScope.Platform 
                ? { scope: AuthorizationScope.Platform, role: input.platformRoles?.[0] || 'USER' }
                : { scope: AuthorizationScope.Tenant, role: input.membership?.roles?.[0] || 'USER', tenantId: input.membership?.tenantId },
            },
            resource: input.resource,
          };
          return factory.allow(context, perm);
        };

    if (requireAll) {
      return permissions.every(permission => {
        try {
          return allowMethod(input, permission);
        } catch {
          return false;
        }
      });
    } else {
      return permissions.some(permission => {
        try {
          return allowMethod(input, permission);
        } catch {
          return false;
        }
      });
    }
  }
}