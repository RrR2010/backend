import { Injectable } from '@nestjs/common'
import { TenantSiteRepository, TenantSiteFilter } from '@tenant-sites/tenant-site.repository'
import { TenantSite, CreateTenantSiteProps } from '@tenant-sites/tenant-site.entity'
import { TenantSiteNotFoundError } from '@tenant-sites/tenant-site.errors'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class TenantSiteService {
  constructor(private readonly repository: TenantSiteRepository) {}

  async create(props: CreateTenantSiteProps, context: RequestContext): Promise<TenantSite> {
    const tenantSite = TenantSite.create(props)
    return this.repository.save(tenantSite)
  }

  async findAll(filter?: TenantSiteFilter, context?: RequestContext): Promise<TenantSite[]> {
    return this.repository.findAll(filter)
  }

  async findById(id: string, context: RequestContext): Promise<TenantSite> {
    const tenantSite = await this.repository.findById(id)
    if (!tenantSite) {
      throw new TenantSiteNotFoundError(id)
    }
    return tenantSite
  }

  async save(tenantSite: TenantSite, context: RequestContext): Promise<TenantSite> {
    return this.repository.save(tenantSite)
  }

  async delete(id: string, context: RequestContext): Promise<void> {
    const tenantSite = await this.findById(id, context)
    tenantSite.delete()
    await this.repository.save(tenantSite)
  }

  async activate(id: string, context: RequestContext): Promise<TenantSite> {
    const tenantSite = await this.findById(id, context)
    tenantSite.activate()
    return this.repository.save(tenantSite)
  }

  async lock(id: string, context: RequestContext): Promise<TenantSite> {
    const tenantSite = await this.findById(id, context)
    tenantSite.lock()
    return this.repository.save(tenantSite)
  }
}