import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { ProductClaim_TE } from '@products/product-claim-te.entity'
import { ProductClaim_TE as PrismaProductClaim_TE, Prisma } from '@prisma/client'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'
import { RequestContext } from '@authorization/authorization.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

export type ProductClaim_TEFilter = {
  productId?: string
  claimId?: string
  isActive?: boolean
  systemState?: SystemState
}

export abstract class ProductClaim_TE_Repository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<ProductClaim_TE | null>
  abstract findAll(
    filter: ProductClaim_TEFilter,
    ctx: RequestContext
  ): Promise<ProductClaim_TE[]>
  abstract findByProduct(
    productId: string,
    ctx: RequestContext
  ): Promise<ProductClaim_TE[]>
  abstract save(
    entity: ProductClaim_TE,
    ctx: RequestContext
  ): Promise<ProductClaim_TE>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaProductClaim_TE_Repository
  implements ProductClaim_TE_Repository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<ProductClaim_TE | null> {
    const where: Prisma.ProductClaim_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const prismaEntity = await this.prisma.productClaim_TE.findUnique({
      where
    })
    if (!prismaEntity) return null
    if (
      prismaEntity &&
      effectiveTenantId &&
      prismaEntity.systemState === SystemState.DELETED
    ) {
      return null
    }
    return PrismaProductClaim_TEMapper.toDomain(prismaEntity)
  }

  async findAll(
    filter: ProductClaim_TEFilter,
    ctx: RequestContext
  ): Promise<ProductClaim_TE[]> {
    const where: Prisma.ProductClaim_TEWhereInput = {
      ...(filter.productId && { productId: filter.productId }),
      ...(filter.claimId && { claimId: filter.claimId }),
      ...(filter.isActive !== undefined && { isActive: filter.isActive }),
      ...(filter.systemState && { systemState: filter.systemState })
    }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    if (effectiveTenantId) {
      where.systemState = { not: SystemState.DELETED }
    }
    const prismaEntities = await this.prisma.productClaim_TE.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    })
    return prismaEntities.map((entity) =>
      PrismaProductClaim_TEMapper.toDomain(entity)
    )
  }

  async findByProduct(
    productId: string,
    ctx: RequestContext
  ): Promise<ProductClaim_TE[]> {
    return this.findAll({ productId }, ctx)
  }

  async save(
    entity: ProductClaim_TE,
    ctx: RequestContext
  ): Promise<ProductClaim_TE> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId && entity.tenantId !== effectiveTenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = entity.id.value
    const prismaEntity = PrismaProductClaim_TEMapper.toPersistence(entity)
    await this.prisma.productClaim_TE.upsert({
      where: { id },
      update: prismaEntity,
      create: prismaEntity
    })
    return entity
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.ProductClaim_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.productClaim_TE.update({
      where,
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaProductClaim_TEMapper {
  static toDomain(prismaEntity: PrismaProductClaim_TE): ProductClaim_TE {
    const systemState =
      SystemState[prismaEntity.systemState as keyof typeof SystemState]
    if (!systemState) {
      throw new Error(`Invalid systemState value: ${prismaEntity.systemState}`)
    }
    return ProductClaim_TE.rehydrate({
      id: Id.from(prismaEntity.id),
      createdAt: prismaEntity.createdAt,
      updatedAt: prismaEntity.updatedAt,
      systemState,
      tenantId: prismaEntity.tenantId,
      productId: prismaEntity.productId,
      claimId: prismaEntity.claimId,
      isActive: prismaEntity.isActive,
      sortOrder: prismaEntity.sortOrder
    })
  }

  static toPersistence(
    entity: ProductClaim_TE
  ): Prisma.ProductClaim_TEUncheckedCreateInput {
    return {
      id: entity.id.value,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      systemState: entity.systemState,
      tenantId: entity.tenantId,
      productId: entity.productId,
      claimId: entity.claimId,
      isActive: entity.isActive,
      sortOrder: entity.sortOrder
    }
  }
}
