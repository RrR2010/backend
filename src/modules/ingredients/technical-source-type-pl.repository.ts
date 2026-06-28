import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { TechnicalSourceType_PL } from '@ingredients/technical-source-type-pl.entity'
import { Id } from '@shared/value-objects'
import { SystemState } from '@shared/behaviours/lockable'
import {
  TechnicalSourceType_PL as PrismaTechnicalSourceTypePL,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'

// EXCEÇÃO: TechnicalSourceType_PL é entidade platform-scoped (sem tenantId).
// Permanece acessível globalmente por usuários PLATFORM durante impersonação.

export type TechnicalSourceType_PLFilter = {
  systemState?: SystemState
}

export abstract class TechnicalSourceType_PLRepository {
  abstract findById(
    id: string,
    _ctx: RequestContext
  ): Promise<TechnicalSourceType_PL | null>
  abstract findAll(
    filter: TechnicalSourceType_PLFilter,
    _ctx: RequestContext
  ): Promise<TechnicalSourceType_PL[]>
  abstract save(
    type: TechnicalSourceType_PL,
    _ctx: RequestContext
  ): Promise<TechnicalSourceType_PL>
  abstract delete(id: string, _ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaTechnicalSourceType_PLRepository
  implements TechnicalSourceType_PLRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<TechnicalSourceType_PL | null> {
    // Platform-scoped resource — no tenantId
    const prismaTechnicalSourceTypePL =
      await this.prisma.technicalSourceType_PL.findUnique({
        where: { id }
      })
    if (!prismaTechnicalSourceTypePL) return null
    if (prismaTechnicalSourceTypePL.systemState === 'DELETED') {
      return null
    }
    return PrismaTechnicalSourceType_PLMapper.toDomain(
      prismaTechnicalSourceTypePL
    )
  }

  async findAll(
    filter: TechnicalSourceType_PLFilter,
    _ctx: RequestContext
  ): Promise<TechnicalSourceType_PL[]> {
    // Platform-scoped resource — no tenantId
    const where: Prisma.TechnicalSourceType_PLWhereInput = {}
    if (filter.systemState) {
      where.systemState = filter.systemState
    }
    if (!filter.systemState) {
      where.systemState = { not: SystemState.DELETED }
    }
    const prismaTypesPL =
      await this.prisma.technicalSourceType_PL.findMany({
        where,
        orderBy: { code: 'asc' }
      })
    return prismaTypesPL.map((type) =>
      PrismaTechnicalSourceType_PLMapper.toDomain(type)
    )
  }

  async save(
    type: TechnicalSourceType_PL,
    _ctx: RequestContext
  ): Promise<TechnicalSourceType_PL> {
    // Platform-scoped resource — no tenantId
    const id = type.id.value
    const data = PrismaTechnicalSourceType_PLMapper.toPersistence(type)
    await this.prisma.technicalSourceType_PL.upsert({
      where: { id },
      update: data,
      create: data
    })
    return type
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    // Platform-scoped resource — no tenantId
    await this.prisma.technicalSourceType_PL.update({
      where: { id },
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaTechnicalSourceType_PLMapper {
  static toDomain(
    prismaTechnicalSourceTypePL: PrismaTechnicalSourceTypePL
  ): TechnicalSourceType_PL {
    return TechnicalSourceType_PL.rehydrate({
      id: Id.from(prismaTechnicalSourceTypePL.id),
      createdAt: prismaTechnicalSourceTypePL.createdAt,
      updatedAt: prismaTechnicalSourceTypePL.updatedAt,
      systemState:
        SystemState[
          prismaTechnicalSourceTypePL.systemState as keyof typeof SystemState
        ],
      code: prismaTechnicalSourceTypePL.code,
      name: prismaTechnicalSourceTypePL.name,
      description: prismaTechnicalSourceTypePL.description
    })
  }

  static toPersistence(
    type: TechnicalSourceType_PL
  ): Prisma.TechnicalSourceType_PLCreateInput {
    return {
      id: type.id.value,
      createdAt: type.createdAt,
      updatedAt: type.updatedAt,
      systemState: type.systemState,
      code: type.code,
      name: type.name,
      description: type.description
    }
  }
}
