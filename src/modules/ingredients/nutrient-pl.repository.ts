import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { Nutrient_PL } from '@ingredients/nutrient-pl.entity'
import { Id } from '@shared/value-objects'
import { SystemState } from '@shared/behaviours/lockable'
import {
  Nutrient_PL as PrismaNutrientPL,
  Prisma,
  NutrientUnit,
  NutrientCategory
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'

// EXCEÇÃO: Nutrient_PL é entidade platform-scoped (sem tenantId).
// Permanece acessível globalmente por usuários PLATFORM durante impersonação.
// Regra de Negócio #11 do EPIC_010.

export type Nutrient_PLFilter = {
  unit?: string
  category?: string
  systemState?: SystemState
  skip?: number
  take?: number
}

export abstract class Nutrient_PLRepository {
  abstract findById(
    id: string,
    _ctx: RequestContext
  ): Promise<Nutrient_PL | null>
  abstract findAll(
    filter: Nutrient_PLFilter,
    _ctx: RequestContext
  ): Promise<Nutrient_PL[]>
  abstract findByParentId(
    parentId: string,
    _ctx: RequestContext
  ): Promise<Nutrient_PL[]>
  abstract findRoots(
    _ctx: RequestContext
  ): Promise<Nutrient_PL[]>
  abstract save(
    nutrient: Nutrient_PL,
    _ctx: RequestContext
  ): Promise<Nutrient_PL>
  abstract delete(id: string, _ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaNutrient_PLRepository implements Nutrient_PLRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<Nutrient_PL | null> {
    // Platform-scoped resource — no tenantId
    const prismaNutrientPL = await this.prisma.nutrient_PL.findUnique({
      where: { id }
    })
    if (!prismaNutrientPL) return null
    if (prismaNutrientPL.systemState === 'DELETED') {
      return null
    }
    return PrismaNutrient_PLMapper.toDomain(prismaNutrientPL)
  }

  async findAll(
    filter: Nutrient_PLFilter,
    _ctx: RequestContext
  ): Promise<Nutrient_PL[]> {
    // Platform-scoped resource — no tenantId
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
    const prismaNutrientsPL = await this.prisma.nutrient_PL.findMany({
      where,
      skip: filter.skip ?? 0,
      take: filter.take ?? 50,
      orderBy: { sortOrder: 'asc' }
    })
    return prismaNutrientsPL.map((nutrient) =>
      PrismaNutrient_PLMapper.toDomain(nutrient)
    )
  }

  async findByParentId(
    parentId: string,
    _ctx: RequestContext
  ): Promise<Nutrient_PL[]> {
    // Platform-scoped resource — no tenantId
    const prismaNutrientsPL = await this.prisma.nutrient_PL.findMany({
      where: {
        parentId,
        systemState: { not: SystemState.DELETED }
      },
      orderBy: { sortOrder: 'asc' }
    })
    return prismaNutrientsPL.map((nutrient) =>
      PrismaNutrient_PLMapper.toDomain(nutrient)
    )
  }

  async findRoots(
    _ctx: RequestContext
  ): Promise<Nutrient_PL[]> {
    // Platform-scoped resource — no tenantId
    const prismaNutrientsPL = await this.prisma.nutrient_PL.findMany({
      where: {
        parentId: null,
        systemState: { not: SystemState.DELETED }
      },
      orderBy: { sortOrder: 'asc' }
    })
    return prismaNutrientsPL.map((nutrient) =>
      PrismaNutrient_PLMapper.toDomain(nutrient)
    )
  }

  async save(
    nutrient: Nutrient_PL,
    _ctx: RequestContext
  ): Promise<Nutrient_PL> {
    // Platform-scoped resource — no tenantId
    const id = nutrient.id.value
    const data = PrismaNutrient_PLMapper.toPersistence(nutrient)
    await this.prisma.nutrient_PL.upsert({
      where: { id },
      update: data,
      create: data
    })
    return nutrient
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    // Platform-scoped resource — no tenantId
    await this.prisma.nutrient_PL.update({
      where: { id },
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaNutrient_PLMapper {
  static toDomain(prismaNutrientPL: PrismaNutrientPL): Nutrient_PL {
    return Nutrient_PL.rehydrate({
      id: Id.from(prismaNutrientPL.id),
      createdAt: prismaNutrientPL.createdAt,
      updatedAt: prismaNutrientPL.updatedAt,
      systemState:
        SystemState[
          prismaNutrientPL.systemState as keyof typeof SystemState
        ],
      name: prismaNutrientPL.name,
      unit: prismaNutrientPL.unit,
      category: prismaNutrientPL.category,
      parentId: prismaNutrientPL.parentId,
      level: prismaNutrientPL.level,
      sortOrder: prismaNutrientPL.sortOrder,
      regulatoryRef: prismaNutrientPL.regulatoryRef,
      createdBy: prismaNutrientPL.createdBy,
      updatedBy: prismaNutrientPL.updatedBy
    })
  }

  static toPersistence(
    nutrient: Nutrient_PL
  ): Prisma.Nutrient_PLUncheckedCreateInput {
    return {
      id: nutrient.id.value,
      createdAt: nutrient.createdAt,
      updatedAt: nutrient.updatedAt,
      systemState: nutrient.systemState,
      name: nutrient.name,
      unit: nutrient.unit,
      category: nutrient.category,
      parentId: nutrient.parentId,
      level: nutrient.level,
      sortOrder: nutrient.sortOrder,
      regulatoryRef: nutrient.regulatoryRef,
      createdBy: nutrient.createdBy,
      updatedBy: nutrient.updatedBy
    }
  }
}
