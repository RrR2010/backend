import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { PanelGeometricFormatType_PL } from '@products/panel-geometric-format-type-pl.entity'
import { Id } from '@shared/value-objects'
import { SystemState } from '@shared/behaviours/lockable'
import {
  PanelGeometricFormatType_PL as PrismaPanelGeometricFormatTypePL,
  Prisma
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'

// EXCEÇÃO: PanelGeometricFormatType_PL é entidade platform-scoped (sem tenantId).
// Permanece acessível globalmente por usuários PLATFORM durante impersonação.
// Regra de Negócio #11 do EPIC_010.

export type PanelGeometricFormatType_PLFilter = {
  formatName?: string
  systemState?: SystemState
}

export abstract class PanelGeometricFormatType_PLRepository {
  abstract findById(
    id: string,
    _ctx: RequestContext
  ): Promise<PanelGeometricFormatType_PL | null>
  abstract findAll(
    filter: PanelGeometricFormatType_PLFilter,
    _ctx: RequestContext
  ): Promise<PanelGeometricFormatType_PL[]>
  abstract save(
    format: PanelGeometricFormatType_PL,
    _ctx: RequestContext
  ): Promise<PanelGeometricFormatType_PL>
  abstract delete(id: string, _ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaPanelGeometricFormatType_PLRepository
  implements PanelGeometricFormatType_PLRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<PanelGeometricFormatType_PL | null> {
    // Platform-scoped resource — no tenantId
    const prismaFormatPL =
      await this.prisma.panelGeometricFormatType_PL.findUnique({
        where: { id }
      })
    if (!prismaFormatPL) return null
    if (prismaFormatPL.systemState === 'DELETED') {
      return null
    }
    return PrismaPanelGeometricFormatType_PLMapper.toDomain(prismaFormatPL)
  }

  async findAll(
    filter: PanelGeometricFormatType_PLFilter,
    _ctx: RequestContext
  ): Promise<PanelGeometricFormatType_PL[]> {
    // Platform-scoped resource — no tenantId
    const where: Prisma.PanelGeometricFormatType_PLWhereInput = {}
    if (filter.formatName) {
      where.formatName = {
        contains: filter.formatName,
        mode: 'insensitive'
      }
    }
    if (filter.systemState) {
      where.systemState = filter.systemState
    }
    if (!filter.systemState) {
      where.systemState = { not: SystemState.DELETED }
    }
    const prismaFormatsPL =
      await this.prisma.panelGeometricFormatType_PL.findMany({
        where,
        orderBy: { formatName: 'asc' }
      })
    return prismaFormatsPL.map((fmt) =>
      PrismaPanelGeometricFormatType_PLMapper.toDomain(fmt)
    )
  }

  async save(
    format: PanelGeometricFormatType_PL,
    _ctx: RequestContext
  ): Promise<PanelGeometricFormatType_PL> {
    // Platform-scoped resource — no tenantId
    const id = format.id.value
    const data =
      PrismaPanelGeometricFormatType_PLMapper.toPersistence(format)
    await this.prisma.panelGeometricFormatType_PL.upsert({
      where: { id },
      update: data,
      create: data
    })
    return format
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    // Platform-scoped resource — no tenantId
    await this.prisma.panelGeometricFormatType_PL.update({
      where: { id },
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaPanelGeometricFormatType_PLMapper {
  static toDomain(
    prismaFormatPL: PrismaPanelGeometricFormatTypePL
  ): PanelGeometricFormatType_PL {
    return PanelGeometricFormatType_PL.rehydrate({
      id: Id.from(prismaFormatPL.id),
      createdAt: prismaFormatPL.createdAt,
      updatedAt: prismaFormatPL.updatedAt,
      systemState:
        SystemState[
          prismaFormatPL.systemState as keyof typeof SystemState
        ],
      formatName: prismaFormatPL.formatName,
      valueFields:
        prismaFormatPL.valueFields as Record<string, unknown> | null,
      calculationFormula: prismaFormatPL.calculationFormula
    })
  }

  static toPersistence(
    format: PanelGeometricFormatType_PL
  ): Prisma.PanelGeometricFormatType_PLCreateInput {
    return {
      id: format.id.value,
      createdAt: format.createdAt,
      updatedAt: format.updatedAt,
      systemState: format.systemState,
      formatName: format.formatName,
      valueFields: format.valueFields as Prisma.InputJsonValue,
      calculationFormula: format.calculationFormula
    }
  }
}
