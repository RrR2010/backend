import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { RegulationType_PL } from '@ingredients/regulation-type-pl.entity'
import { Id } from '@shared/value-objects'
import { SystemState } from '@shared/behaviours/lockable'
import {
  RegulationType_PL as PrismaRegulationTypePL,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'

export type RegulationType_PLFilter = {
  systemState?: SystemState
}

export abstract class RegulationType_PLRepository {
  abstract findById(
    id: string,
    _ctx: RequestContext
  ): Promise<RegulationType_PL | null>
  abstract findAll(
    filter: RegulationType_PLFilter,
    _ctx: RequestContext
  ): Promise<RegulationType_PL[]>
  abstract save(
    entity: RegulationType_PL,
    _ctx: RequestContext
  ): Promise<RegulationType_PL>
  abstract delete(id: string, _ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaRegulationType_PLRepository
  implements RegulationType_PLRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<RegulationType_PL | null> {
    // Platform-scoped resource — no tenantId
    const prismaEntity = await this.prisma.regulationType_PL.findUnique({
      where: { id }
    })
    if (!prismaEntity) return null
    if (prismaEntity.systemState === 'DELETED') {
      return null
    }
    return PrismaRegulationType_PLMapper.toDomain(prismaEntity)
  }

  async findAll(
    filter: RegulationType_PLFilter,
    _ctx: RequestContext
  ): Promise<RegulationType_PL[]> {
    // Platform-scoped resource — no tenantId
    const where: Prisma.RegulationType_PLWhereInput = {}
    if (filter.systemState) {
      where.systemState = filter.systemState
    }
    if (!filter.systemState) {
      where.systemState = { not: SystemState.DELETED }
    }
    const prismaEntities = await this.prisma.regulationType_PL.findMany({
      where,
      orderBy: { code: 'asc' }
    })
    return prismaEntities.map((entity) =>
      PrismaRegulationType_PLMapper.toDomain(entity)
    )
  }

  async save(
    entity: RegulationType_PL,
    _ctx: RequestContext
  ): Promise<RegulationType_PL> {
    // Platform-scoped resource — no tenantId
    const id = entity.id.value
    const data = PrismaRegulationType_PLMapper.toPersistence(entity)
    await this.prisma.regulationType_PL.upsert({
      where: { id },
      update: data,
      create: data
    })
    return entity
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    // Platform-scoped resource — no tenantId
    await this.prisma.regulationType_PL.update({
      where: { id },
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaRegulationType_PLMapper {
  static toDomain(
    prismaEntity: PrismaRegulationTypePL
  ): RegulationType_PL {
    return RegulationType_PL.rehydrate({
      id: Id.from(prismaEntity.id),
      createdAt: prismaEntity.createdAt,
      updatedAt: prismaEntity.updatedAt,
      systemState:
        SystemState[
          prismaEntity.systemState as keyof typeof SystemState
        ],
      abbreviation: prismaEntity.abbreviation,
      code: prismaEntity.code,
      name: prismaEntity.name,
      description: prismaEntity.description
    })
  }

  static toPersistence(
    entity: RegulationType_PL
  ): Prisma.RegulationType_PLCreateInput {
    return {
      id: entity.id.value,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      systemState: entity.systemState,
      abbreviation: entity.abbreviation,
      code: entity.code,
      name: entity.name,
      description: entity.description
    }
  }
}
