import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { Regulation_PL } from '@ingredients/regulation-pl.entity'
import { Id } from '@shared/value-objects'
import { SystemState } from '@shared/behaviours/lockable'
import {
  Regulation_PL as PrismaRegulationPL,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'

export type Regulation_PLFilter = {
  regulatoryBodyId?: string
  regulationTypeId?: string
  systemState?: SystemState
}

export abstract class Regulation_PLRepository {
  abstract findById(
    id: string,
    _ctx: RequestContext
  ): Promise<Regulation_PL | null>
  abstract findAll(
    filter: Regulation_PLFilter,
    _ctx: RequestContext
  ): Promise<Regulation_PL[]>
  abstract findByRegulatoryBody(
    regulatoryBodyId: string,
    _ctx: RequestContext
  ): Promise<Regulation_PL[]>
  abstract findByRegulationType(
    regulationTypeId: string,
    _ctx: RequestContext
  ): Promise<Regulation_PL[]>
  abstract save(
    entity: Regulation_PL,
    _ctx: RequestContext
  ): Promise<Regulation_PL>
  abstract delete(id: string, _ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaRegulation_PLRepository
  implements Regulation_PLRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<Regulation_PL | null> {
    // Platform-scoped resource — no tenantId
    const prismaEntity = await this.prisma.regulation_PL.findUnique({
      where: { id }
    })
    if (!prismaEntity) return null
    if (prismaEntity.systemState === 'DELETED') {
      return null
    }
    return PrismaRegulation_PLMapper.toDomain(prismaEntity)
  }

  async findAll(
    filter: Regulation_PLFilter,
    _ctx: RequestContext
  ): Promise<Regulation_PL[]> {
    // Platform-scoped resource — no tenantId
    const where: Prisma.Regulation_PLWhereInput = {}
    if (filter.regulatoryBodyId) {
      where.regulatoryBodyId = filter.regulatoryBodyId
    }
    if (filter.regulationTypeId) {
      where.regulationTypeId = filter.regulationTypeId
    }
    if (filter.systemState) {
      where.systemState = filter.systemState
    }
    if (!filter.systemState) {
      where.systemState = { not: SystemState.DELETED }
    }
    const prismaEntities = await this.prisma.regulation_PL.findMany({
      where,
      orderBy: [{ year: 'desc' }, { number: 'asc' }]
    })
    return prismaEntities.map((entity) =>
      PrismaRegulation_PLMapper.toDomain(entity)
    )
  }

  async findByRegulatoryBody(
    regulatoryBodyId: string,
    _ctx: RequestContext
  ): Promise<Regulation_PL[]> {
    // Platform-scoped resource — no tenantId
    return this.findAll({ regulatoryBodyId }, _ctx)
  }

  async findByRegulationType(
    regulationTypeId: string,
    _ctx: RequestContext
  ): Promise<Regulation_PL[]> {
    // Platform-scoped resource — no tenantId
    return this.findAll({ regulationTypeId }, _ctx)
  }

  async save(
    entity: Regulation_PL,
    _ctx: RequestContext
  ): Promise<Regulation_PL> {
    // Platform-scoped resource — no tenantId
    const id = entity.id.value
    const data = PrismaRegulation_PLMapper.toPersistence(entity)
    await this.prisma.regulation_PL.upsert({
      where: { id },
      update: data,
      create: data
    })
    return entity
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    // Platform-scoped resource — no tenantId
    await this.prisma.regulation_PL.update({
      where: { id },
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaRegulation_PLMapper {
  static toDomain(prismaEntity: PrismaRegulationPL): Regulation_PL {
    return Regulation_PL.rehydrate({
      id: Id.from(prismaEntity.id),
      createdAt: prismaEntity.createdAt,
      updatedAt: prismaEntity.updatedAt,
      systemState:
        SystemState[
          prismaEntity.systemState as keyof typeof SystemState
        ],
      number: prismaEntity.number,
      year: prismaEntity.year,
      title: prismaEntity.title,
      publishedAt: prismaEntity.publishedAt,
      regulatoryBodyId: prismaEntity.regulatoryBodyId,
      regulationTypeId: prismaEntity.regulationTypeId
    })
  }

  static toPersistence(
    entity: Regulation_PL
  ): Prisma.Regulation_PLUncheckedCreateInput {
    return {
      id: entity.id.value,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      systemState: entity.systemState,
      number: entity.number,
      year: entity.year,
      title: entity.title,
      publishedAt: entity.publishedAt,
      regulatoryBodyId: entity.regulatoryBodyId,
      regulationTypeId: entity.regulationTypeId
    }
  }
}
