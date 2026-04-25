/**
 * AuthorizationMetadata Interface
 *
 * Resolves authorization metadata from routes (controllers, actions).
 * This allows decorators and guards to define permission requirements without
 * hardcoding them in guard logic.
 *
 * Used by:
 * - Authorization guards to get required permissions
 * - Route validation middleware
 */
import { Injectable } from '@nestjs/common';
import { PermissionSpec } from '@core/domain/authorization';

/**
 * Authorization metadata attached to routes
 */
export interface AuthorizationMetadata {
  /** Required permission to access the route (or list of permissions) */
  permission: PermissionSpec | PermissionSpec[];

  /** Optional: custom policy ID to use (overrides permission-based lookup) */
  policyId?: string;

  /** Optional: allow owner-only access (for resource-based permissions) */
  ownerOnly?: boolean;

  /** Optional: require all permissions (AND logic) vs any (OR logic) */
  requireAll?: boolean;

  /** Optional: required scope (platform or tenant) */
  scope?: 'platform' | 'tenant';
}

/**
 * AuthorizationMetadataService Interface
 *
 * Resolves authorization metadata for routes.
 * This allows metadata to be defined via decorators and resolved at runtime.
 * 
 * Note: Setting metadata is done by decorators via Reflector.defineMetadata.
 * This service provides read-only access to that metadata.
 */
export interface AuthorizationMetadataService {
  /**
   * Get authorization metadata for a controller/action
   *
   * @param target - Controller class or route handler
   * @param key - Method name (optional)
   * @returns Authorization metadata if found, undefined otherwise
   */
  getMetadata(
    target: Function,
    key?: string,
  ): AuthorizationMetadata | undefined;
}

/**
 * AuthorizationMetadata token for dependency injection
 */
export const AUTHORIZATION_METADATA = 'AUTHORIZATION_METADATA';

/**
 * Default implementation using NestJS Reflector
 *
 * This implementation reads metadata stored via decorators.
 * The storage is handled by the @Authorize decorator using Reflector.defineMetadata.
 * This service provides the interface for consumers to query metadata.
 */
@Injectable()
export class ReflectorAuthorizationMetadata
  implements AuthorizationMetadataService
{
  private readonly METADATA_KEY = 'authorization';

  getMetadata(
    target: Function,
    key?: string,
  ): AuthorizationMetadata | undefined {
    return Reflect.getMetadata(this.METADATA_KEY, target) as
      | AuthorizationMetadata
      | undefined;
  }
}