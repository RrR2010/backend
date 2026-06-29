import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { ComplianceRule_PL } from '@ingredients/compliance-rule-pl.entity'
import { Id } from '@shared/value-objects'
import { SystemState } from '@shared/behaviours/lockable'
import {
  ComplianceRule_PL as PrismaComplianceRulePL,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'

export type ComplianceRule_PLFilter = {
  regulationId?: string
  nutrientId?: string
  systemState?: SystemState
}

export abstract class ComplianceRule_PLRepository {
  abstract findById(
    id: string,
    _ctx: RequestContext
  ): Promise<ComplianceRule_PL | null>
  abstract findAll(
    filter: ComplianceRule_PLFilter,
    _ctx: RequestContext
  ): Promise<ComplianceRule_PL[]>
  abstract findByRegulation(
    regulationId: string,
    _ctx: RequestContext
  ): Promise<ComplianceRule_PL[]>
  abstract save(
    entity: ComplianceRule_PL,
    _ctx: RequestContext
  ): Promise<ComplianceRule_PL>
  abstract delete(id: string, _ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaComplianceRule_PLRepository
  implements ComplianceRule_PLRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<ComplianceRule_PL | null> {
    // Platform-scoped resource — no tenantId
    const prismaEntity =
      await this.prisma.complianceRule_PL.findUnique({
        where: { id }
      })
    if (!prismaEntity) return null
    if (prismaEntity.systemState === 'DELETED') {
      return null
    }
    return PrismaComplianceRule_PLMapper.toDomain(prismaEntity)
  }

  async findAll(
    filter: ComplianceRule_PLFilter,
    _ctx: RequestContext
  ): Promise<ComplianceRule_PL[]> {
    // Platform-scoped resource — no tenantId
    const where: Prisma.ComplianceRule_PLWhereInput = {}
    if (filter.regulationId) {
      where.regulationId = filter.regulationId
    }
    if (filter.nutrientId) {
      where.nutrientId = filter.nutrientId
    }
    if (filter.systemState) {
      where.systemState = filter.systemState
    }
    if (!filter.systemState) {
      where.systemState = { not: SystemState.DELETED }
    }
    const prismaEntities =
      await this.prisma.complianceRule_PL.findMany({
        where,
        orderBy: [{ category: 'asc' }, { code: 'asc' }]
      })
    return prismaEntities.map((entity) =>
      PrismaComplianceRule_PLMapper.toDomain(entity)
    )
  }

  async findByRegulation(
    regulationId: string,
    _ctx: RequestContext
  ): Promise<ComplianceRule_PL[]> {
    // Platform-scoped resource — no tenantId
    return this.findAll({ regulationId }, _ctx)
  }

  async save(
    entity: ComplianceRule_PL,
    _ctx: RequestContext
  ): Promise<ComplianceRule_PL> {
    // Platform-scoped resource — no tenantId
    const id = entity.id.value
    const data = PrismaComplianceRule_PLMapper.toPersistence(entity)
    await this.prisma.complianceRule_PL.upsert({
      where: { id },
      update: data,
      create: data
    })
    return entity
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    // Platform-scoped resource — no tenantId
    await this.prisma.complianceRule_PL.update({
      where: { id },
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaComplianceRule_PLMapper {
  static toDomain(
    prismaEntity: PrismaComplianceRulePL
  ): ComplianceRule_PL {
    return ComplianceRule_PL.rehydrate({
      id: Id.from(prismaEntity.id),
      createdAt: prismaEntity.createdAt,
      updatedAt: prismaEntity.updatedAt,
      systemState:
        SystemState[
          prismaEntity.systemState as keyof typeof SystemState
        ],
      code: prismaEntity.code,
      category: prismaEntity.category,
      ruleType: prismaEntity.ruleType,
      description: prismaEntity.description,
      condition: typeof prismaEntity.condition === 'object' ? prismaEntity.condition as Record<string, unknown> : null,
      severity: prismaEntity.severity,
      regulationId: prismaEntity.regulationId,
      nutrientId: prismaEntity.nutrientId
    })
  }

  static toPersistence(
    entity: ComplianceRule_PL
  ): Prisma.ComplianceRule_PLUncheckedCreateInput {
    return {
      id: entity.id.value,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      systemState: entity.systemState,
      code: entity.code,
      category: entity.category,
      ruleType: entity.ruleType,
      description: entity.description,
      condition: entity.condition as Prisma.InputJsonValue,
      severity: entity.severity,
      regulationId: entity.regulationId,
      nutrientId: entity.nutrientId
    }
  }
}
