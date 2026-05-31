import { Injectable } from '@nestjs/common'
import {
  TechnicalInfoSourceRepository,
  TechnicalInfoSourceFilter
} from '@ingredients/technical-info-source.repository'
import {
  TechnicalInfoSource,
  CreateTechnicalInfoSourceProps
} from '@ingredients/technical-info-source.entity'
import { TechnicalInfoSourceNotFoundError } from '@ingredients/technical-info-source.errors'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

@Injectable()
export class TechnicalInfoSourceService {
  constructor(private readonly repository: TechnicalInfoSourceRepository) {}

  async create(
    props: CreateTechnicalInfoSourceProps,
    ctx: RequestContext
  ): Promise<TechnicalInfoSource> {
    // TODO: zod validate input
    const tenantId =
      ctx.scope === UserScope.TENANT
        ? ctx.tenantId
        : (props.tenantId ?? getEffectiveTenantId(ctx))
    const source = TechnicalInfoSource.create({ ...props, tenantId })
    return this.repository.save(source, ctx)
  }

  async findAll(
    filter: TechnicalInfoSourceFilter,
    ctx: RequestContext
  ): Promise<TechnicalInfoSource[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<TechnicalInfoSource> {
    const source = await this.repository.findById(id, ctx)
    if (!source) {
      throw new TechnicalInfoSourceNotFoundError(id)
    }
    return source
  }

  async save(
    source: TechnicalInfoSource,
    ctx: RequestContext
  ): Promise<TechnicalInfoSource> {
    return this.repository.save(source, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const source = await this.findById(id, ctx)
    source.delete()
    await this.repository.save(source, ctx)
  }

  async activate(
    id: string,
    ctx: RequestContext
  ): Promise<TechnicalInfoSource> {
    const source = await this.findById(id, ctx)
    source.activate()
    return this.repository.save(source, ctx)
  }

  async lock(id: string, ctx: RequestContext): Promise<TechnicalInfoSource> {
    const source = await this.findById(id, ctx)
    source.lock()
    return this.repository.save(source, ctx)
  }

  async unlock(id: string, ctx: RequestContext): Promise<TechnicalInfoSource> {
    const source = await this.findById(id, ctx)
    source.unlock()
    return this.repository.save(source, ctx)
  }
}
