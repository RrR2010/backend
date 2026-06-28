import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { Claim_TE } from '@products/claim-te.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'
import { Claim_TE as PrismaClaim_TE, Prisma } from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

export type Claim_TEFilter = {
  name?: string
  code?: string
  systemState?: SystemState
}

export abstract class Claim_TE_Repository {
  abstract findById(id: string, ctx: RequestContext): Promise<Claim_TE | null>
  abstract findAll(
    filter: Claim_TEFilter,
    ctx: RequestContext
  ): Promise<Claim_TE[]>
  abstract save(claim: Claim_TE, ctx: RequestContext): Promise<Claim_TE>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaClaim_TE_Repository implements Claim_TE_Repository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, ctx: RequestContext): Promise<Claim_TE | null> {
    const where: Prisma.Claim_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const prismaClaim = await this.prisma.claim_TE.findUnique({ where })
    if (!prismaClaim) return null
    if (
      prismaClaim &&
      effectiveTenantId &&
      prismaClaim.systemState === SystemState.DELETED
    ) {
      return null
    }
    return PrismaClaim_TEMapper.toDomain(prismaClaim)
  }

  async findAll(
    filter: Claim_TEFilter,
    ctx: RequestContext
  ): Promise<Claim_TE[]> {
    const where: Prisma.Claim_TEWhereInput = {
      ...(filter.name && {
        name: { contains: filter.name, mode: 'insensitive' }
      }),
      ...(filter.code && {
        code: { contains: filter.code, mode: 'insensitive' }
      }),
      ...(filter.systemState && { systemState: filter.systemState })
    }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    if (effectiveTenantId) {
      where.systemState = { not: SystemState.DELETED }
    }
    const prismaClaims = await this.prisma.claim_TE.findMany({
      where,
      orderBy: { name: 'asc' }
    })
    return prismaClaims.map((claim) => PrismaClaim_TEMapper.toDomain(claim))
  }

  async save(claim: Claim_TE, ctx: RequestContext): Promise<Claim_TE> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId && claim.tenantId !== effectiveTenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = claim.id.value
    const prismaClaim = PrismaClaim_TEMapper.toPersistence(claim)
    await this.prisma.claim_TE.upsert({
      where: { id },
      update: prismaClaim,
      create: prismaClaim
    })
    return claim
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.Claim_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.claim_TE.update({
      where,
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaClaim_TEMapper {
  static toDomain(prismaClaim: PrismaClaim_TE): Claim_TE {
    const systemState =
      SystemState[prismaClaim.systemState as keyof typeof SystemState]
    if (!systemState) {
      throw new Error(`Invalid systemState value: ${prismaClaim.systemState}`)
    }
    return Claim_TE.rehydrate({
      id: Id.from(prismaClaim.id),
      createdAt: prismaClaim.createdAt,
      updatedAt: prismaClaim.updatedAt,
      systemState,
      tenantId: prismaClaim.tenantId,
      code: prismaClaim.code,
      name: prismaClaim.name,
      description: prismaClaim.description
    })
  }

  static toPersistence(claim: Claim_TE): Prisma.Claim_TEUncheckedCreateInput {
    return {
      id: claim.id.value,
      createdAt: claim.createdAt,
      updatedAt: claim.updatedAt,
      systemState: claim.systemState,
      tenantId: claim.tenantId,
      code: claim.code,
      name: claim.name,
      description: claim.description
    }
  }
}
