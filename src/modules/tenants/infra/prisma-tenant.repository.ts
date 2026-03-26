import { PrismaService } from '@core/infra/prisma.service';
import { Tenant } from '@modules/tenants/domain/tenant.entity';
import { TenantRepository } from '@modules/tenants/domain/tenant.repository';
import { Injectable } from '@nestjs/common';
import { Tenant as PrismaTenant } from '@prisma/client';
import { TenantMapper as PrismaTenantMapper } from '@modules/tenants/infra/tenant-mapper';

@Injectable()
export class PrismaTenantRepository implements TenantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Tenant | null> {
    const tenant: PrismaTenant | null = await this.prisma.tenant.findUnique({
      where: { id },
    });
    if (!tenant) {
      return null;
    }
    return PrismaTenantMapper.toDomain(tenant);
  }

  async findByName(name: string): Promise<Tenant[]> {
    const tenants: PrismaTenant[] = await this.prisma.tenant.findMany({
      where: { name },
    });
    return tenants.map((tenant) => PrismaTenantMapper.toDomain(tenant));
  }

  async findAll(): Promise<Tenant[]> {
    const tenants: PrismaTenant[] = await this.prisma.tenant.findMany();
    return tenants.map((tenant) => PrismaTenantMapper.toDomain(tenant));
  }

  async save(tenant: Tenant): Promise<Tenant> {
    const bdTenant = PrismaTenantMapper.toPersistence(tenant);
    await this.prisma.tenant.upsert({
      where: { id: bdTenant.id },
      update: bdTenant,
      create: bdTenant,
    });
    return PrismaTenantMapper.toDomain(bdTenant);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tenant.delete({ where: { id } });
  }
}
