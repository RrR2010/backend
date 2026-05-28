import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { BaseAllergen } from '@ingredients/base-allergen.entity'
import { Id } from '@shared/value-objects'
import { SystemState } from '@shared/behaviours/lockable'
import { BaseAllergen as PrismaBaseAllergen, Prisma } from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'

export type BaseAllergenFilter = {
  category?: string
  systemState?: SystemState
}

export abstract class BaseAllergenRepository {
  abstract findById(
    id: string,
    _ctx: RequestContext
  ): Promise<BaseAllergen | null>
  abstract findAll(
    filter: BaseAllergenFilter,
    _ctx: RequestContext
  ): Promise<BaseAllergen[]>
  abstract save(
    baseAllergen: BaseAllergen,
    _ctx: RequestContext
  ): Promise<BaseAllergen>
  abstract delete(id: string, _ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaBaseAllergenRepository implements BaseAllergenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<BaseAllergen | null> {
    const prismaBaseAllergen = await this.prisma.baseAllergen.findUnique({
      where: { id }
    })
    if (!prismaBaseAllergen) return null
    if (prismaBaseAllergen.systemState === 'HIDDEN') {
      return null
    }
    return PrismaBaseAllergenMapper.toDomain(prismaBaseAllergen)
  }

  async findAll(
    filter: BaseAllergenFilter,
    _ctx: RequestContext
  ): Promise<BaseAllergen[]> {
    const where: Prisma.BaseAllergenWhereInput = {}
    if (filter.category) {
      where.category = { contains: filter.category, mode: 'insensitive' }
    }
    if (filter.systemState) {
      where.systemState = filter.systemState
    }
    if (!filter.systemState) {
      where.systemState = { not: SystemState.HIDDEN }
    }
    const prismaBaseAllergens = await this.prisma.baseAllergen.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    })
    return prismaBaseAllergens.map((allergen) =>
      PrismaBaseAllergenMapper.toDomain(allergen)
    )
  }

  async save(
    baseAllergen: BaseAllergen,
    _ctx: RequestContext
  ): Promise<BaseAllergen> {
    const id = baseAllergen.id.value
    const prismaBaseAllergen =
      PrismaBaseAllergenMapper.toPersistence(baseAllergen)
    await this.prisma.baseAllergen.upsert({
      where: { id },
      update: prismaBaseAllergen,
      create: prismaBaseAllergen
    })
    return baseAllergen
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    const where: Prisma.BaseAllergenWhereUniqueInput = { id }
    await this.prisma.baseAllergen.update({
      where,
      data: { systemState: SystemState.HIDDEN, updatedAt: new Date() }
    })
  }
}

class PrismaBaseAllergenMapper {
  static toDomain(prismaBaseAllergen: PrismaBaseAllergen): BaseAllergen {
    return BaseAllergen.rehydrate({
      id: Id.from(prismaBaseAllergen.id),
      createdAt: prismaBaseAllergen.createdAt,
      updatedAt: prismaBaseAllergen.updatedAt,
      systemState:
        SystemState[prismaBaseAllergen.systemState as keyof typeof SystemState],
      name: prismaBaseAllergen.name,
      category: prismaBaseAllergen.category,
      regulatoryRef: prismaBaseAllergen.regulatoryRef,
      sortOrder: prismaBaseAllergen.sortOrder
    })
  }

  static toPersistence(
    baseAllergen: BaseAllergen
  ): Prisma.BaseAllergenCreateInput {
    return {
      id: baseAllergen.id.value,
      createdAt: baseAllergen.createdAt,
      updatedAt: baseAllergen.updatedAt,
      systemState: baseAllergen.systemState,
      name: baseAllergen.name,
      category: baseAllergen.category,
      regulatoryRef: baseAllergen.regulatoryRef,
      sortOrder: baseAllergen.sortOrder
    }
  }
}
