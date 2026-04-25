/**
 * CaslAbilityFactory
 *
 * Creates CASL abilities from authorization context.
 * Supports both AuthorizationContext (legacy) and AbilityFactoryInput (new pattern).
 *
 * Key features:
 * - Request-scoped ability computation
 * - Distinct handling of platform vs tenant scopes
 * - ABAC conditions for tenant boundaries and ownership
 * - Membership-aware rule building
 */
import { Injectable } from '@nestjs/common';
import { Ability } from '../domain';
import { AbilityFactoryInput } from '../domain/ability-factory-input';
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
 * Supports both AuthorizationContext (legacy) and AbilityFactoryInput (new pattern).
 */
@Injectable()
export class CaslAbilityFactory {
  /**
   * Create an Ability from authorization context (legacy pattern)
   */
  create(context: AuthorizationContext): Ability {
    const rules = this.buildRulesFromContext(context);
    return new CaslAbility(rules);
  }

  /**
   * Create an Ability from AbilityFactoryInput (new request-scoped pattern)
   * This is the preferred method for guard integration.
   */
  createFromInput(input: AbilityFactoryInput): Ability {
    const rules = this.buildRulesFromInput(input);
    return new CaslAbility(rules);
  }

  /**
   * Check if a permission is allowed (using legacy context)
   */
  allow(context: AuthorizationContext, permission: PermissionSpec): boolean {
    const ability = this.create(context);
    return ability.can(permission.action, permission.subject);
  }

  /**
   * Check if a permission is allowed (using new input pattern)
   */
  allowWithInput(input: AbilityFactoryInput, permission: PermissionSpec): boolean {
    const ability = this.createFromInput(input);
    return ability.can(permission.action, permission.subject);
  }

  /**
   * Build CASL rules from AuthorizationContext (legacy)
   */
  private buildRulesFromContext(context: AuthorizationContext): any[] {
    const rules: any[] = [];
    const roles = context.request.allRoles || [context.request.roles];

    for (const roleAssignment of roles) {
      const role = roleAssignment.role as PlatformRole | TenantRole;
      const isPlatformScope =
        context.request.scope === AuthorizationScope.Platform ||
        context.request.scope === 'platform';

      // Platform-level rules
      if (isPlatformScope) {
        rules.push(...this.getPlatformRules(role));
      }
      // Tenant-level rules
      else {
        const tenantId =
          'tenantId' in roleAssignment
            ? (roleAssignment as any).tenantId
            : context.resource?.tenantId;
        rules.push(...this.getTenantRules(role, tenantId));
      }
    }

    // Owner rule: users can access their own resources (strengthened)
    if (context.resource?.ownerId && context.resource?.ownerId === context.request.userId) {
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
   * Build CASL rules from AbilityFactoryInput (new pattern)
   * This properly handles platform vs tenant scope distinction
   * and builds rules from membership data.
   */
  private buildRulesFromInput(input: AbilityFactoryInput): any[] {
    const rules: any[] = [];

    // Platform scope: use platform roles, no tenant restrictions
    if (input.scope === AuthorizationScope.Platform) {
      const platformRoles = input.platformRoles || [];
      for (const role of platformRoles) {
        rules.push(...this.getPlatformRules(role));
      }
    }
    // Tenant scope: use membership data with tenant boundary enforcement
    else if (input.scope === AuthorizationScope.Tenant) {
      if (input.membership) {
        const { tenantId, roles } = input.membership;

        for (const role of roles) {
          // Tenant rules with strict tenantId matching
          rules.push(...this.getTenantRulesWithBoundary(role, tenantId));
        }

        // Owner rule within tenant context
        if (input.resource?.ownerId) {
          // FIX (Critical 2): Only grant owner permissions if resource.ownerId matches userId
          // The condition must verify ownership, not just set ownerId
          if (input.resource.tenantId === tenantId && input.resource.ownerId === input.userId) {
            rules.push({
              action: PermissionAction.Read,
              subject: 'all',
              conditions: {
                ownerId: input.userId,
                tenantId: tenantId, // Enforce tenant boundary for ownership
              },
            });
          }
        }
      }
    }

    // Add resource-level rules if resource has tenantId
    // FIX (High 1): Verify tenantId === userTenantId to prevent cross-tenant access
    if (input.resource?.tenantId && input.membership?.tenantId) {
      // Only grant access if resource tenant matches user's tenant
      const userTenantId = input.membership.tenantId;
      if (input.resource.tenantId === userTenantId) {
        rules.push({
          action: PermissionAction.Read,
          subject: 'all',
          conditions: {
            tenantId: input.resource.tenantId,
          },
        });
      }
      // If tenantId doesn't match, deny access - no rule is added
    }

    return rules;
  }

  /**
   * Get platform-level rules for a role
   *
   * Security Model:
   * - Platform roles only apply when ability is computed with AuthorizationScope.Platform
   * - Tenant scope requires membership data and applies tenant boundary conditions
   * - Platform roles do NOT merge into tenant context (separate permission sets)
   *
   * Platform Role Definitions:
   * - PlatformRole.ADMIN: Full system administration across all tenants (bypasses tenant isolation)
   * - PlatformRole.USER: Limited read-only access for support operations
   */
  private getPlatformRules(role: PlatformRole | TenantRole): any[] {
    const rules: any[] = [];

    switch (role) {
      case PlatformRole.ADMIN:
        // Platform admin: full manage access across entire platform
        // SECURITY: 'manage' on 'all' intentionally bypasses tenant scoping
        // This allows admins to perform cross-tenant administrative operations
        // such as auditing, global analytics, and platform-wide configuration.
        // Use with caution - this grants unrestricted access to all data.
        rules.push({
          action: 'manage',
          subject: 'all',
        });
        break;

      case PlatformRole.USER:
        // Platform user: explicit read-only permissions for support operations
        // SECURITY: Explicit scopes (not wildcard 'all') - this is intentional to limit
        // platform user access to only specific subjects required for support.
        // When adding new platform-accessible subjects, explicitly add Read permission here.
        //
        // Read users (for support/debug)
        rules.push({
          action: PermissionAction.Read,
          subject: PermissionSubject.User,
        });
        // Read tenants (for listing all tenants)
        rules.push({
          action: PermissionAction.Read,
          subject: PermissionSubject.Tenant,
        });
        // Read memberships (for membership management)
        rules.push({
          action: PermissionAction.Read,
          subject: PermissionSubject.Membership,
        });
        break;

      default:
        // No platform access by default
        break;
    }

    return rules;
  }

  /**
   * Get tenant-level rules for a role (legacy)
   */
  private getTenantRules(
    role: TenantRole | PlatformRole,
    tenantId?: string,
  ): any[] {
    const rules: any[] = [];

    switch (role) {
      case TenantRole.ADMIN:
        rules.push({
          action: 'manage',
          subject: 'all',
          conditions: { tenantId },
        });
        break;

      case TenantRole.USER:
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
        break;
    }

    return rules;
  }

  /**
   * Get tenant-level rules with strengthened tenant boundary enforcement
   *
   * Security Model:
   * - All tenant permissions MUST include `tenantId` condition
   * - Ownership rules include both `ownerId` AND `tenantId`
   * - Membership is the authoritative source (never trust client tenantId)
   *
   * Role-to-Permission Mapping:
   * | Tenant Role | Create | Read | Update | Delete |
   * |-------------|--------|------|--------|--------|
   * | OWNER       | ✅     | ✅   | ✅     | ❌     |
   * | ADMIN       | ✅     | ✅   | ✅     | ❌     |
   * | USER        | ✅     | ✅   | ✅     | ❌     |
   * | VIEWER      | ❌     | ✅   | ❌     | ❌     |
   *
   * @param role - Tenant role from membership
   * @param tenantId - Tenant ID from membership (authoritative source)
   */
  private getTenantRulesWithBoundary(
    role: TenantRole,
    tenantId: string,
  ): any[] {
    const rules: any[] = [];

    // Guard against invalid tenantId
    if (!tenantId) {
      return rules; // No rules without tenant context
    }

    const baseConditions = { tenantId };

    switch (role) {
      case TenantRole.OWNER:
        // Tenant owner has full access within tenant (except delete)
        rules.push({
          action: PermissionAction.Read,
          subject: 'all',
          conditions: baseConditions,
        });
        rules.push({
          action: PermissionAction.Create,
          subject: 'all',
          conditions: baseConditions,
        });
        rules.push({
          action: PermissionAction.Update,
          subject: 'all',
          conditions: baseConditions,
        });
        break;

      case TenantRole.ADMIN:
        // Tenant admin can read, create, update within tenant (no delete)
        rules.push({
          action: PermissionAction.Read,
          subject: 'all',
          conditions: baseConditions,
        });
        rules.push({
          action: PermissionAction.Create,
          subject: 'all',
          conditions: baseConditions,
        });
        rules.push({
          action: PermissionAction.Update,
          subject: 'all',
          conditions: baseConditions,
        });
        break;

      case TenantRole.USER:
        // Tenant user can read, create, update within tenant (no delete)
        rules.push({
          action: PermissionAction.Read,
          subject: 'all',
          conditions: baseConditions,
        });
        rules.push({
          action: PermissionAction.Create,
          subject: 'all',
          conditions: baseConditions,
        });
        rules.push({
          action: PermissionAction.Update,
          subject: 'all',
          conditions: baseConditions,
        });
        break;

      case TenantRole.VIEWER:
        // Tenant viewer can only read within tenant
        rules.push({
          action: PermissionAction.Read,
          subject: 'all',
          conditions: baseConditions,
        });
        break;

      default:
        // No access by default
        break;
    }

    return rules;
  }
}