/**
 * AuthorizationService
 *
 * Orchestrates authorization operations by combining the domain interfaces.
 * This is the application layer that provides a high-level API for authorization.
 */
import { Injectable, Inject, Optional, Logger } from '@nestjs/common';
import type {
  AuthorizationContext,
  RoleAssignment,
  AuthorizationScope,
  PermissionSpec,
} from '@core/domain/authorization';
import type {
  AbilityFactory,
  PolicyRegistry,
  AuthorizationMetadataService,
  AbilityFactoryInput,
} from '../domain';
import {
  ABILITY_FACTORY,
  POLICY_REGISTRY,
  AUTHORIZATION_METADATA,
} from '../domain';
import type { AuthorizationMetadata } from '../domain/authorization-metadata';

/**
 * Options for creating authorization context
 *
 * The roles field should contain the resolved RoleAssignment from the auth token.
 * Use AuthorizationContextHelpers.fromTokenPayload() or extract from request.
 */
export type CreateContextOptions = {
  /** User ID */
  userId: string;
  /** Authorization scope */
  scope: AuthorizationScope;
  /** Role assignment(s) - use RoleAssignment or RoleAssignment[] */
  roles: RoleAssignment | RoleAssignment[];
  /** JWT ID for token tracking */
  jti?: string;
};

/**
 * Result of a permission check
 */
export type PermissionCheckResult = {
  /** Whether the permission is allowed */
  allowed: boolean;
  /** The authorization context used for the check */
  context: AuthorizationContext;
  /** Error message if not allowed */
  error?: string;
};

@Injectable()
export class AuthorizationService {
  private readonly logger = new Logger(AuthorizationService.name);

  constructor(
    @Optional()
    @Inject(ABILITY_FACTORY)
    private readonly abilityFactory?: AbilityFactory,

    @Optional()
    @Inject(POLICY_REGISTRY)
    private readonly policyRegistry?: PolicyRegistry,

    @Optional()
    @Inject(AUTHORIZATION_METADATA)
    private readonly metadataService?: AuthorizationMetadataService,
  ) {
    // Warn about missing dependencies in constructor (Medium issue 6)
    if (!abilityFactory) {
      this.logger.warn(
        'AbilityFactory not configured - all permission checks will be denied. Provide ABILITY_FACTORY to enable authorization.',
      );
    }
    if (!policyRegistry) {
      this.logger.warn(
        'PolicyRegistry not configured - policy-based authorization unavailable.',
      );
    }
    if (!metadataService) {
      this.logger.warn(
        'AuthorizationMetadataService not configured - route metadata unavailable.',
      );
    }
  }

  createContext(options: CreateContextOptions): AuthorizationContext {
    const roles = Array.isArray(options.roles)
      ? options.roles
      : [options.roles];

    const primaryRole = roles[0]!;

    return {
      request: {
        userId: options.userId,
        scope: options.scope,
        // Store primary role for backward compatibility (single role field)
        roles: primaryRole,
        // Store all roles for multi-role authorization
        allRoles: roles,
        jti: options.jti,
      },
    };
  }

  can(
    context: AuthorizationContext,
    permission: PermissionSpec,
  ): PermissionCheckResult {
    if (!this.abilityFactory) {
      return {
        allowed: false,
        context,
        error: 'AbilityFactory not configured',
      };
    }

    const allowed = this.abilityFactory.allow(context, permission);
    return {
      allowed,
      context,
      error: allowed
        ? undefined
        : `Permission denied: ${permission.action} ${permission.subject}`,
    };
  }

  canWithContext(
    options: CreateContextOptions,
    permission: PermissionSpec,
  ): PermissionCheckResult {
    const context = this.createContext(options);
    return this.can(context, permission);
  }

  /**
   * Check permission using AbilityFactoryInput (new request-scoped pattern)
   * This is the preferred method for guard integration.
   */
  canWithInput(
    input: AbilityFactoryInput,
    permission: PermissionSpec,
  ): PermissionCheckResult {
    if (!this.abilityFactory) {
      return {
        allowed: false,
        context: {
          request: { userId: input.userId, scope: input.scope, roles: {} },
        },
        error: 'AbilityFactory not configured',
      };
    }

    const factory = this.abilityFactory as any;
    let allowed: boolean;

    if (typeof factory.allowWithInput === 'function') {
      allowed = factory.allowWithInput(input, permission);
    } else {
      // Fall back to legacy context format
      const context = {
        request: {
          userId: input.userId,
          scope: input.scope,
          roles:
            input.scope === AuthorizationScope.Platform
              ? {
                  scope: AuthorizationScope.Platform,
                  role: input.platformRoles?.[0] || 'USER',
                }
              : {
                  scope: AuthorizationScope.Tenant,
                  role: input.membership?.roles?.[0] || 'USER',
                  tenantId: input.membership?.tenantId,
                },
        },
        resource: input.resource,
      };
      allowed = factory.allow(context, permission);
    }

    return {
      allowed,
      context: {
        request: { userId: input.userId, scope: input.scope, roles: {} },
      },
      error: allowed
        ? undefined
        : `Permission denied: ${permission.action} ${permission.subject}`,
    };
  }

  getRouteMetadata(
    target: Function,
    key?: string,
  ): AuthorizationMetadata | undefined {
    if (!this.metadataService) {
      return undefined;
    }
    return this.metadataService.getMetadata(target, key);
  }

  isConfigured(): boolean {
    return (
      !!this.abilityFactory && !!this.policyRegistry && !!this.metadataService
    );
  }
}
