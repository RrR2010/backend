import { Injectable, InternalServerErrorException } from '@nestjs/common'
import {
  TechnicalSource_TE_Repository,
  TechnicalSource_TEFilter
} from '@ingredients/technical-source-te.repository'
import {
  TechnicalSource_TE,
  CreateTechnicalSource_TEProps
} from '@ingredients/technical-source-te.entity'
import { TechnicalSource_TENotFoundError } from '@ingredients/technical-source-te.errors'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

@Injectable()
export class TechnicalSource_TEService {
  constructor(
    private readonly repository: TechnicalSource_TE_Repository
  ) {}

  async create(
    props: Omit<CreateTechnicalSource_TEProps, 'tenantId'>,
    ctx: RequestContext
  ): Promise<TechnicalSource_TE> {
    // TODO: zod validate input
    const effectiveTenantId = getEffectiveTenantId(ctx)
    const tenantId =
      ctx.scope === UserScope.TENANT
        ? ctx.tenantId
        : effectiveTenantId
    if (!tenantId) throw new InternalServerErrorException('tenantId is required')
    const source = TechnicalSource_TE.create({ ...props, tenantId })
    return this.repository.save(source, ctx)
  }

  async findAll(
    filter: TechnicalSource_TEFilter,
    ctx: RequestContext
  ): Promise<TechnicalSource_TE[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<TechnicalSource_TE> {
    const source = await this.repository.findById(id, ctx)
    if (!source) {
      throw new TechnicalSource_TENotFoundError(id)
    }
    return source
  }

  async save(
    source: TechnicalSource_TE,
    ctx: RequestContext
  ): Promise<TechnicalSource_TE> {
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
  ): Promise<TechnicalSource_TE> {
    const source = await this.findById(id, ctx)
    source.activate()
    return this.repository.save(source, ctx)
  }

  async lock(id: string, ctx: RequestContext): Promise<TechnicalSource_TE> {
    const source = await this.findById(id, ctx)
    source.lock()
    return this.repository.save(source, ctx)
  }

  async unlock(id: string, ctx: RequestContext): Promise<TechnicalSource_TE> {
    const source = await this.findById(id, ctx)
    source.unlock()
    return this.repository.save(source, ctx)
  }
}
