import { Injectable } from '@nestjs/common'
import {
  TechnicalSourceType_TE_Repository,
  TechnicalSourceType_TEFilter
} from '@ingredients/technical-source-type-te.repository'
import {
  TechnicalSourceType_TE,
  CreateTechnicalSourceType_TEProps
} from '@ingredients/technical-source-type-te.entity'
import {
  TechnicalSourceType_TENotFoundError,
  TechnicalSourceType_TEAlreadyExistsError
} from '@ingredients/technical-source-type-te.errors'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'
import { Prisma } from '@prisma/client'

@Injectable()
export class TechnicalSourceType_TEService {
  constructor(private readonly repository: TechnicalSourceType_TE_Repository) {}

  async create(
    props: CreateTechnicalSourceType_TEProps,
    ctx: RequestContext
  ): Promise<TechnicalSourceType_TE> {
    // TODO: zod validate input
    const effectiveTenantId = getEffectiveTenantId(ctx) ?? ''
    const tenantId =
      ctx.scope === UserScope.TENANT
        ? ctx.tenantId
        : props.tenantId || effectiveTenantId
    const source = TechnicalSourceType_TE.create({ ...props, tenantId })
    try {
      return await this.repository.save(source, ctx)
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new TechnicalSourceType_TEAlreadyExistsError()
      }
      throw error
    }
  }

  async findAll(
    filter: TechnicalSourceType_TEFilter,
    ctx: RequestContext
  ): Promise<TechnicalSourceType_TE[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<TechnicalSourceType_TE> {
    const source = await this.repository.findById(id, ctx)
    if (!source) {
      throw new TechnicalSourceType_TENotFoundError(id)
    }
    return source
  }

  async save(
    source: TechnicalSourceType_TE,
    ctx: RequestContext
  ): Promise<TechnicalSourceType_TE> {
    return this.repository.save(source, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const source = await this.findById(id, ctx)
    source.delete()
    await this.repository.save(source, ctx)
  }
}
