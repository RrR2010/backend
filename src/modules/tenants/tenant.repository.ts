import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { Tenant } from '@tenants/tenant.entity'
import { Tenant as PrismaTenant, Prisma } from '@prisma/client'
import { Id } from '@shared/value-objects'
import { SystemState } from '@shared/enums'
import { Json } from '@shared/types'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

export abstract class TenantRepository {
  abstract findById(id: string, ctx: RequestContext): Promise<Tenant | null>
  abstract findAll(filter: TenantFilter, ctx: RequestContext): Promise<Tenant[]>
  abstract save(tenant: Tenant, ctx: RequestContext): Promise<Tenant>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

export type TenantFilter = {
  name?: string
  systemState?: SystemState
}

@Injectable()
export class PrismaTenantRepository implements TenantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, ctx: RequestContext): Promise<Tenant | null> {
    const where: Prisma.TenantWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.id = ctx.tenantId
    }
    const prismaTenant = await this.prisma.tenant.findUnique({ where })
    if (!prismaTenant) return null
    return PrismaTenantMapper.toDomain(prismaTenant)
  }

  async findAll(filter: TenantFilter, ctx: RequestContext): Promise<Tenant[]> {
    const where: Prisma.TenantWhereInput = {}

    if (ctx.scope === UserScope.TENANT) {
      where.id = ctx.tenantId
    }

    if (filter.name) {
      where.name = { contains: filter.name, mode: 'insensitive' }
    }
    if (filter.systemState) {
      where.systemState = filter.systemState
    }

    const prismaTenants = await this.prisma.tenant.findMany({ where })
    return prismaTenants.map((prismaTenant) =>
      PrismaTenantMapper.toDomain(prismaTenant)
    )
  }

  async save(tenant: Tenant, ctx: RequestContext): Promise<Tenant> {
    if (ctx.scope === UserScope.TENANT && tenant.id.value !== ctx.tenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const prismaTenant = PrismaTenantMapper.toPersistence(tenant)
    await this.prisma.tenant.upsert({
      where: { id: tenant.id.value },
      update: prismaTenant,
      create: prismaTenant
    })
    return tenant
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.TenantWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.id = ctx.tenantId
    }
    await this.prisma.tenant.delete({ where })
  }
}

class PrismaTenantMapper {
  static toDomain(prismaTenant: PrismaTenant): Tenant {
    return Tenant.rehydrate({
      id: Id.from(prismaTenant.id),
      createdAt: prismaTenant.createdAt,
      updatedAt: prismaTenant.updatedAt,
      systemState:
        SystemState[prismaTenant.systemState as keyof typeof SystemState],
      name: prismaTenant.name,
      slug: prismaTenant.slug,
      website: prismaTenant.website,
      locale: prismaTenant.locale,
      timezone: prismaTenant.timezone,
      language: prismaTenant.language,
      logoUrl: prismaTenant.logoUrl,
      settings: prismaTenant.settings as Json | null
    })
  }

  static toPersistence(tenant: Tenant): Prisma.TenantUncheckedCreateInput {
    return {
      id: tenant.id.value,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
      systemState: tenant.systemState,
      name: tenant.name,
      slug: tenant.slug,
      website: tenant.website,
      locale: tenant.locale,
      timezone: tenant.timezone,
      language: tenant.language,
      logoUrl: tenant.logoUrl,
      settings:
        tenant.settings === null
          ? Prisma.JsonNull
          : (tenant.settings as Prisma.InputJsonValue)
    }
  }
}
