import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { LabelField_PL } from '@products/label-field-pl.entity'
import { Id } from '@shared/value-objects'
import { SystemState } from '@shared/behaviours/lockable'
import {
  LabelField_PL as PrismaLabelFieldPL,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'

// EXCEÇÃO: LabelField_PL é entidade platform-scoped (sem tenantId).
// Permanece acessível globalmente por usuários PLATFORM durante impersonação.
// Regra de Negócio #11 do EPIC_010.

export type LabelField_PLFilter = {
  fieldName?: string
  systemState?: SystemState
}

export abstract class LabelField_PLRepository {
  abstract findById(
    id: string,
    _ctx: RequestContext
  ): Promise<LabelField_PL | null>
  abstract findAll(
    filter: LabelField_PLFilter,
    _ctx: RequestContext
  ): Promise<LabelField_PL[]>
  abstract save(
    labelField: LabelField_PL,
    _ctx: RequestContext
  ): Promise<LabelField_PL>
  abstract delete(id: string, _ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaLabelField_PLRepository implements LabelField_PLRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<LabelField_PL | null> {
    // Platform-scoped resource — no tenantId
    const prismaLabelFieldPL = await this.prisma.labelField_PL.findUnique({
      where: { id }
    })
    if (!prismaLabelFieldPL) return null
    if (prismaLabelFieldPL.systemState === 'DELETED') {
      return null
    }
    return PrismaLabelField_PLMapper.toDomain(prismaLabelFieldPL)
  }

  async findAll(
    filter: LabelField_PLFilter,
    _ctx: RequestContext
  ): Promise<LabelField_PL[]> {
    // Platform-scoped resource — no tenantId
    const where: Prisma.LabelField_PLWhereInput = {}
    if (filter.fieldName) {
      where.fieldName = { contains: filter.fieldName, mode: 'insensitive' }
    }
    if (filter.systemState) {
      where.systemState = filter.systemState
    }
    if (!filter.systemState) {
      where.systemState = { not: SystemState.DELETED }
    }
    const prismaLabelFieldsPL = await this.prisma.labelField_PL.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    })
    return prismaLabelFieldsPL.map((field) =>
      PrismaLabelField_PLMapper.toDomain(field)
    )
  }

  async save(
    labelField: LabelField_PL,
    _ctx: RequestContext
  ): Promise<LabelField_PL> {
    // Platform-scoped resource — no tenantId
    const id = labelField.id.value
    const data = PrismaLabelField_PLMapper.toPersistence(labelField)
    await this.prisma.labelField_PL.upsert({
      where: { id },
      update: data,
      create: data
    })
    return labelField
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    // Platform-scoped resource — no tenantId
    await this.prisma.labelField_PL.update({
      where: { id },
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaLabelField_PLMapper {
  static toDomain(prismaLabelFieldPL: PrismaLabelFieldPL): LabelField_PL {
    return LabelField_PL.rehydrate({
      id: Id.from(prismaLabelFieldPL.id),
      createdAt: prismaLabelFieldPL.createdAt,
      updatedAt: prismaLabelFieldPL.updatedAt,
      systemState:
        SystemState[
          prismaLabelFieldPL.systemState as keyof typeof SystemState
        ],
      fieldName: prismaLabelFieldPL.fieldName,
      sortOrder: prismaLabelFieldPL.sortOrder
    })
  }

  static toPersistence(
    labelField: LabelField_PL
  ): Prisma.LabelField_PLCreateInput {
    return {
      id: labelField.id.value,
      createdAt: labelField.createdAt,
      updatedAt: labelField.updatedAt,
      systemState: labelField.systemState,
      fieldName: labelField.fieldName,
      sortOrder: labelField.sortOrder
    }
  }
}
