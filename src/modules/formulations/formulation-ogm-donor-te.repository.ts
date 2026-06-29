import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import {
  FormulationOgmDonor_TE as PrismaFormulationOgmDonor_TE,
  Prisma
} from '@prisma/client'
import type { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'
import { Id } from '@shared/value-objects'
import { FormulationOgmDonor_TE } from './formulation-ogm-donor-te.entity'

export type FormulationOgmDonorFilter = {
  formulationRevisionId?: string
  ogmDonorSpeciesId?: string
}

export abstract class FormulationOgmDonor_TE_Repository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<FormulationOgmDonor_TE | null>
  abstract findAll(
    filter: FormulationOgmDonorFilter,
    ctx: RequestContext
  ): Promise<FormulationOgmDonor_TE[]>
  abstract findByRevisionId(
    revisionId: string,
    ctx: RequestContext
  ): Promise<FormulationOgmDonor_TE[]>
  abstract save(
    entry: FormulationOgmDonor_TE,
    ctx: RequestContext
  ): Promise<FormulationOgmDonor_TE>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaFormulationOgmDonor_TE_Repository
  implements FormulationOgmDonor_TE_Repository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<FormulationOgmDonor_TE | null> {
    const where: Prisma.FormulationOgmDonor_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const data = await this.prisma.formulationOgmDonor_TE.findUnique({
      where
    })
    if (!data) return null
    return PrismaFormulationOgmDonor_TE_Mapper.toDomain(data)
  }

  async findAll(
    filter: FormulationOgmDonorFilter,
    ctx: RequestContext
  ): Promise<FormulationOgmDonor_TE[]> {
    const where: Prisma.FormulationOgmDonor_TEWhereInput = {
      ...(filter.formulationRevisionId && {
        formulationRevisionId: filter.formulationRevisionId
      }),
      ...(filter.ogmDonorSpeciesId && {
        ogmDonorSpeciesId: filter.ogmDonorSpeciesId
      })
    }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    const data = await this.prisma.formulationOgmDonor_TE.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    })
    return data.map(PrismaFormulationOgmDonor_TE_Mapper.toDomain)
  }

  async findByRevisionId(
    revisionId: string,
    ctx: RequestContext
  ): Promise<FormulationOgmDonor_TE[]> {
    return this.findAll({ formulationRevisionId: revisionId }, ctx)
  }

  async save(
    entry: FormulationOgmDonor_TE,
    ctx: RequestContext
  ): Promise<FormulationOgmDonor_TE> {
    if (
      ctx.scope === UserScope.TENANT &&
      entry.tenantId !== ctx.tenantId
    ) {
      throw new ForbiddenException(
        'Cannot modify resource outside your tenant'
      )
    }
    const id = entry.id.value
    const data = PrismaFormulationOgmDonor_TE_Mapper.toPersistence(entry)
    await this.prisma.formulationOgmDonor_TE.upsert({
      where: { id },
      update: data,
      create: data
    })
    return entry
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.FormulationOgmDonor_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId
    }
    await this.prisma.formulationOgmDonor_TE.delete({
      where
    })
  }
}

class PrismaFormulationOgmDonor_TE_Mapper {
  static toDomain(data: PrismaFormulationOgmDonor_TE): FormulationOgmDonor_TE {
    return FormulationOgmDonor_TE.rehydrate({
      id: Id.from(data.id),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      tenantId: data.tenantId,
      formulationRevisionId: data.formulationRevisionId,
      ogmDonorSpeciesId: data.ogmDonorSpeciesId
    })
  }

  static toPersistence(
    entry: FormulationOgmDonor_TE
  ): Prisma.FormulationOgmDonor_TEUncheckedCreateInput {
    return {
      id: entry.id.value,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      tenantId: entry.tenantId,
      formulationRevisionId: entry.formulationRevisionId,
      ogmDonorSpeciesId: entry.ogmDonorSpeciesId
    }
  }
}
