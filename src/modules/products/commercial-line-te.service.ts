import { Injectable, InternalServerErrorException } from '@nestjs/common'
import {
  CommercialLine_TE_Repository,
  CommercialLine_TEFilter
} from '@products/commercial-line-te.repository'
import {
  CommercialLine_TE,
  CreateCommercialLine_TEProps
} from '@products/commercial-line-te.entity'
import {
  CommercialLine_TENotFoundError,
  CommercialLine_TEAlreadyExistsError
} from '@products/commercial-line-te.errors'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'
import { Prisma } from '@prisma/client'

@Injectable()
export class CommercialLine_TEService {
  constructor(private readonly repository: CommercialLine_TE_Repository) {}

  async create(
    props: CreateCommercialLine_TEProps,
    ctx: RequestContext
  ): Promise<CommercialLine_TE> {
    // TODO: zod validate input
    const effectiveTenantId = getEffectiveTenantId(ctx)
    const tenantId =
      ctx.scope === UserScope.TENANT
        ? ctx.tenantId
        : (effectiveTenantId ?? props.tenantId)
    if (!tenantId) throw new InternalServerErrorException('tenantId is required')
    const line = CommercialLine_TE.create({ ...props, tenantId })
    try {
      return await this.repository.save(line, ctx)
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new CommercialLine_TEAlreadyExistsError()
      }
      throw error
    }
  }

  async findAll(
    filter: CommercialLine_TEFilter,
    ctx: RequestContext
  ): Promise<CommercialLine_TE[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<CommercialLine_TE> {
    const line = await this.repository.findById(id, ctx)
    if (!line) {
      throw new CommercialLine_TENotFoundError(id)
    }
    return line
  }

  async save(
    line: CommercialLine_TE,
    ctx: RequestContext
  ): Promise<CommercialLine_TE> {
    return this.repository.save(line, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const line = await this.findById(id, ctx)
    line.delete()
    await this.repository.save(line, ctx)
  }

  async activate(id: string, ctx: RequestContext): Promise<CommercialLine_TE> {
    const line = await this.findById(id, ctx)
    line.activate()
    return this.repository.save(line, ctx)
  }

  async lock(id: string, ctx: RequestContext): Promise<CommercialLine_TE> {
    const line = await this.findById(id, ctx)
    line.lock()
    return this.repository.save(line, ctx)
  }

  async unlock(id: string, ctx: RequestContext): Promise<CommercialLine_TE> {
    const line = await this.findById(id, ctx)
    line.unlock()
    return this.repository.save(line, ctx)
  }
}
