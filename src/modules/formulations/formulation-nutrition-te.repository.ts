import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import {
  FormulationNutrition_TE as PrismaFormulationNutrition_TE,
  Prisma
} from '@prisma/client'
import type { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'
import { Id } from '@shared/value-objects'
import { FormulationNutrition_TE } from './formulation-nutrition-te.entity'

export type FormulationNutritionFilter = {
  formulationRevisionId?: string
  nutrientId?: string
}

export abstract class FormulationNutrition_TE_Repository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<FormulationNutrition_TE | null>
  abstract findAll(
    filter: FormulationNutritionFilter,
    ctx: RequestContext
  ): Promise<FormulationNutrition_TE[]>
  abstract findByRevisionId(
    revisionId: string,
    ctx: RequestContext
  ): Promise<FormulationNutrition_TE[]>
  abstract save(
    entry: FormulationNutrition_TE,
    ctx: RequestContext
  ): Promise<FormulationNutrition_TE>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaFormulationNutrition_TE_Repository
  implements FormulationNutrition_TE_Repository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<FormulationNutrition_TE | null> {
    const where: Prisma.FormulationNutrition_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const data = await this.prisma.formulationNutrition_TE.findUnique({
      where
    })
    if (!data) return null
    return PrismaFormulationNutrition_TE_Mapper.toDomain(data)
  }

  async findAll(
    filter: FormulationNutritionFilter,
    ctx: RequestContext
  ): Promise<FormulationNutrition_TE[]> {
    const where: Prisma.FormulationNutrition_TEWhereInput = {
      ...(filter.formulationRevisionId && {
        formulationRevisionId: filter.formulationRevisionId
      }),
      ...(filter.nutrientId && { nutrientId: filter.nutrientId })
    }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const data = await this.prisma.formulationNutrition_TE.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    })
    return data.map(PrismaFormulationNutrition_TE_Mapper.toDomain)
  }

  async findByRevisionId(
    revisionId: string,
    ctx: RequestContext
  ): Promise<FormulationNutrition_TE[]> {
    return this.findAll({ formulationRevisionId: revisionId }, ctx)
  }

  async save(
    entry: FormulationNutrition_TE,
    ctx: RequestContext
  ): Promise<FormulationNutrition_TE> {
    if (
      ctx.scope === UserScope.TENANT &&
      entry.tenantId !== ctx.tenantId
    ) {
      throw new ForbiddenException(
        'Cannot modify resource outside your tenant'
      )
    }
    const id = entry.id.value
    const data = PrismaFormulationNutrition_TE_Mapper.toPersistence(entry)
    await this.prisma.formulationNutrition_TE.upsert({
      where: { id },
      update: data,
      create: data
    })
    return entry
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.FormulationNutrition_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.formulationNutrition_TE.delete({
      where
    })
  }
}

class PrismaFormulationNutrition_TE_Mapper {
  static toDomain(data: PrismaFormulationNutrition_TE): FormulationNutrition_TE {
    return FormulationNutrition_TE.rehydrate({
      id: Id.from(data.id),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      tenantId: data.tenantId,
      formulationRevisionId: data.formulationRevisionId,
      nutrientId: data.nutrientId,
      declaredValue: data.declaredValue?.toNumber() ?? null,
      calculatedValue: data.calculatedValue?.toNumber() ?? null,
      refValue: data.refValue?.toNumber() ?? null,
      notes: data.notes
    })
  }

  static toPersistence(
    entry: FormulationNutrition_TE
  ): Prisma.FormulationNutrition_TEUncheckedCreateInput {
    return {
      id: entry.id.value,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      tenantId: entry.tenantId,
      formulationRevisionId: entry.formulationRevisionId,
      nutrientId: entry.nutrientId,
      declaredValue: entry.declaredValue,
      calculatedValue: entry.calculatedValue,
      refValue: entry.refValue,
      notes: entry.notes
    }
  }
}
