import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { Allergen_PL } from '@ingredients/allergen-pl.entity'
import { Id } from '@shared/value-objects'
import { SystemState } from '@shared/behaviours/lockable'
import {
  Allergen_PL as PrismaAllergenPL,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'

// EXCEÇÃO: Allergen_PL é entidade platform-scoped (sem tenantId).
// Permanece acessível globalmente por usuários PLATFORM durante impersonação.
// Regra de Negócio #11 do EPIC_010.

export type Allergen_PLFilter = {
  category?: string
  systemState?: SystemState
}

export abstract class Allergen_PLRepository {
  abstract findById(
    id: string,
    _ctx: RequestContext
  ): Promise<Allergen_PL | null>
  abstract findAll(
    filter: Allergen_PLFilter,
    _ctx: RequestContext
  ): Promise<Allergen_PL[]>
  abstract save(
    allergen: Allergen_PL,
    _ctx: RequestContext
  ): Promise<Allergen_PL>
  abstract delete(id: string, _ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaAllergen_PLRepository implements Allergen_PLRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<Allergen_PL | null> {
    // Platform-scoped resource — no tenantId
    const prismaAllergenPL = await this.prisma.allergen_PL.findUnique({
      where: { id }
    })
    if (!prismaAllergenPL) return null
    if (prismaAllergenPL.systemState === 'DELETED') {
      return null
    }
    return PrismaAllergen_PLMapper.toDomain(prismaAllergenPL)
  }

  async findAll(
    filter: Allergen_PLFilter,
    _ctx: RequestContext
  ): Promise<Allergen_PL[]> {
    // Platform-scoped resource — no tenantId
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
    const prismaAllergensPL = await this.prisma.allergen_PL.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    })
    return prismaAllergensPL.map((allergen) =>
      PrismaAllergen_PLMapper.toDomain(allergen)
    )
  }

  async save(
    allergen: Allergen_PL,
    _ctx: RequestContext
  ): Promise<Allergen_PL> {
    // Platform-scoped resource — no tenantId
    const id = allergen.id.value
    const data = PrismaAllergen_PLMapper.toPersistence(allergen)
    await this.prisma.allergen_PL.upsert({
      where: { id },
      update: data,
      create: data
    })
    return allergen
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    // Platform-scoped resource — no tenantId
    await this.prisma.allergen_PL.update({
      where: { id },
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaAllergen_PLMapper {
  static toDomain(prismaAllergenPL: PrismaAllergenPL): Allergen_PL {
    return Allergen_PL.rehydrate({
      id: Id.from(prismaAllergenPL.id),
      createdAt: prismaAllergenPL.createdAt,
      updatedAt: prismaAllergenPL.updatedAt,
      systemState:
        SystemState[
          prismaAllergenPL.systemState as keyof typeof SystemState
        ],
      name: prismaAllergenPL.name,
      category: prismaAllergenPL.category,
      regulatoryRef: prismaAllergenPL.regulatoryRef,
      sortOrder: prismaAllergenPL.sortOrder,
      createdBy: prismaAllergenPL.createdBy,
      updatedBy: prismaAllergenPL.updatedBy
    })
  }

  static toPersistence(
    allergen: Allergen_PL
  ): Prisma.Allergen_PLCreateInput {
    return {
      id: allergen.id.value,
      createdAt: allergen.createdAt,
      updatedAt: allergen.updatedAt,
      systemState: allergen.systemState,
      name: allergen.name,
      category: allergen.category,
      regulatoryRef: allergen.regulatoryRef,
      sortOrder: allergen.sortOrder,
      createdBy: allergen.createdBy,
      updatedBy: allergen.updatedBy
    }
  }
}
