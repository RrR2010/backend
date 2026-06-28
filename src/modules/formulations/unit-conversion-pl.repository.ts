import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { UnitConversion_PL } from '@formulations/unit-conversion-pl.entity'
import { Id } from '@shared/value-objects'
import { SystemState } from '@shared/behaviours/lockable'
import {
  UnitConversion_PL as PrismaUnitConversionPL,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'

// Platform-scoped resource — no tenantId.
// These are global UnitConversion_PL catalogs managed by platform users.

export type UnitConversion_PLFilter = {
  fromUnitId?: string
  toUnitId?: string
  systemState?: SystemState
}

export abstract class UnitConversion_PLRepository {
  abstract findById(
    id: string,
    _ctx: RequestContext
  ): Promise<UnitConversion_PL | null>
  abstract findAll(
    filter: UnitConversion_PLFilter,
    _ctx: RequestContext
  ): Promise<UnitConversion_PL[]>
  abstract findByFromUnit(
    fromUnitId: string,
    _ctx: RequestContext
  ): Promise<UnitConversion_PL[]>
  abstract findByToUnit(
    toUnitId: string,
    _ctx: RequestContext
  ): Promise<UnitConversion_PL[]>
  abstract save(
    entity: UnitConversion_PL,
    _ctx: RequestContext
  ): Promise<UnitConversion_PL>
  abstract delete(id: string, _ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaUnitConversion_PLRepository implements UnitConversion_PLRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<UnitConversion_PL | null> {
    // Platform-scoped resource — no tenantId
    const prismaEntity = await this.prisma.unitConversion_PL.findUnique({
      where: { id }
    })
    if (!prismaEntity) return null
    if (prismaEntity.systemState === 'DELETED') {
      return null
    }
    return PrismaUnitConversion_PLMapper.toDomain(prismaEntity)
  }

  async findAll(
    filter: UnitConversion_PLFilter,
    _ctx: RequestContext
  ): Promise<UnitConversion_PL[]> {
    // Platform-scoped resource — no tenantId
    const where: Prisma.UnitConversion_PLWhereInput = {}
    if (filter.fromUnitId) {
      where.fromUnitId = filter.fromUnitId
    }
    if (filter.toUnitId) {
      where.toUnitId = filter.toUnitId
    }
    if (filter.systemState) {
      where.systemState = filter.systemState
    }
    if (!filter.systemState) {
      where.systemState = { not: SystemState.DELETED }
    }
    const prismaEntities = await this.prisma.unitConversion_PL.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    })
    return prismaEntities.map((entity) =>
      PrismaUnitConversion_PLMapper.toDomain(entity)
    )
  }

  async findByFromUnit(
    fromUnitId: string,
    _ctx: RequestContext
  ): Promise<UnitConversion_PL[]> {
    // Platform-scoped resource — no tenantId
    const prismaEntities = await this.prisma.unitConversion_PL.findMany({
      where: { fromUnitId, systemState: { not: SystemState.DELETED } },
      orderBy: { createdAt: 'asc' }
    })
    return prismaEntities.map((entity) =>
      PrismaUnitConversion_PLMapper.toDomain(entity)
    )
  }

  async findByToUnit(
    toUnitId: string,
    _ctx: RequestContext
  ): Promise<UnitConversion_PL[]> {
    // Platform-scoped resource — no tenantId
    const prismaEntities = await this.prisma.unitConversion_PL.findMany({
      where: { toUnitId, systemState: { not: SystemState.DELETED } },
      orderBy: { createdAt: 'asc' }
    })
    return prismaEntities.map((entity) =>
      PrismaUnitConversion_PLMapper.toDomain(entity)
    )
  }

  async save(
    entity: UnitConversion_PL,
    _ctx: RequestContext
  ): Promise<UnitConversion_PL> {
    // Platform-scoped resource — no tenantId
    const id = entity.id.value
    const data = PrismaUnitConversion_PLMapper.toPersistence(entity)
    await this.prisma.unitConversion_PL.upsert({
      where: { id },
      update: data,
      create: data
    })
    return entity
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    // Platform-scoped resource — no tenantId
    await this.prisma.unitConversion_PL.update({
      where: { id },
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaUnitConversion_PLMapper {
  static toDomain(prismaEntity: PrismaUnitConversionPL): UnitConversion_PL {
    return UnitConversion_PL.rehydrate({
      id: Id.from(prismaEntity.id),
      createdAt: prismaEntity.createdAt,
      updatedAt: prismaEntity.updatedAt,
      systemState:
        SystemState[
          prismaEntity.systemState as keyof typeof SystemState
        ],
      fromUnitId: prismaEntity.fromUnitId,
      toUnitId: prismaEntity.toUnitId,
      factor: Number(prismaEntity.factor),
      createdBy: prismaEntity.createdBy,
      updatedBy: prismaEntity.updatedBy
    })
  }

  static toPersistence(
    entity: UnitConversion_PL
  ): Prisma.UnitConversion_PLUncheckedCreateInput {
    return {
      id: entity.id.value,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      systemState: entity.systemState,
      fromUnitId: entity.fromUnitId,
      toUnitId: entity.toUnitId,
      factor: entity.factor,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy
    }
  }
}
