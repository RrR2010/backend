import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { TenantSite } from '@tenant-sites/tenant-site.entity'
import { TenantSiteType, SystemState } from '@shared/enums'
import { Id } from '@shared/value-objects'
import { TenantSite as PrismaTenantSite, Prisma } from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

export interface TenantSiteFilter {
  tenantId?: string
  siteType?: TenantSiteType
  isHeadquarters?: boolean
}

export abstract class TenantSiteRepository {
  abstract findById(id: string, ctx: RequestContext): Promise<TenantSite | null>
  abstract findAll(
    filter: TenantSiteFilter,
    ctx: RequestContext
  ): Promise<TenantSite[]>
  abstract save(
    tenantSite: TenantSite,
    ctx: RequestContext
  ): Promise<TenantSite>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaTenantSiteRepository implements TenantSiteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, ctx: RequestContext): Promise<TenantSite | null> {
    const where: Prisma.TenantSiteWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    const prismaTenantSite = await this.prisma.tenantSite.findUnique({
      where
    })
    if (!prismaTenantSite) return null
    return PrismaTenantSiteMapper.toDomain(prismaTenantSite)
  }

  async findAll(
    filter: TenantSiteFilter,
    ctx: RequestContext
  ): Promise<TenantSite[]> {
    const where: Prisma.TenantSiteWhereInput = {
      ...(filter.tenantId && { tenantId: filter.tenantId }),
      ...(filter.siteType && { siteType: filter.siteType }),
      ...(filter.isHeadquarters !== undefined && {
        isHeadquarters: filter.isHeadquarters
      })
    }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    const prismaTenantSites = await this.prisma.tenantSite.findMany({
      where
    })
    return prismaTenantSites.map((site) =>
      PrismaTenantSiteMapper.toDomain(site)
    )
  }

  async save(tenantSite: TenantSite, ctx: RequestContext): Promise<TenantSite> {
    if (
      ctx.scope === UserScope.TENANT &&
      tenantSite.tenantId !== ctx.tenantId
    ) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const prismaTenantSite = PrismaTenantSiteMapper.toPersistence(tenantSite)
    await this.prisma.tenantSite.upsert({
      where: { id: prismaTenantSite.id },
      update: prismaTenantSite,
      create: prismaTenantSite
    })
    return tenantSite
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.TenantSiteWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    await this.prisma.tenantSite.delete({ where })
  }
}

class PrismaTenantSiteMapper {
  static toDomain(prismaTenantSite: PrismaTenantSite): TenantSite {
    return TenantSite.rehydrate({
      id: Id.from(prismaTenantSite.id),
      createdAt: prismaTenantSite.createdAt,
      updatedAt: prismaTenantSite.updatedAt,
      systemState:
        SystemState[prismaTenantSite.systemState as keyof typeof SystemState],
      tenantId: prismaTenantSite.tenantId,
      name: prismaTenantSite.name,
      legalName: prismaTenantSite.legalName,
      externalId: prismaTenantSite.externalId,
      taxId: prismaTenantSite.taxId,
      siteType: prismaTenantSite.siteType as TenantSiteType,
      isHeadquarters: prismaTenantSite.isHeadquarters
    })
  }

  static toPersistence(tenantSite: TenantSite): PrismaTenantSite {
    return {
      id: tenantSite.id.value,
      createdAt: tenantSite.createdAt,
      updatedAt: tenantSite.updatedAt,
      systemState: tenantSite.systemState,
      tenantId: tenantSite.tenantId,
      name: tenantSite.name,
      legalName: tenantSite.legalName,
      externalId: tenantSite.externalId,
      taxId: tenantSite.taxId,
      siteType: tenantSite.siteType,
      isHeadquarters: tenantSite.isHeadquarters
    }
  }
}
