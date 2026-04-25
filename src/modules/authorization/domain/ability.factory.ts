/**
 * AbilityFactory Interface
 *
 * Creates CASL abilities from authorization context.
 * This is the domain interface that abstracts the ability construction logic.
 *
 * Used by:
 * - Authorization guards to check permissions
 * - Services that need inline permission checks
 */
import { Injectable } from '@nestjs/common';
import type {
  AuthorizationContext,
  PermissionSpec,
} from '@core/domain/authorization';
import { PermissionAction } from '@core/domain/authorization';

/**
 * CASL Ability type - represents what a user can do
 *
 * The actual type depends on the CASL implementation.
 * This interface abstracts that detail.
 */
export interface Ability {
  /**
   * Check if the ability allows the given action on the given subject
   */
  can(action: PermissionAction, subject: string | object): boolean;

  /**
   * Get the currently active rules for debugging/logging
   */
  getActiveRules?(): unknown[];
}

/**
 * AbilityFactory Interface
 *
 * Creates Ability instances from AuthorizationContext.
 * This is the domain abstraction that allows different implementations
 * (CASL, simple-based, etc.) to be plugged in.
 */
export interface AbilityFactory {
  /**
   * Create an Ability instance from authorization context
   *
   * @param context - The authorization context (who is making the request, what resource)
   * @returns Ability instance that can be queried for permissions
   */
  create(context: AuthorizationContext): Ability;

  /**
   * Check if a specific permission is allowed
   *
   * This is a convenience method that combines create + can
   *
   * @param context - The authorization context
   * @param permission - The permission to check
   * @returns true if allowed, false otherwise
   */
  allow(context: AuthorizationContext, permission: PermissionSpec): boolean;
}

/**
 * AbilityFactory token for dependency injection
 */
export const ABILITY_FACTORY = 'ABILITY_FACTORY';

/**
 * Default AbilityFactory implementation
 *
 * This is a no-op placeholder that should be replaced
 * by CaslAbilityFactory in the infra layer.
 */
@Injectable()
export class DefaultAbilityFactory implements AbilityFactory {
  create(context: AuthorizationContext): Ability {
    // Default no-op implementation - always denies
    return {
      can() {
        return false;
      },
      getActiveRules: () => [],
    };
  }

  allow(context: AuthorizationContext, permission: PermissionSpec): boolean {
    const ability = this.create(context);
    return ability.can(permission.action, permission.subject);
  }
}