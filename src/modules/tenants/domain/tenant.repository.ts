import { Tenant } from '@modules/tenants/domain/tenant.entity';

/**
 * TenantRepository - Contract for tenant data access.
 *
 * SECURITY MODEL:
 * - Tenants are platform-level entities (they ARE the tenant container).
 * - Platform users can query all tenants or filter by tenantId.
 * - Tenant-scoped users cannot query tenants (they ARE within a tenant).
 *
 * OPTIONAL TENANT FILTERING:
 * - Platform queries support optional tenantId for targeted lookups.
 * - Tenant-scoped users should not use this repository directly.
 *
 * SCOPING RULES:
 * - findById(id): Platform-level lookup. Always available.
 * - findByIdWithOptionalTenant(id, tenantId?): Platform lookup with optional tenant filter.
 * - findByName(name, tenantId?): Platform name search with optional tenant filter.
 * - findByTenantId(tenantId): Returns a single tenant (if exists) for platform admin queries.
 * - findAll(): Platform-wide tenant list. Requires platform scope.
 */
export abstract class TenantRepository {
  // ============== PLATFORM-LEVEL METHODS ==============

  /**
   * Find a tenant by ID.
   * @param id - Tenant ID to find
   * @returns Tenant if found, null otherwise
   */
  abstract findById(id: string): Promise<Tenant | null>;

  /**
   * Find a tenant by ID with optional tenant scope filter.
   * @param id - Tenant ID to find
   * @param tenantId - Optional tenant filter (for platform admin with context)
   * @returns Tenant if found and matches filter (if provided), null otherwise
   */
  abstract findByIdWithOptionalTenant(
    id: string,
    tenantId?: string,
  ): Promise<Tenant | null>;

  /**
   * Find tenants by name.
   * @param name - Name pattern to search for (exact match)
   * @param tenantId - Optional tenant filter (for platform admin with context)
   * @returns Array of matching tenants
   */
  abstract findByName(
    name: string,
    tenantId?: string,
  ): Promise<Tenant[]>;

  /**
   * Find all tenants.
   * WARNING: Only available to platform-scoped operations.
   * @returns Array of all tenants
   */
  abstract findAll(): Promise<Tenant[]>;

  /**
   * Find a specific tenant by its tenantId.
   * This is the "find by tenant" equivalent for platform admin lookups.
   * @param tenantId - The tenantId to find
   * @returns Tenant if found, null otherwise
   */
  abstract findByTenantId(tenantId: string): Promise<Tenant | null>;

  // ============== PERSISTENCE METHODS ==============

  /**
   * Save (create or update) a tenant.
   * @param tenant - Tenant entity to persist
   * @returns The saved tenant
   */
  abstract save(tenant: Tenant): Promise<Tenant>;

  /**
   * Delete a tenant by ID.
   * @param id - Tenant ID to delete
   */
  abstract delete(id: string): Promise<void>;
}