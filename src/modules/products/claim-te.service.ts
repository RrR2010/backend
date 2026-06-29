import { Injectable } from '@nestjs/common'
import {
  Claim_TE_Repository,
  Claim_TEFilter
} from '@products/claim-te.repository'
import { Claim_TE, CreateClaim_TEProps } from '@products/claim-te.entity'
import {
  Claim_TENotFoundError,
  Claim_TEAlreadyExistsError
} from '@products/claim-te.errors'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'
import { Prisma } from '@prisma/client'

@Injectable()
export class Claim_TEService {
  constructor(private readonly repository: Claim_TE_Repository) {}

  async create(
    props: CreateClaim_TEProps,
    ctx: RequestContext
  ): Promise<Claim_TE> {
    // TODO: zod validate input
    const effectiveTenantId = getEffectiveTenantId(ctx) ?? ''
    const tenantId =
      ctx.scope === UserScope.TENANT
        ? ctx.tenantId
        : props.tenantId || effectiveTenantId
    const claim = Claim_TE.create({ ...props, tenantId })
    try {
      return await this.repository.save(claim, ctx)
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new Claim_TEAlreadyExistsError()
      }
      throw error
    }
  }

  async findAll(
    filter: Claim_TEFilter,
    ctx: RequestContext
  ): Promise<Claim_TE[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<Claim_TE> {
    const claim = await this.repository.findById(id, ctx)
    if (!claim) {
      throw new Claim_TENotFoundError(id)
    }
    return claim
  }

  async save(claim: Claim_TE, ctx: RequestContext): Promise<Claim_TE> {
    return this.repository.save(claim, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const claim = await this.findById(id, ctx)
    claim.delete()
    await this.repository.save(claim, ctx)
  }

  async activate(id: string, ctx: RequestContext): Promise<Claim_TE> {
    const claim = await this.findById(id, ctx)
    claim.activate()
    return this.repository.save(claim, ctx)
  }

  async lock(id: string, ctx: RequestContext): Promise<Claim_TE> {
    const claim = await this.findById(id, ctx)
    claim.lock()
    return this.repository.save(claim, ctx)
  }

  async unlock(id: string, ctx: RequestContext): Promise<Claim_TE> {
    const claim = await this.findById(id, ctx)
    claim.unlock()
    return this.repository.save(claim, ctx)
  }
}
