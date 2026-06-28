import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { RegulatoryBody_PL } from '@ingredients/regulatory-body-pl.entity'
import { Id } from '@shared/value-objects'
import { SystemState } from '@shared/behaviours/lockable'
import {
  RegulatoryBody_PL as PrismaRegulatoryBodyPL,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'

export type RegulatoryBody_PLFilter = {
  systemState?: SystemState
}

export abstract class RegulatoryBody_PLRepository {
  abstract findById(
    id: string,
    _ctx: RequestContext
  ): Promise<RegulatoryBody_PL | null>
  abstract findAll(
    filter: RegulatoryBody_PLFilter,
    _ctx: RequestContext
  ): Promise<RegulatoryBody_PL[]>
  abstract save(
    entity: RegulatoryBody_PL,
    _ctx: RequestContext
  ): Promise<RegulatoryBody_PL>
  abstract delete(id: string, _ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaRegulatoryBody_PLRepository
  implements RegulatoryBody_PLRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<RegulatoryBody_PL | null> {
    // Platform-scoped resource — no tenantId
    const prismaEntity = await this.prisma.regulatoryBody_PL.findUnique({
      where: { id }
    })
    if (!prismaEntity) return null
    if (prismaEntity.systemState === 'DELETED') {
      return null
    }
    return PrismaRegulatoryBody_PLMapper.toDomain(prismaEntity)
  }

  async findAll(
    filter: RegulatoryBody_PLFilter,
    _ctx: RequestContext
  ): Promise<RegulatoryBody_PL[]> {
    // Platform-scoped resource — no tenantId
    const where: Prisma.RegulatoryBody_PLWhereInput = {}
    if (filter.systemState) {
      where.systemState = filter.systemState
    }
    if (!filter.systemState) {
      where.systemState = { not: SystemState.DELETED }
    }
    const prismaEntities = await this.prisma.regulatoryBody_PL.findMany({
      where,
      orderBy: { code: 'asc' }
    })
    return prismaEntities.map((entity) =>
      PrismaRegulatoryBody_PLMapper.toDomain(entity)
    )
  }

  async save(
    entity: RegulatoryBody_PL,
    _ctx: RequestContext
  ): Promise<RegulatoryBody_PL> {
    // Platform-scoped resource — no tenantId
    const id = entity.id.value
    const data = PrismaRegulatoryBody_PLMapper.toPersistence(entity)
    await this.prisma.regulatoryBody_PL.upsert({
      where: { id },
      update: data,
      create: data
    })
    return entity
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    // Platform-scoped resource — no tenantId
    await this.prisma.regulatoryBody_PL.update({
      where: { id },
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaRegulatoryBody_PLMapper {
  static toDomain(
    prismaEntity: PrismaRegulatoryBodyPL
  ): RegulatoryBody_PL {
    return RegulatoryBody_PL.rehydrate({
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
    entity: RegulatoryBody_PL
  ): Prisma.RegulatoryBody_PLCreateInput {
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
