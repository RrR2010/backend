import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { UnitOfMeasure_PL } from '@formulations/unit-of-measure-pl.entity'
import { Id } from '@shared/value-objects'
import { SystemState } from '@shared/behaviours/lockable'
import {
  UnitOfMeasure_PL as PrismaUnitOfMeasurePL,
  MeasurementType,
  MeasurementSystem,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'

// Platform-scoped resource — no tenantId.
// These are global UnitOfMeasure_PL catalogs managed by platform users.

export type UnitOfMeasure_PLFilter = {
  measurementType?: string
  measurementSystem?: string
  systemState?: SystemState
}

export abstract class UnitOfMeasure_PLRepository {
  abstract findById(
    id: string,
    _ctx: RequestContext
  ): Promise<UnitOfMeasure_PL | null>
  abstract findAll(
    filter: UnitOfMeasure_PLFilter,
    _ctx: RequestContext
  ): Promise<UnitOfMeasure_PL[]>
  abstract save(
    entity: UnitOfMeasure_PL,
    _ctx: RequestContext
  ): Promise<UnitOfMeasure_PL>
  abstract delete(id: string, _ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaUnitOfMeasure_PLRepository implements UnitOfMeasure_PLRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<UnitOfMeasure_PL | null> {
    // Platform-scoped resource — no tenantId
    const prismaEntity = await this.prisma.unitOfMeasure_PL.findUnique({
      where: { id }
    })
    if (!prismaEntity) return null
    if (prismaEntity.systemState === 'DELETED') {
      return null
    }
    return PrismaUnitOfMeasure_PLMapper.toDomain(prismaEntity)
  }

  async findAll(
    filter: UnitOfMeasure_PLFilter,
    _ctx: RequestContext
  ): Promise<UnitOfMeasure_PL[]> {
    // Platform-scoped resource — no tenantId
    const where: Prisma.UnitOfMeasure_PLWhereInput = {}
    if (filter.measurementType) {
      where.measurementType = filter.measurementType as MeasurementType
    }
    if (filter.measurementSystem) {
      where.measurementSystem = filter.measurementSystem as MeasurementSystem
    }
    if (filter.systemState) {
      where.systemState = filter.systemState
    }
    if (!filter.systemState) {
      where.systemState = { not: SystemState.DELETED }
    }
    const prismaEntities = await this.prisma.unitOfMeasure_PL.findMany({
      where,
      orderBy: { code: 'asc' }
    })
    return prismaEntities.map((entity) =>
      PrismaUnitOfMeasure_PLMapper.toDomain(entity)
    )
  }

  async save(
    entity: UnitOfMeasure_PL,
    _ctx: RequestContext
  ): Promise<UnitOfMeasure_PL> {
    // Platform-scoped resource — no tenantId
    const id = entity.id.value
    const data = PrismaUnitOfMeasure_PLMapper.toPersistence(entity)
    await this.prisma.unitOfMeasure_PL.upsert({
      where: { id },
      update: data,
      create: data
    })
    return entity
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    // Platform-scoped resource — no tenantId
    await this.prisma.unitOfMeasure_PL.update({
      where: { id },
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaUnitOfMeasure_PLMapper {
  static toDomain(prismaEntity: PrismaUnitOfMeasurePL): UnitOfMeasure_PL {
    return UnitOfMeasure_PL.rehydrate({
      id: Id.from(prismaEntity.id),
      createdAt: prismaEntity.createdAt,
      updatedAt: prismaEntity.updatedAt,
      systemState:
        SystemState[
          prismaEntity.systemState as keyof typeof SystemState
        ],
      code: prismaEntity.code,
      symbol: prismaEntity.symbol,
      measurementType: prismaEntity.measurementType,
      measurementSystem: prismaEntity.measurementSystem,
      createdBy: prismaEntity.createdBy,
      updatedBy: prismaEntity.updatedBy
    })
  }

  static toPersistence(
    entity: UnitOfMeasure_PL
  ): Prisma.UnitOfMeasure_PLCreateInput {
    return {
      id: entity.id.value,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      systemState: entity.systemState,
      code: entity.code,
      symbol: entity.symbol,
      measurementType: entity.measurementType,
      measurementSystem: entity.measurementSystem,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy
    }
  }
}
