import { Injectable } from '@nestjs/common'
import {
  TenantSiteRepository,
  TenantSiteFilter
} from '@tenant-sites/tenant-site.repository'
import {
  TenantSite,
  CreateTenantSiteProps
} from '@tenant-sites/tenant-site.entity'
import { TenantSiteNotFoundError } from '@tenant-sites/tenant-site.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class TenantSiteService {
  constructor(private readonly repository: TenantSiteRepository) {}

  async create(
    props: CreateTenantSiteProps,
    ctx: RequestContext
  ): Promise<TenantSite> {
    const tenantSite = TenantSite.create(props)
    return this.repository.save(tenantSite, ctx)
  }

  async findAll(
    filter: TenantSiteFilter,
    ctx: RequestContext
  ): Promise<TenantSite[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<TenantSite> {
    const tenantSite = await this.repository.findById(id, ctx)
    if (!tenantSite) {
      throw new TenantSiteNotFoundError(id)
    }
    return tenantSite
  }

  async save(tenantSite: TenantSite, ctx: RequestContext): Promise<TenantSite> {
    return this.repository.save(tenantSite, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const tenantSite = await this.findById(id, ctx)
    tenantSite.delete()
    await this.repository.save(tenantSite, ctx)
  }

  async activate(id: string, ctx: RequestContext): Promise<TenantSite> {
    const tenantSite = await this.findById(id, ctx)
    tenantSite.activate()
    return this.repository.save(tenantSite, ctx)
  }

  async lock(id: string, ctx: RequestContext): Promise<TenantSite> {
    const tenantSite = await this.findById(id, ctx)
    tenantSite.lock()
    return this.repository.save(tenantSite, ctx)
  }
}
