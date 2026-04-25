import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/infra/prisma.service';
import { User } from '@modules/users/domain/user.entity';
import { PrismaUserMapper } from '@modules/users/infra/user-mapper';
import { UserRepository } from '@modules/users/domain/user.repository';
import { User as PrismaUser } from '@prisma/client';

/**
 * PrismaUserRepository - Prisma implementation of UserRepository.
 *
 * SECURITY CONTRACT:
 * - Tenant-scoped methods ALWAYS apply tenantId filter in Prisma queries.
 * - Platform methods (findById, findByEmail) do NOT apply tenant filtering.
 * - findAll() is deprecated - use findAllByTenant() instead.
 *
 * QUERY SAFETY:
 * - All tenant-scoped queries use Prisma's `where: { tenantId, ... }` pattern.
 * - Tenant-scoped methods ignore any external tenantId and use the provided parameter.
 * - Platform queries can optionally filter by tenantId (for admin dashboards).
 */
@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ============== TENANT-SCOPED IMPLEMENTATIONS ==============

  /**
   * Find all users within a specific tenant.
   * Enforces tenant isolation at the query level.
   */
  async findAllByTenant(tenantId: string): Promise<User[]> {
    const prismaUsers: PrismaUser[] = await this.prisma.user.findMany({
      where: { tenantId },
    });
    return prismaUsers.map((prismaUser) =>
      PrismaUserMapper.toDomain(prismaUser),
    );
  }

  /**
   * Find a user by ID within a specific tenant's scope.
   * Returns null if user exists but belongs to a different tenant.
   */
  async findByIdScoped(id: string, tenantId: string): Promise<User | null> {
    const prismaUser: PrismaUser | null = await this.prisma.user.findFirst({
      where: { id, tenantId },
    });
    if (!prismaUser) return null;
    return PrismaUserMapper.toDomain(prismaUser);
  }

  /**
   * Find users by name within a specific tenant.
   * Exact match on name within tenant scope.
   */
  async findByNameScoped(
    name: string,
    tenantId: string,
  ): Promise<User[]> {
    const prismaUsers: PrismaUser[] = await this.prisma.user.findMany({
      where: { name, tenantId },
    });
    return prismaUsers.map((prismaUser) =>
      PrismaUserMapper.toDomain(prismaUser),
    );
  }

  /**
   * Find a user by email within a specific tenant's scope.
   * Returns null if user exists but belongs to a different tenant.
   */
  async findByEmailScoped(
    email: string,
    tenantId: string,
  ): Promise<User | null> {
    const prismaUser: PrismaUser | null = await this.prisma.user.findFirst({
      where: { email, tenantId },
    });
    if (!prismaUser) return null;
    return PrismaUserMapper.toDomain(prismaUser);
  }

  // ============== PLATFORM-LEVEL IMPLEMENTATIONS ==============

  /**
   * Find a user by ID at platform level.
   * WARNING: This method does NOT enforce tenant filtering.
   * Only use this when operating at platform scope.
   */
  async findById(id: string): Promise<User | null> {
    const prismaUser: PrismaUser | null = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!prismaUser) return null;
    return PrismaUserMapper.toDomain(prismaUser);
  }

  /**
   * Find a user by email at platform level.
   * WARNING: This method does NOT enforce tenant filtering.
   * Only use this when operating at platform scope.
   */
  async findByEmail(email: string): Promise<User | null> {
    const prismaUser: PrismaUser | null = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!prismaUser) return null;
    return PrismaUserMapper.toDomain(prismaUser);
  }

  /**
   * Count all users platform-wide.
   * Only use this when operating at platform scope.
   */
  async count(): Promise<number> {
    return this.prisma.user.count();
  }

  // ============== PERSISTENCE IMPLEMENTATIONS ==============

  async save(user: User): Promise<User> {
    const prismaUser = PrismaUserMapper.toPersistence(user);
    await this.prisma.user.upsert({
      where: { id: prismaUser.id },
      update: prismaUser,
      create: prismaUser,
    });
    return user;
  }

  async delete(id: string): Promise<void> {
    return this.prisma.user.delete({ where: { id } }).then(() => {});
  }
}