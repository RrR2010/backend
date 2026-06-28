import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { BaseAllergen } from '@ingredients/base-allergen.entity'
import { Id } from '@shared/value-objects'
import { SystemState } from '@shared/behaviours/lockable'
import { Allergen_PL as PrismaAllergen_PL, Prisma } from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'

// EXCEÇÃO: BaseAllergen é entidade platform-scoped (sem tenantId).
// Permanece acessível globalmente por usuários PLATFORM durante impersonação.
// Regra de Negócio #11 do EPIC_010.

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
export class PrismaAllergen_PLRepository implements BaseAllergenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<BaseAllergen | null> {
    const prismaBaseAllergen = await this.prisma.allergen_PL.findUnique({
      where: { id }
    })
    if (!prismaBaseAllergen) return null
    if (prismaBaseAllergen.systemState === 'DELETED') {
      return null
    }
    return PrismaAllergen_PLMapper.toDomain(prismaBaseAllergen)
  }

  async findAll(
    filter: BaseAllergenFilter,
    _ctx: RequestContext
  ): Promise<BaseAllergen[]> {
    const where: Prisma.Allergen_PLWhereInput = {}
    if (filter.category) {
      where.category = { contains: filter.category, mode: 'insensitive' }
    }
    if (filter.systemState) {
      where.systemState = filter.systemState
    }
    if (!filter.systemState) {
      where.systemState = { not: SystemState.DELETED }
    }
    const prismaBaseAllergens = await this.prisma.allergen_PL.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    })
    return prismaBaseAllergens.map((allergen) =>
      PrismaAllergen_PLMapper.toDomain(allergen)
    )
  }

  async save(
    baseAllergen: BaseAllergen,
    _ctx: RequestContext
  ): Promise<BaseAllergen> {
    const id = baseAllergen.id.value
    const prismaBaseAllergen =
      PrismaAllergen_PLMapper.toPersistence(baseAllergen)
    await this.prisma.allergen_PL.upsert({
      where: { id },
      update: prismaBaseAllergen,
      create: prismaBaseAllergen
    })
    return baseAllergen
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    const where: Prisma.Allergen_PLWhereUniqueInput = { id }
    await this.prisma.allergen_PL.update({
      where,
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaAllergen_PLMapper {
  static toDomain(prismaBaseAllergen: PrismaAllergen_PL): BaseAllergen {
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
  ): Prisma.Allergen_PLCreateInput {
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
