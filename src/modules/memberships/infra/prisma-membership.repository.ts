import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/infra/prisma.service';
import { Membership } from '@modules/memberships/domain/membership.entity';
import { PrismaMembershipMapper } from '@modules/memberships/infra/membership-mapper';
import { MembershipRepository } from '@modules/memberships/domain/membership.repository';

/**
 * PrismaMembershipRepository - Prisma implementation of MembershipRepository.
 *
 * SECURITY CONTRACT:
 * - All query methods enforce tenant scoping at the Prisma query level.
 * - Memberships are inherently tenant-scoped (userId + tenantId relationship).
 * - Cross-tenant queries are impossible without explicit platform override.
 *
 * QUERY SAFETY:
 * - All tenant-scoped queries use Prisma's `where: { tenantId, ... }` pattern.
 * - findAllByTenant(): Returns all memberships within a tenant.
 * - findByIdScoped(): Ensures membership belongs to the specified tenant.
 * - findByUserIdScoped(): Ensures both userId AND tenantId match.
 */
@Injectable()
export class PrismaMembershipRepository implements MembershipRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ============== TENANT-SCOPED IMPLEMENTATIONS ==============

  /**
   * Find all memberships within a specific tenant.
   * Enforces tenant isolation at the query level.
   */
  async findAllByTenant(tenantId: string): Promise<Membership[]> {
    const prismaMemberships = await this.prisma.membership.findMany({
      where: { tenantId },
    });
    return prismaMemberships.map((membership) =>
      PrismaMembershipMapper.toDomain(membership),
    );
  }

  /**
   * Find a membership by ID within a specific tenant's scope.
   * Returns null if membership belongs to a different tenant.
   */
  async findByIdScoped(
    id: string,
    tenantId: string,
  ): Promise<Membership | null> {
    const prismaMembership = await this.prisma.membership.findFirst({
      where: { id, tenantId },
    });
    if (!prismaMembership) return null;
    return PrismaMembershipMapper.toDomain(prismaMembership);
  }

  /**
   * Find all memberships for a user within a specific tenant.
   * Enforces both userId AND tenantId to prevent cross-tenant data leakage.
   */
  async findByUserIdScoped(
    userId: string,
    tenantId: string,
  ): Promise<Membership[]> {
    const memberships = await this.prisma.membership.findMany({
      where: { userId, tenantId },
    });
    return memberships.map((membership) =>
      PrismaMembershipMapper.toDomain(membership),
    );
  }

  // ============== PERSISTENCE IMPLEMENTATIONS ==============

  async save(membership: Membership): Promise<Membership> {
    const prismaMembership = PrismaMembershipMapper.toPersistence(membership);
    await this.prisma.membership.upsert({
      where: { id: prismaMembership.id },
      update: prismaMembership,
      create: prismaMembership,
    });
    return membership;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.membership.delete({ where: { id } });
  }
}