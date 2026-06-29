import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { ProductNutrientOverride_TE } from '@products/product-nutrient-override-te.entity'
import { ProductNutrientOverride_TE as PrismaProductNutrientOverride_TE, Prisma } from '@prisma/client'
import { Id } from '@shared/value-objects'
import { RequestContext } from '@authorization/authorization.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

export type ProductNutrientOverride_TEFilter = {
  productId?: string
  nutrientId?: string
}

export abstract class ProductNutrientOverride_TE_Repository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<ProductNutrientOverride_TE | null>
  abstract findAll(
    filter: ProductNutrientOverride_TEFilter,
    ctx: RequestContext
  ): Promise<ProductNutrientOverride_TE[]>
  abstract findByProduct(
    productId: string,
    ctx: RequestContext
  ): Promise<ProductNutrientOverride_TE[]>
  abstract save(
    entity: ProductNutrientOverride_TE,
    ctx: RequestContext
  ): Promise<ProductNutrientOverride_TE>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaProductNutrientOverride_TE_Repository
  implements ProductNutrientOverride_TE_Repository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<ProductNutrientOverride_TE | null> {
    const where: Prisma.ProductNutrientOverride_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const prismaEntity =
      await this.prisma.productNutrientOverride_TE.findUnique({ where })
    if (!prismaEntity) return null
    return PrismaProductNutrientOverride_TEMapper.toDomain(prismaEntity)
  }

  async findAll(
    filter: ProductNutrientOverride_TEFilter,
    ctx: RequestContext
  ): Promise<ProductNutrientOverride_TE[]> {
    const where: Prisma.ProductNutrientOverride_TEWhereInput = {
      ...(filter.productId && { productId: filter.productId }),
      ...(filter.nutrientId && { nutrientId: filter.nutrientId })
    }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const prismaEntities =
      await this.prisma.productNutrientOverride_TE.findMany({ where })
    return prismaEntities.map((entity) =>
      PrismaProductNutrientOverride_TEMapper.toDomain(entity)
    )
  }

  async findByProduct(
    productId: string,
    ctx: RequestContext
  ): Promise<ProductNutrientOverride_TE[]> {
    return this.findAll({ productId }, ctx)
  }

  async save(
    entity: ProductNutrientOverride_TE,
    ctx: RequestContext
  ): Promise<ProductNutrientOverride_TE> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId && entity.tenantId !== effectiveTenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = entity.id.value
    const prismaEntity =
      PrismaProductNutrientOverride_TEMapper.toPersistence(entity)
    await this.prisma.productNutrientOverride_TE.upsert({
      where: { id },
      update: prismaEntity,
      create: prismaEntity
    })
    return entity
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    await this.prisma.productNutrientOverride_TE.delete({ where: { id } })
  }
}

class PrismaProductNutrientOverride_TEMapper {
  static toDomain(
    prismaEntity: PrismaProductNutrientOverride_TE
  ): ProductNutrientOverride_TE {
    return ProductNutrientOverride_TE.rehydrate({
      id: Id.from(prismaEntity.id),
      createdAt: prismaEntity.createdAt,
      updatedAt: prismaEntity.updatedAt,
      tenantId: prismaEntity.tenantId,
      productId: prismaEntity.productId,
      nutrientId: prismaEntity.nutrientId,
      overriddenValue: prismaEntity.overriddenValue.toNumber(),
      notes: prismaEntity.notes ?? null
    })
  }

  static toPersistence(
    entity: ProductNutrientOverride_TE
  ): Prisma.ProductNutrientOverride_TEUncheckedCreateInput {
    return {
      id: entity.id.value,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      tenantId: entity.tenantId,
      productId: entity.productId,
      nutrientId: entity.nutrientId,
      overriddenValue: entity.overriddenValue,
      notes: entity.notes
    }
  }
}
