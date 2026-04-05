import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/infra/prisma.service';
import { Membership } from '@modules/memberships/domain/membership.entity';
import { PrismaMembershipMapper } from '@modules/memberships/infra/membership-mapper';
import { MembershipRepository } from '@modules/memberships/domain/membership.repository';

@Injectable()
export class PrismaMembershipRepository implements MembershipRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findByUserId(userId: string): Promise<Membership[]> {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
    });
    return memberships.map((membership) =>
      PrismaMembershipMapper.toDomain(membership),
    );
  }

  async findById(id: string): Promise<Membership | null> {
    const prismaMembership = await this.prisma.membership.findUnique({
      where: { id },
    });
    if (!prismaMembership) return null;
    return PrismaMembershipMapper.toDomain(prismaMembership);
  }

  async findAll(): Promise<Membership[]> {
    const prismaMemberships = await this.prisma.membership.findMany({
      where: {},
    });
    return prismaMemberships.map((membership) =>
      PrismaMembershipMapper.toDomain(membership),
    );
  }

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
