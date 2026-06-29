import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { ProductLabelField_TE } from '@products/product-label-field-te.entity'
import { ProductLabelField_TE as PrismaProductLabelField_TE, Prisma } from '@prisma/client'
import { Id } from '@shared/value-objects'
import { RequestContext } from '@authorization/authorization.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

export type ProductLabelField_TEFilter = {
  productId?: string
  labelFieldId?: string
}

export abstract class ProductLabelField_TE_Repository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<ProductLabelField_TE | null>
  abstract findAll(
    filter: ProductLabelField_TEFilter,
    ctx: RequestContext
  ): Promise<ProductLabelField_TE[]>
  abstract findByProduct(
    productId: string,
    ctx: RequestContext
  ): Promise<ProductLabelField_TE[]>
  abstract save(
    entity: ProductLabelField_TE,
    ctx: RequestContext
  ): Promise<ProductLabelField_TE>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaProductLabelField_TE_Repository
  implements ProductLabelField_TE_Repository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<ProductLabelField_TE | null> {
    const where: Prisma.ProductLabelField_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const prismaEntity = await this.prisma.productLabelField_TE.findUnique({
      where
    })
    if (!prismaEntity) return null
    return PrismaProductLabelField_TEMapper.toDomain(prismaEntity)
  }

  async findAll(
    filter: ProductLabelField_TEFilter,
    ctx: RequestContext
  ): Promise<ProductLabelField_TE[]> {
    const where: Prisma.ProductLabelField_TEWhereInput = {
      ...(filter.productId && { productId: filter.productId }),
      ...(filter.labelFieldId && { labelFieldId: filter.labelFieldId })
    }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const prismaEntities =
      await this.prisma.productLabelField_TE.findMany({ where })
    return prismaEntities.map((entity) =>
      PrismaProductLabelField_TEMapper.toDomain(entity)
    )
  }

  async findByProduct(
    productId: string,
    ctx: RequestContext
  ): Promise<ProductLabelField_TE[]> {
    return this.findAll({ productId }, ctx)
  }

  async save(
    entity: ProductLabelField_TE,
    ctx: RequestContext
  ): Promise<ProductLabelField_TE> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId && entity.tenantId !== effectiveTenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = entity.id.value
    const prismaEntity = PrismaProductLabelField_TEMapper.toPersistence(entity)
    await this.prisma.productLabelField_TE.upsert({
      where: { id },
      update: prismaEntity,
      create: prismaEntity
    })
    return entity
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    await this.prisma.productLabelField_TE.delete({ where: { id } })
  }
}

class PrismaProductLabelField_TEMapper {
  static toDomain(
    prismaEntity: PrismaProductLabelField_TE
  ): ProductLabelField_TE {
    return ProductLabelField_TE.rehydrate({
      id: Id.from(prismaEntity.id),
      createdAt: prismaEntity.createdAt,
      updatedAt: prismaEntity.updatedAt,
      tenantId: prismaEntity.tenantId,
      productId: prismaEntity.productId,
      labelFieldId: prismaEntity.labelFieldId,
      designerValue: prismaEntity.designerValue ?? null,
      gerencialValue: prismaEntity.gerencialValue ?? null
    })
  }

  static toPersistence(
    entity: ProductLabelField_TE
  ): Prisma.ProductLabelField_TEUncheckedCreateInput {
    return {
      id: entity.id.value,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      tenantId: entity.tenantId,
      productId: entity.productId,
      labelFieldId: entity.labelFieldId,
      designerValue: entity.designerValue,
      gerencialValue: entity.gerencialValue
    }
  }
}
