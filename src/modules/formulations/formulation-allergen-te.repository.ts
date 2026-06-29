import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import {
  FormulationAllergen_TE as PrismaFormulationAllergen_TE,
  Prisma
} from '@prisma/client'
import type { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'
import { Id } from '@shared/value-objects'
import { FormulationAllergen_TE } from './formulation-allergen-te.entity'

export type FormulationAllergenFilter = {
  formulationRevisionId?: string
}

export abstract class FormulationAllergen_TE_Repository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<FormulationAllergen_TE | null>
  abstract findAll(
    filter: FormulationAllergenFilter,
    ctx: RequestContext
  ): Promise<FormulationAllergen_TE[]>
  abstract findByRevisionId(
    revisionId: string,
    ctx: RequestContext
  ): Promise<FormulationAllergen_TE | null>
  abstract save(
    entry: FormulationAllergen_TE,
    ctx: RequestContext
  ): Promise<FormulationAllergen_TE>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaFormulationAllergen_TE_Repository
  implements FormulationAllergen_TE_Repository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<FormulationAllergen_TE | null> {
    const where: Prisma.FormulationAllergen_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const data = await this.prisma.formulationAllergen_TE.findUnique({
      where
    })
    if (!data) return null
    return PrismaFormulationAllergen_TE_Mapper.toDomain(data)
  }

  async findAll(
    filter: FormulationAllergenFilter,
    ctx: RequestContext
  ): Promise<FormulationAllergen_TE[]> {
    const where: Prisma.FormulationAllergen_TEWhereInput = {
      ...(filter.formulationRevisionId && {
        formulationRevisionId: filter.formulationRevisionId
      })
    }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const data = await this.prisma.formulationAllergen_TE.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    })
    return data.map(PrismaFormulationAllergen_TE_Mapper.toDomain)
  }

  async findByRevisionId(
    revisionId: string,
    ctx: RequestContext
  ): Promise<FormulationAllergen_TE | null> {
    const entities = await this.findAll(
      { formulationRevisionId: revisionId },
      ctx
    )
    return entities.length > 0 ? (entities[0] as FormulationAllergen_TE) : null
  }

  async save(
    entry: FormulationAllergen_TE,
    ctx: RequestContext
  ): Promise<FormulationAllergen_TE> {
    if (
      ctx.scope === UserScope.TENANT &&
      entry.tenantId !== ctx.tenantId
    ) {
      throw new ForbiddenException(
        'Cannot modify resource outside your tenant'
      )
    }
    const id = entry.id.value
    const data = PrismaFormulationAllergen_TE_Mapper.toPersistence(entry)
    await this.prisma.formulationAllergen_TE.upsert({
      where: { id },
      update: data,
      create: data
    })
    return entry
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.FormulationAllergen_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.formulationAllergen_TE.delete({
      where
    })
  }
}

class PrismaFormulationAllergen_TE_Mapper {
  static toDomain(data: PrismaFormulationAllergen_TE): FormulationAllergen_TE {
    return FormulationAllergen_TE.rehydrate({
      id: Id.from(data.id),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      tenantId: data.tenantId,
      formulationRevisionId: data.formulationRevisionId,
      allergenDeclaration: data.allergenDeclaration,
      allergenMayContain: data.allergenMayContain
    })
  }

  static toPersistence(
    entry: FormulationAllergen_TE
  ): Prisma.FormulationAllergen_TEUncheckedCreateInput {
    return {
      id: entry.id.value,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      tenantId: entry.tenantId,
      formulationRevisionId: entry.formulationRevisionId,
      allergenDeclaration: entry.allergenDeclaration,
      allergenMayContain: entry.allergenMayContain
    }
  }
}
