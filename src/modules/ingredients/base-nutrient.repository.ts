import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { BaseNutrient } from '@ingredients/base-nutrient.entity'
import { Id } from '@shared/value-objects'
import { SystemState } from '@shared/behaviours/lockable'
import {
  Nutrient_PL as PrismaNutrient_PL,
  Prisma,
  NutrientUnit,
  NutrientCategory
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'

// EXCEÇÃO: BaseNutrient é entidade platform-scoped (sem tenantId).
// Permanece acessível globalmente por usuários PLATFORM durante impersonação.
// Regra de Negócio #11 do EPIC_010.

export type BaseNutrientFilter = {
  unit?: string
  category?: string
  systemState?: SystemState
}

export abstract class BaseNutrientRepository {
  abstract findById(
    id: string,
    _ctx: RequestContext
  ): Promise<BaseNutrient | null>
  abstract findAll(
    filter: BaseNutrientFilter,
    _ctx: RequestContext
  ): Promise<BaseNutrient[]>
  abstract save(
    baseNutrient: BaseNutrient,
    _ctx: RequestContext
  ): Promise<BaseNutrient>
  abstract delete(id: string, _ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaNutrient_PLRepository implements BaseNutrientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<BaseNutrient | null> {
    const prismaBaseNutrient = await this.prisma.nutrient_PL.findUnique({
      where: { id }
    })
    if (!prismaBaseNutrient) return null
    if (prismaBaseNutrient.systemState === 'DELETED') {
      return null
    }
    return PrismaNutrient_PLMapper.toDomain(prismaBaseNutrient)
  }

  async findAll(
    filter: BaseNutrientFilter,
    _ctx: RequestContext
  ): Promise<BaseNutrient[]> {
    const where: Prisma.Nutrient_PLWhereInput = {}
    if (filter.unit) {
      where.unit = filter.unit as NutrientUnit
    }
    if (filter.category) {
      where.category = filter.category as NutrientCategory
    }
    if (filter.systemState) {
      where.systemState = filter.systemState
    }
    if (!filter.systemState) {
      where.systemState = { not: SystemState.DELETED }
    }
    const prismaBaseNutrients = await this.prisma.nutrient_PL.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    })
    return prismaBaseNutrients.map((nutrient) =>
      PrismaNutrient_PLMapper.toDomain(nutrient)
    )
  }

  async save(
    baseNutrient: BaseNutrient,
    _ctx: RequestContext
  ): Promise<BaseNutrient> {
    const id = baseNutrient.id.value
    const prismaBaseNutrient =
      PrismaNutrient_PLMapper.toPersistence(baseNutrient)
    await this.prisma.nutrient_PL.upsert({
      where: { id },
      update: prismaBaseNutrient,
      create: prismaBaseNutrient
    })
    return baseNutrient
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    const where: Prisma.Nutrient_PLWhereUniqueInput = { id }
    await this.prisma.nutrient_PL.update({
      where,
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaNutrient_PLMapper {
  static toDomain(prismaBaseNutrient: PrismaNutrient_PL): BaseNutrient {
    return BaseNutrient.rehydrate({
      id: Id.from(prismaBaseNutrient.id),
      createdAt: prismaBaseNutrient.createdAt,
      updatedAt: prismaBaseNutrient.updatedAt,
      systemState:
        SystemState[prismaBaseNutrient.systemState as keyof typeof SystemState],
      name: prismaBaseNutrient.name,
      unit: prismaBaseNutrient.unit,
      category: prismaBaseNutrient.category,
      sortOrder: prismaBaseNutrient.sortOrder
    })
  }

  static toPersistence(
    baseNutrient: BaseNutrient
  ): Prisma.Nutrient_PLCreateInput {
    return {
      id: baseNutrient.id.value,
      createdAt: baseNutrient.createdAt,
      updatedAt: baseNutrient.updatedAt,
      systemState: baseNutrient.systemState,
      name: baseNutrient.name,
      unit: baseNutrient.unit,
      category: baseNutrient.category,
      sortOrder: baseNutrient.sortOrder
    }
  }
}
