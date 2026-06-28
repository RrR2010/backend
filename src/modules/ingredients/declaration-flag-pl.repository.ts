import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { DeclarationFlag_PL } from '@ingredients/declaration-flag-pl.entity'
import { Id } from '@shared/value-objects'
import { SystemState } from '@shared/behaviours/lockable'
import {
  DeclarationFlag_PL as PrismaDeclarationFlagPL,
  Prisma,
  DeclarationFlagScope
} from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'

// EXCEÇÃO: DeclarationFlag_PL é entidade platform-scoped (sem tenantId).
// Permanece acessível globalmente por usuários PLATFORM durante impersonação.
// Regra de Negócio #11 do EPIC_010.

export type DeclarationFlag_PLFilter = {
  appliesTo?: string
  systemState?: SystemState
}

export abstract class DeclarationFlag_PLRepository {
  abstract findById(
    id: string,
    _ctx: RequestContext
  ): Promise<DeclarationFlag_PL | null>
  abstract findAll(
    filter: DeclarationFlag_PLFilter,
    _ctx: RequestContext
  ): Promise<DeclarationFlag_PL[]>
  abstract save(
    flag: DeclarationFlag_PL,
    _ctx: RequestContext
  ): Promise<DeclarationFlag_PL>
  abstract delete(id: string, _ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaDeclarationFlag_PLRepository
  implements DeclarationFlag_PLRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    _ctx: RequestContext
  ): Promise<DeclarationFlag_PL | null> {
    // Platform-scoped resource — no tenantId
    const prismaFlagPL =
      await this.prisma.declarationFlag_PL.findUnique({
        where: { id }
      })
    if (!prismaFlagPL) return null
    if (prismaFlagPL.systemState === 'DELETED') {
      return null
    }
    return PrismaDeclarationFlag_PLMapper.toDomain(prismaFlagPL)
  }

  async findAll(
    filter: DeclarationFlag_PLFilter,
    _ctx: RequestContext
  ): Promise<DeclarationFlag_PL[]> {
    // Platform-scoped resource — no tenantId
    const where: Prisma.DeclarationFlag_PLWhereInput = {}
    if (filter.appliesTo) {
      where.appliesTo = filter.appliesTo as DeclarationFlagScope
    }
    if (filter.systemState) {
      where.systemState = filter.systemState
    }
    if (!filter.systemState) {
      where.systemState = { not: SystemState.DELETED }
    }
    const prismaFlagsPL =
      await this.prisma.declarationFlag_PL.findMany({
        where,
        orderBy: { code: 'asc' }
      })
    return prismaFlagsPL.map((flag) =>
      PrismaDeclarationFlag_PLMapper.toDomain(flag)
    )
  }

  async save(
    flag: DeclarationFlag_PL,
    _ctx: RequestContext
  ): Promise<DeclarationFlag_PL> {
    // Platform-scoped resource — no tenantId
    const id = flag.id.value
    const data = PrismaDeclarationFlag_PLMapper.toPersistence(flag)
    await this.prisma.declarationFlag_PL.upsert({
      where: { id },
      update: data,
      create: data
    })
    return flag
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    // Platform-scoped resource — no tenantId
    await this.prisma.declarationFlag_PL.update({
      where: { id },
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

class PrismaDeclarationFlag_PLMapper {
  static toDomain(
    prismaFlagPL: PrismaDeclarationFlagPL
  ): DeclarationFlag_PL {
    return DeclarationFlag_PL.rehydrate({
      id: Id.from(prismaFlagPL.id),
      createdAt: prismaFlagPL.createdAt,
      updatedAt: prismaFlagPL.updatedAt,
      systemState:
        SystemState[
          prismaFlagPL.systemState as keyof typeof SystemState
        ],
      code: prismaFlagPL.code,
      name: prismaFlagPL.name,
      description: prismaFlagPL.description,
      appliesTo: prismaFlagPL.appliesTo,
      createdBy: prismaFlagPL.createdBy,
      updatedBy: prismaFlagPL.updatedBy
    })
  }

  static toPersistence(
    flag: DeclarationFlag_PL
  ): Prisma.DeclarationFlag_PLCreateInput {
    return {
      id: flag.id.value,
      createdAt: flag.createdAt,
      updatedAt: flag.updatedAt,
      systemState: flag.systemState,
      code: flag.code,
      name: flag.name,
      description: flag.description,
      appliesTo: flag.appliesTo,
      createdBy: flag.createdBy,
      updatedBy: flag.updatedBy
    }
  }
}
