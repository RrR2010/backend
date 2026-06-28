import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { ProductSubcategory_PL } from '@products/product-subcategory-pl.entity'
import { Id } from '@shared/value-objects'
import { SystemState } from '@shared/behaviours/lockable'
import {
  ProductSubcategory_PL as PrismaProductSubcategoryPL,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'

// EXCEÇÃO: ProductSubcategory_PL é entidade platform-scoped (sem tenantId).
// Permanece acessível globalmente por usuários PLATFORM durante impersonação.
// Regra de Negócio #11 do EPIC_010.

export type ProductSubcategory_PLFilter = {
  categoryId?: string
  systemState?: SystemState
}

export abstract class ProductSubcategory_PLRepository {
  abstract findById(
    id: string,
    _ctx: RequestContext
  ): Promise<ProductSubcategory_PL | null>
  abstract findAll(
    filter: ProductSubcategory_PLFilter,
    _ctx: RequestContext
  ): Promise<ProductSubcategory_PL[]>
  abstract save(
    subcategory: ProductSubcategory_PL,
    _ctx: RequestContext
  ): Promise<ProductSubcategory_PL>
  abstract delete(id: string, _ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaProductSubcategory_PLRepository
  implements ProductSubcategory_PLRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<ProductSubcategory_PL | null> {
    // Platform-scoped resource — no tenantId
    const prismaSubcategoryPL =
      await this.prisma.productSubcategory_PL.findUnique({
        where: { id }
      })
    if (!prismaSubcategoryPL) return null
    if (prismaSubcategoryPL.systemState === 'DELETED') {
      return null
    }
    return PrismaProductSubcategory_PLMapper.toDomain(prismaSubcategoryPL)
  }

  async findAll(
    filter: ProductSubcategory_PLFilter,
    _ctx: RequestContext
  ): Promise<ProductSubcategory_PL[]> {
    // Platform-scoped resource — no tenantId
    const where: Prisma.ProductSubcategory_PLWhereInput = {}
    if (filter.categoryId) {
      where.categoryId = filter.categoryId
    }
    if (filter.systemState) {
      where.systemState = filter.systemState
    }
    if (!filter.systemState) {
      where.systemState = { not: SystemState.DELETED }
    }
    const prismaSubcategoriesPL =
      await this.prisma.productSubcategory_PL.findMany({
        where,
        orderBy: { sequentialNumber: 'asc' }
      })
    return prismaSubcategoriesPL.map((sub) =>
      PrismaProductSubcategory_PLMapper.toDomain(sub)
    )
  }

  async save(
    subcategory: ProductSubcategory_PL,
    _ctx: RequestContext
  ): Promise<ProductSubcategory_PL> {
    // Platform-scoped resource — no tenantId
    const id = subcategory.id.value
    const data = PrismaProductSubcategory_PLMapper.toPersistence(subcategory)
    await this.prisma.productSubcategory_PL.upsert({
      where: { id },
      update: data,
      create: data
    })
    return subcategory
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    // Platform-scoped resource — no tenantId
    await this.prisma.productSubcategory_PL.update({
      where: { id },
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaProductSubcategory_PLMapper {
  static toDomain(
    prismaSubcategoryPL: PrismaProductSubcategoryPL
  ): ProductSubcategory_PL {
    return ProductSubcategory_PL.rehydrate({
      id: Id.from(prismaSubcategoryPL.id),
      createdAt: prismaSubcategoryPL.createdAt,
      updatedAt: prismaSubcategoryPL.updatedAt,
      systemState:
        SystemState[
          prismaSubcategoryPL.systemState as keyof typeof SystemState
        ],
      categoryId: prismaSubcategoryPL.categoryId,
      code: prismaSubcategoryPL.code,
      name: prismaSubcategoryPL.name,
      sequentialNumber: prismaSubcategoryPL.sequentialNumber
    })
  }

  static toPersistence(
    subcategory: ProductSubcategory_PL
  ): Prisma.ProductSubcategory_PLUncheckedCreateInput {
    return {
      id: subcategory.id.value,
      createdAt: subcategory.createdAt,
      updatedAt: subcategory.updatedAt,
      systemState: subcategory.systemState,
      categoryId: subcategory.categoryId,
      code: subcategory.code,
      name: subcategory.name,
      sequentialNumber: subcategory.sequentialNumber
    }
  }
}
