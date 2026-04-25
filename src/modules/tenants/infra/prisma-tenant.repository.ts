import { PrismaService } from '@core/infra/prisma.service';
import { Tenant } from '@modules/tenants/domain/tenant.entity';
import { TenantRepository } from '@modules/tenants/domain/tenant.repository';
import { Injectable } from '@nestjs/common';
import { Tenant as PrismaTenant } from '@prisma/client';
import { TenantMapper } from '@modules/tenants/infra/tenant-mapper';

/**
 * PrismaTenantRepository - Prisma implementation of TenantRepository.
 *
 * SECURITY CONTRACT:
 * - Tenants are platform-level entities.
 * - All methods are available to platform-scoped operations.
 * - Optional tenantId parameter enables targeted platform admin queries.
 *
 * QUERY SAFETY:
 * - Platform queries can optionally filter by tenantId when context is available.
 * - All lookups support optional tenant filtering for admin dashboard scenarios.
 */
@Injectable()
export class PrismaTenantRepository implements TenantRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find a tenant by ID at platform level.
   * Always available for platform-scoped queries.
   */
  async findById(id: string): Promise<Tenant | null> {
    const tenant: PrismaTenant | null = await this.prisma.tenant.findUnique({
      where: { id },
    });
    if (!tenant) {
      return null;
    }
    return TenantMapper.toDomain(tenant);
  }

  /**
   * Find a tenant by ID with optional tenant filter.
   * If tenantId is provided, validates the tenant matches.
   * If tenantId is undefined, performs global lookup (platform scope required).
   */
  async findByIdWithOptionalTenant(
    id: string,
    tenantId?: string,
  ): Promise<Tenant | null> {
    if (tenantId) {
      // Platform admin querying with tenant context
      const tenant: PrismaTenant | null = await this.prisma.tenant.findFirst({
        where: { id, tenantId },
      });
      if (!tenant) return null;
      return TenantMapper.toDomain(tenant);
    }
    // Global platform lookup
    return this.findById(id);
  }

  /**
   * Find tenants by name with optional tenant filter.
   * If tenantId is provided, filters results to that tenant.
   */
  async findByName(name: string, tenantId?: string): Promise<Tenant[]> {
    const whereClause = tenantId ? { name, tenantId } : { name };
    const tenants: PrismaTenant[] = await this.prisma.tenant.findMany({
      where: whereClause,
    });
    return tenants.map((tenant) => TenantMapper.toDomain(tenant));
  }

  /**
   * Find all tenants platform-wide.
   * WARNING: Only available to platform-scoped operations.
   */
  async findAll(): Promise<Tenant[]> {
    const tenants: PrismaTenant[] = await this.prisma.tenant.findMany();
    return tenants.map((tenant) => TenantMapper.toDomain(tenant));
  }

  /**
   * Find a specific tenant by its tenantId.
   * Equivalent to findById for platform admin lookups.
   */
  async findByTenantId(tenantId: string): Promise<Tenant | null> {
    return this.findById(tenantId);
  }

  async save(tenant: Tenant): Promise<Tenant> {
    const bdTenant = TenantMapper.toPersistence(tenant);
    await this.prisma.tenant.upsert({
      where: { id: bdTenant.id },
      update: bdTenant,
      create: bdTenant,
    });
    return TenantMapper.toDomain(bdTenant);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tenant.delete({ where: { id } });
  }
}