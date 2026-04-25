import { User } from '@modules/users/domain/user.entity';

/**
 * UserRepository - Contract for user data access.
 *
 * SECURITY MODEL:
 * - Tenant-scoped users: Operations MUST use tenant-scoped methods.
 * - Platform users: Can optionally provide tenantId for filtering, or query globally.
 * - No method can return cross-tenant data without explicit platform scope.
 *
 * SCOPING RULES:
 * - findAllByTenant(tenantId): Returns only users within the specified tenant.
 * - findByIdScoped(id, tenantId): Returns user only if they belong to the tenant.
 * - findByNameScoped(name, tenantId): Returns users with matching name within tenant.
 * - findByEmailScoped(email, tenantId): Returns user with matching email within tenant.
 *
 * UNSCOPED METHODS (Platform only):
 * - findById(id): Platform-level lookup by ID. Returns user regardless of tenant membership.
 * - findByEmail(email): Platform-level lookup by email. Returns user regardless of tenant membership.
 * - count(): Platform-wide user count.
 *
 * DEPRECATED/UNSAFE METHODS:
 * - findAll(): DEPRECATED - Use findAllByTenant() instead. Global list is a security risk.
 * - findByName(name, tenantId): DEPRECATED - Use findByNameScoped() instead.
 */
export abstract class UserRepository {
  // ============== TENANT-SCOPED METHODS ==============
  // These methods REQUIRE explicit tenantId parameter.
  // Used by tenant-scoped requests to access tenant-bound user data.

  /**
   * Find all users within a specific tenant.
   * @param tenantId - The tenant whose users to retrieve
   * @returns Array of users belonging to the tenant
   */
  abstract findAllByTenant(tenantId: string): Promise<User[]>;

  /**
   * Find a user by ID within a specific tenant's scope.
   * @param id - User ID to find
   * @param tenantId - Tenant scope to search within
   * @returns User if found within tenant, null otherwise
   */
  abstract findByIdScoped(id: string, tenantId: string): Promise<User | null>;

  /**
   * Find users by name within a specific tenant.
   * @param name - Name pattern to search for (exact match)
   * @param tenantId - Tenant scope to search within
   * @returns Array of users with matching name in the tenant
   */
  abstract findByNameScoped(
    name: string,
    tenantId: string,
  ): Promise<User[]>;

  /**
   * Find a user by email within a specific tenant's scope.
   * @param email - Email to search for
   * @param tenantId - Tenant scope to search within
   * @returns User if found within tenant, null otherwise
   */
  abstract findByEmailScoped(
    email: string,
    tenantId: string,
  ): Promise<User | null>;

  // ============== PLATFORM-LEVEL METHODS ==============
  // These methods do NOT enforce tenant filtering.
  // They are safe only when called by platform-scoped operations.

  /**
   * Find a user by ID at platform level.
   * WARNING: Returns user regardless of tenant membership.
   * @param id - User ID to find
   * @returns User if found, null otherwise
   */
  abstract findById(id: string): Promise<User | null>;

  /**
   * Find a user by email at platform level.
   * WARNING: Returns user regardless of tenant membership.
   * @param email - Email to search for
   * @returns User if found, null otherwise
   */
  abstract findByEmail(email: string): Promise<User | null>;

  /**
   * Count all users platform-wide.
   * @returns Total number of users
   */
  abstract count(): Promise<number>;

  // ============== PERSISTENCE METHODS ==============

  /**
   * Save (create or update) a user.
   * @param user - User entity to persist
   * @returns The saved user
   */
  abstract save(user: User): Promise<User>;

  /**
   * Delete a user by ID.
   * @param id - User ID to delete
   */
  abstract delete(id: string): Promise<void>;
}