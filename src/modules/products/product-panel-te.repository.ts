import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { ProductPanel_TE } from '@products/product-panel-te.entity'
import { ProductPanel_TE as PrismaProductPanel_TE, Prisma, ProductPanelType } from '@prisma/client'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'
import { RequestContext } from '@authorization/authorization.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'

export type ProductPanel_TEFilter = {
  productId?: string
  type?: ProductPanelType
  systemState?: SystemState
}

export abstract class ProductPanel_TE_Repository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<ProductPanel_TE | null>
  abstract findAll(
    filter: ProductPanel_TEFilter,
    ctx: RequestContext
  ): Promise<ProductPanel_TE[]>
  abstract findByProduct(
    productId: string,
    ctx: RequestContext
  ): Promise<ProductPanel_TE[]>
  abstract save(
    entity: ProductPanel_TE,
    ctx: RequestContext
  ): Promise<ProductPanel_TE>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaProductPanel_TE_Repository
  implements ProductPanel_TE_Repository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<ProductPanel_TE | null> {
    const where: Prisma.ProductPanel_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const prismaEntity = await this.prisma.productPanel_TE.findUnique({
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
    return PrismaProductPanel_TEMapper.toDomain(prismaEntity)
  }

  async findAll(
    filter: ProductPanel_TEFilter,
    ctx: RequestContext
  ): Promise<ProductPanel_TE[]> {
    const where: Prisma.ProductPanel_TEWhereInput = {
      ...(filter.productId && { productId: filter.productId }),
      ...(filter.type && { type: filter.type }),
      ...(filter.systemState && { systemState: filter.systemState })
    }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    if (effectiveTenantId) {
      where.systemState = { not: SystemState.DELETED }
    }
    const prismaEntities = await this.prisma.productPanel_TE.findMany({
      where,
      orderBy: { panelNumber: 'asc' }
    })
    return prismaEntities.map((entity) =>
      PrismaProductPanel_TEMapper.toDomain(entity)
    )
  }

  async findByProduct(
    productId: string,
    ctx: RequestContext
  ): Promise<ProductPanel_TE[]> {
    return this.findAll({ productId }, ctx)
  }

  async save(
    entity: ProductPanel_TE,
    ctx: RequestContext
  ): Promise<ProductPanel_TE> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId && entity.tenantId !== effectiveTenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = entity.id.value
    const prismaEntity = PrismaProductPanel_TEMapper.toPersistence(entity)
    await this.prisma.productPanel_TE.upsert({
      where: { id },
      update: prismaEntity,
      create: prismaEntity
    })
    return entity
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.ProductPanel_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.productPanel_TE.update({
      where,
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaProductPanel_TEMapper {
  static toDomain(prismaEntity: PrismaProductPanel_TE): ProductPanel_TE {
    const systemState =
      SystemState[prismaEntity.systemState as keyof typeof SystemState]
    if (!systemState) {
      throw new Error(`Invalid systemState value: ${prismaEntity.systemState}`)
    }
    return ProductPanel_TE.rehydrate({
      id: Id.from(prismaEntity.id),
      createdAt: prismaEntity.createdAt,
      updatedAt: prismaEntity.updatedAt,
      systemState,
      tenantId: prismaEntity.tenantId,
      productId: prismaEntity.productId,
      panelNumber: prismaEntity.panelNumber,
      type: prismaEntity.type,
      geometricFormatTypeId: prismaEntity.geometricFormatTypeId ?? null,
      geometricFormatValues:
        (prismaEntity.geometricFormatValues as Record<string, unknown>) ??
        null
    })
  }

  static toPersistence(
    entity: ProductPanel_TE
  ): Prisma.ProductPanel_TEUncheckedCreateInput {
    return {
      id: entity.id.value,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      systemState: entity.systemState,
      tenantId: entity.tenantId,
      productId: entity.productId,
      panelNumber: entity.panelNumber,
      type: entity.type,
      geometricFormatTypeId: entity.geometricFormatTypeId,
      geometricFormatValues:
        entity.geometricFormatValues as Prisma.InputJsonValue
    }
  }
}
