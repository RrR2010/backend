/**
 * CaslAbilityFactory
 *
 * CASL-specific implementation of the AbilityFactory interface.
 * This creates CASL abilities from authorization context.
 *
 * Note: This is a placeholder implementation.
 * Full integration with nest-casl will be done in a later task.
 */
import { Injectable, Inject, Optional } from '@nestjs/common';
import {
  Ability,
  ABILITY_FACTORY,
} from '../domain';
import {
  AuthorizationContext,
  PermissionAction,
  PermissionSubject,
  AuthorizationScope,
  PlatformRole,
  TenantRole,
  PermissionSpec,
} from '@core/domain/authorization';

/**
 * CASL alias for actions
 */
type CaslAction = PermissionAction | 'manage';

/**
 * CASL subject definition
 */
interface CaslSubject {
  /** Subject type name */
  type: string;

  /** Optional: subject instance ID */
  id?: string;

  /** Optional: owner field */
  ownerId?: string;

  /** Optional: tenant field */
  tenantId?: string;

  /** Optional: arbitrary fields */
  [key: string]: unknown;
}

/**
 * CASL Ability implementation
 *
 * Uses @casl/ability under the hood
 */
class CaslAbility implements Ability {
  private readonly rules: any[] = [];

  constructor(rules: any[]) {
    this.rules = rules;
  }

  can(action: PermissionAction, subject: string | object): boolean {
    const subjectName =
      typeof subject === 'string' ? subject : (subject as any).type;

    // Simple rule matching - expand this per actual CASL integration
    return this.rules.some(rule => {
      if (rule.action === 'manage') {
        return true;
      }
      if (rule.action !== action && rule.action !== '*') {
        return false;
      }
      if (typeof rule.subject === 'string') {
        return rule.subject === subjectName;
      }
      if (rule.subject === 'all') {
        return true;
      }
      return false;
    });
  }

  getActiveRules(): unknown[] {
    return this.rules;
  }
}

/**
 * CaslAbilityFactory
 *
 * Creates CASL abilities from authorization context.
 * This is a basic implementation that can be expanded.
 */
@Injectable()
export class CaslAbilityFactory {
  /**
   * Create an Ability from authorization context
   */
  create(context: AuthorizationContext): Ability {
    const rules = this.buildRules(context);
    return new CaslAbility(rules);
  }

  /**
   * Check if a permission is allowed
   */
  allow(context: AuthorizationContext, permission: PermissionSpec): boolean {
    const ability = this.create(context);
    return ability.can(permission.action, permission.subject);
  }

  /**
   * Build CASL rules from authorization context
   */
  private buildRules(context: AuthorizationContext): any[] {
    const rules: any[] = [];
    const roles = context.request.allRoles || [context.request.roles];

    for (const roleAssignment of roles) {
      const role = roleAssignment.role as PlatformRole | TenantRole;

      // Platform-level rules
      if (
        context.request.scope === AuthorizationScope.Platform ||
        context.request.scope === 'platform'
      ) {
        rules.push(...this.getPlatformRules(role));
      }
      // Tenant-level rules
      else {
        rules.push(
          ...this.getTenantRules(
            role,
            roleAssignment.tenantId || context.resource?.tenantId,
          ),
        );
      }
    }

    // Owner rule: users can always access their own resources
    if (context.resource?.ownerId) {
      rules.push({
        action: PermissionAction.Read,
        subject: 'all',
        conditions: {
          ownerId: context.request.userId,
        },
      });
    }

    return rules;
  }

  /**
   * Get platform-level rules for a role
   * Uses typed PlatformRole enum (Low issue 7)
   */
  private getPlatformRules(role: PlatformRole | TenantRole): any[] {
    const rules: any[] = [];

    switch (role) {
      case PlatformRole.ADMIN:
        // Platform admin can do everything
        rules.push({
          action: 'manage',
          subject: 'all',
        });
        break;

      case PlatformRole.USER:
        // Platform user can read platform resources
        rules.push({
          action: PermissionAction.Read,
          subject: PermissionSubject.User,
        });
        rules.push({
          action: PermissionAction.Read,
          subject: PermissionSubject.Tenant,
        });
        break;

      default:
        // Default: read-only
        rules.push({
          action: PermissionAction.Read,
          subject: 'all',
        });
    }

    return rules;
  }

  /**
   * Get tenant-level rules for a role
   * Uses typed TenantRole enum (Low issue 7)
   */
  private getTenantRules(
    role: TenantRole | PlatformRole,
    tenantId?: string,
  ): any[] {
    const rules: any[] = [];

    switch (role) {
      case TenantRole.ADMIN:
        // Tenant admin can manage most things
        rules.push({
          action: 'manage',
          subject: 'all',
          conditions: { tenantId },
        });
        break;

      case TenantRole.USER:
        // Tenant user can read and create
        rules.push({
          action: PermissionAction.Read,
          subject: 'all',
          conditions: { tenantId },
        });
        rules.push({
          action: PermissionAction.Create,
          subject: 'all',
          conditions: { tenantId },
        });
        break;

      default:
        // Default: no access
        break;
    }

    return rules;
  }
}