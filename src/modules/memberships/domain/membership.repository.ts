import { Membership } from '@modules/memberships/domain/membership.entity';

/**
 * MembershipRepository - Contract for membership data access.
 *
 * SECURITY MODEL:
 * - Memberships are tenant-scoped by nature (userId + tenantId relationship).
 * - All list/search operations MUST be tenant-scoped.
 * - Platform users may query memberships within a specific tenant.
 *
 * SCOPING RULES:
 * - findAllByTenant(tenantId): Returns all memberships within the tenant.
 * - findByIdScoped(id, tenantId): Returns membership only if it belongs to the tenant.
 * - findByUserIdScoped(userId, tenantId): Returns user's memberships within tenant.
 *
 * CROSS-TENANT PREVENTION:
 * - Memberships link users to tenants - cross-tenant access would expose user invitations.
 * - No unscoped global list operations exist for memberships.
 */
export abstract class MembershipRepository {
  // ============== TENANT-SCOPED METHODS ==============

  /**
   * Find all memberships within a specific tenant.
   * @param tenantId - The tenant whose memberships to retrieve
   * @returns Array of all memberships in the tenant
   */
  abstract findAllByTenant(tenantId: string): Promise<Membership[]>;

  /**
   * Find a membership by ID within a specific tenant's scope.
   * @param id - Membership ID to find
   * @param tenantId - Tenant scope to search within
   * @returns Membership if found within tenant, null otherwise
   */
  abstract findByIdScoped(id: string, tenantId: string): Promise<Membership | null>;

  /**
   * Find all memberships for a user within a specific tenant.
   * @param userId - User whose memberships to find
   * @param tenantId - Tenant scope to search within
   * @returns Array of user's memberships in the tenant
   */
  abstract findByUserIdScoped(userId: string, tenantId: string): Promise<Membership[]>;

  // ============== PERSISTENCE METHODS ==============

  /**
   * Save (create or update) a membership.
   * @param membership - Membership entity to persist
   * @returns The saved membership
   */
  abstract save(membership: Membership): Promise<Membership>;

  /**
   * Delete a membership by ID.
   * @param id - Membership ID to delete
   */
  abstract delete(id: string): Promise<void>;
}