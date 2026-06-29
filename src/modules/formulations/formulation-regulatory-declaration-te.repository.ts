import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import {
  FormulationRegulatoryDeclaration_TE as PrismaFormulationRegulatoryDeclaration_TE,
  Prisma
} from '@prisma/client'
import type { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'
import { Id } from '@shared/value-objects'
import { FormulationRegulatoryDeclaration_TE } from './formulation-regulatory-declaration-te.entity'

export type FormulationRegulatoryDeclarationFilter = {
  formulationRevisionId?: string
  flagId?: string
}

export abstract class FormulationRegulatoryDeclaration_TE_Repository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<FormulationRegulatoryDeclaration_TE | null>
  abstract findAll(
    filter: FormulationRegulatoryDeclarationFilter,
    ctx: RequestContext
  ): Promise<FormulationRegulatoryDeclaration_TE[]>
  abstract findByRevisionId(
    revisionId: string,
    ctx: RequestContext
  ): Promise<FormulationRegulatoryDeclaration_TE[]>
  abstract save(
    entry: FormulationRegulatoryDeclaration_TE,
    ctx: RequestContext
  ): Promise<FormulationRegulatoryDeclaration_TE>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaFormulationRegulatoryDeclaration_TE_Repository
  implements FormulationRegulatoryDeclaration_TE_Repository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<FormulationRegulatoryDeclaration_TE | null> {
    const where: Prisma.FormulationRegulatoryDeclaration_TEWhereUniqueInput = {
      id
    }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const data =
      await this.prisma.formulationRegulatoryDeclaration_TE.findUnique({
        where
      })
    if (!data) return null
    return PrismaFormulationRegulatoryDeclaration_TE_Mapper.toDomain(data)
  }

  async findAll(
    filter: FormulationRegulatoryDeclarationFilter,
    ctx: RequestContext
  ): Promise<FormulationRegulatoryDeclaration_TE[]> {
    const where: Prisma.FormulationRegulatoryDeclaration_TEWhereInput = {
      ...(filter.formulationRevisionId && {
        formulationRevisionId: filter.formulationRevisionId
      }),
      ...(filter.flagId && { flagId: filter.flagId })
    }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const data = await this.prisma.formulationRegulatoryDeclaration_TE.findMany(
      {
        where,
        orderBy: { createdAt: 'asc' }
      }
    )
    return data.map(
      PrismaFormulationRegulatoryDeclaration_TE_Mapper.toDomain
    )
  }

  async findByRevisionId(
    revisionId: string,
    ctx: RequestContext
  ): Promise<FormulationRegulatoryDeclaration_TE[]> {
    return this.findAll({ formulationRevisionId: revisionId }, ctx)
  }

  async save(
    entry: FormulationRegulatoryDeclaration_TE,
    ctx: RequestContext
  ): Promise<FormulationRegulatoryDeclaration_TE> {
    if (
      ctx.scope === UserScope.TENANT &&
      entry.tenantId !== ctx.tenantId
    ) {
      throw new ForbiddenException(
        'Cannot modify resource outside your tenant'
      )
    }
    const id = entry.id.value
    const data =
      PrismaFormulationRegulatoryDeclaration_TE_Mapper.toPersistence(entry)
    await this.prisma.formulationRegulatoryDeclaration_TE.upsert({
      where: { id },
      update: data,
      create: data
    })
    return entry
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.FormulationRegulatoryDeclaration_TEWhereUniqueInput = {
      id
    }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.formulationRegulatoryDeclaration_TE.delete({
      where
    })
  }
}

class PrismaFormulationRegulatoryDeclaration_TE_Mapper {
  static toDomain(
    data: PrismaFormulationRegulatoryDeclaration_TE
  ): FormulationRegulatoryDeclaration_TE {
    return FormulationRegulatoryDeclaration_TE.rehydrate({
      id: Id.from(data.id),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      tenantId: data.tenantId,
      formulationRevisionId: data.formulationRevisionId,
      flagId: data.flagId,
      flagValue: data.flagValue,
      notes: data.notes
    })
  }

  static toPersistence(
    entry: FormulationRegulatoryDeclaration_TE
  ): Prisma.FormulationRegulatoryDeclaration_TEUncheckedCreateInput {
    return {
      id: entry.id.value,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      tenantId: entry.tenantId,
      formulationRevisionId: entry.formulationRevisionId,
      flagId: entry.flagId,
      flagValue: entry.flagValue,
      notes: entry.notes
    }
  }
}
