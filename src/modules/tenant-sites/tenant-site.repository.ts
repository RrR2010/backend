import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { TenantSite } from '@tenant-sites/tenant-site.entity'
import { TenantSiteType, SystemState } from '@shared/enums'
import { Id } from '@shared/value-objects'
import { TenantSite as PrismaTenantSite, Prisma } from '@prisma/client'

export interface TenantSiteFilter {
  tenantId?: string
  siteType?: TenantSiteType
  isHeadquarters?: boolean
}

export abstract class TenantSiteRepository {
  abstract findById(id: string): Promise<TenantSite | null>
  abstract findAll(filter?: TenantSiteFilter): Promise<TenantSite[]>
  abstract save(tenantSite: TenantSite): Promise<TenantSite>
  abstract delete(id: string): Promise<void>
}

@Injectable()
export class PrismaTenantSiteRepository implements TenantSiteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<TenantSite | null> {
    const prismaTenantSite = await this.prisma.tenantSite.findUnique({
      where: { id }
    })
    if (!prismaTenantSite) return null
    return PrismaTenantSiteMapper.toDomain(prismaTenantSite)
  }

  async findAll(filter?: TenantSiteFilter): Promise<TenantSite[]> {
    const prismaTenantSites = await this.prisma.tenantSite.findMany({
      where: {
        ...(filter?.tenantId && { tenantId: filter.tenantId }),
        ...(filter?.siteType && { siteType: filter.siteType }),
        ...(filter?.isHeadquarters !== undefined && {
          isHeadquarters: filter.isHeadquarters
        })
      }
    })
    return prismaTenantSites.map((site) =>
      PrismaTenantSiteMapper.toDomain(site)
    )
  }

  async save(tenantSite: TenantSite): Promise<TenantSite> {
    const prismaTenantSite = PrismaTenantSiteMapper.toPersistence(tenantSite)
    await this.prisma.tenantSite.upsert({
      where: { id: prismaTenantSite.id },
      update: prismaTenantSite,
      create: prismaTenantSite
    })
    return tenantSite
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tenantSite.delete({ where: { id } })
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
