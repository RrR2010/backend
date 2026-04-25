/**
 * AuthorizationGuard
 *
 * Guards routes by checking authorization metadata against user permissions.
 *
 * Flow:
 * 1. Check if route is marked as @Public() - allow if so
 * 2. Get @Authorize metadata from the route handler
 * 3. Extract user context from request (set by JwtStrategy)
 * 4. Build AuthorizationContext
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
import { AuthorizationScope } from '@core/domain/authorization';
import type { PermissionSpec } from '@core/domain/authorization';
import type { AuthTokenPayload } from '@modules/authentication/domain/token.service';
import type { AbilityFactory } from '../domain';
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

    // 4. Build basic AuthorizationContext from token payload
    const authContext = this.buildContext(user);

    // 5. Check permissions based on metadata
    const permissions = Array.isArray(authMetadata.permission)
      ? authMetadata.permission
      : [authMetadata.permission];

    const hasPermission = this.checkPermissions(
      authContext,
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
    if (authMetadata.scope && authContext.request.scope !== authMetadata.scope) {
      const request = context.switchToHttp().getRequest();
      this.logger.warn(
        `Access denied: Invalid scope for ${request.method} ${request.path}. ` +
        `User: ${user?.sub ?? 'unknown'} | Required scope: ${authMetadata.scope} | Actual: ${authContext.request.scope}`,
      );
      throw new ForbiddenException('Invalid scope');
    }

    return true;
  }

  /**
   * Build basic AuthorizationContext from token payload
   */
  private buildContext(user: AuthTokenPayload): { request: { userId: string; scope: AuthorizationScope | string; roles: unknown } } {
    return {
      request: {
        userId: user.sub,
        scope: user.scope as AuthorizationScope | string,
        roles: {
          scope: user.scope as AuthorizationScope | string,
          role: user.platformRoles?.[0] || 'USER',
        },
      },
    };
  }

  /**
   * Check permissions against the authorization context
   */
  private checkPermissions(
    context: { request: { userId: string; scope: AuthorizationScope | string; roles: unknown } },
    permissions: PermissionSpec[],
    requireAll: boolean,
  ): boolean {
    // Simplify: check using the ability factory
    // Note: TypeScript may complain about context type, but at runtime this works
    if (requireAll) {
      return permissions.every(permission => {
        try {
          return (this.abilityFactory as any).allow(context, permission);
        } catch {
          return false;
        }
      });
    } else {
      return permissions.some(permission => {
        try {
          return (this.abilityFactory as any).allow(context, permission);
        } catch {
          return false;
        }
      });
    }
  }
}