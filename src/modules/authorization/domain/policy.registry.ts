/**
 * PolicyRegistry Interface
 *
 * Manages permission policies for the application.
 * This is the domain interface that abstracts how policies are defined and resolved.
 *
 * Used by:
 * - Authorization guards to get applicable policies
 * - Services that need to check policy definitions
 */
import { Injectable } from '@nestjs/common';
import { PermissionSpec, PlatformRole, TenantRole } from '@core/domain/authorization';

/**
 * Policy definition
 * Associates roles with permissions
 */
export interface Policy {
  /** Unique policy identifier */
  id: string;

  /** Human-readable policy name */
  name: string;

  /** Roles that are granted by this policy */
  roles: (PlatformRole | TenantRole)[];

  /** Permissions granted to users with the specified roles */
  permissions: PermissionSpec[];
}

/**
 * PolicyRegistry Interface
 *
 * Manages the registration and resolution of permission policies.
 * This is the domain abstraction that allows different implementations.
 */
export interface PolicyRegistry {
  /**
   * Register a new policy
   *
   * @param policy - The policy to register
   */
  register(policy: Policy): void;

  /**
   * Get policy by ID
   *
   * @param id - Policy ID
   * @returns The policy if found, undefined otherwise
   */
  getById(id: string): Policy | undefined;

  /**
   * Get all policies for a given role
   *
   * @param role - The role to get policies for
   * @returns Array of policies that grant permissions to the given role
   */
  getByRole(role: PlatformRole | TenantRole): Policy[];

  /**
   * Get all registered policies
   *
   * @returns Array of all registered policies
   */
  getAll(): Policy[];
}

/**
 * PolicyRegistry token for dependency injection
 */
export const POLICY_REGISTRY = 'POLICY_REGISTRY';

/**
 * Default in-memory PolicyRegistry implementation
 */
@Injectable()
export class InMemoryPolicyRegistry implements PolicyRegistry {
  private policies: Map<string, Policy> = new Map();

  register(policy: Policy): void {
    this.policies.set(policy.id, policy);
  }

  getById(id: string): Policy | undefined {
    return this.policies.get(id);
  }

  getByRole(role: PlatformRole | TenantRole): Policy[] {
    return Array.from(this.policies.values()).filter(p =>
      p.roles.includes(role as any),
    );
  }

  getAll(): Policy[] {
    return Array.from(this.policies.values());
  }
}