import { Injectable, InternalServerErrorException, ForbiddenException } from '@nestjs/common'
import {
  FormulationRevisionStatus,
  Prisma,
  FormulationVersion_TE as PrismaFormulationVersion_TE,
  FormulationRevision_TE as PrismaFormulationRevision_TE,
  FormulationItem_TE as PrismaFormulationItem_TE
} from '@prisma/client'
import { PrismaService } from '@shared/prisma/prisma.service'
import type { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'
import { Id } from '@shared/value-objects'
import { SystemState } from '@shared/behaviours/lockable'
import { FormulationVersion_TE } from './formulation-version.entity'
import { FormulationRevision_TE } from './formulation-revision.entity'
import { FormulationItem_TE } from './formulation-item.entity'

export abstract class FormulationVersion_TE_Repository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<FormulationVersion_TE | null>
  abstract findAll(ctx: RequestContext, skip?: number, take?: number): Promise<FormulationVersion_TE[]>
  abstract findByProductId(
    productId: string,
    ctx: RequestContext
  ): Promise<FormulationVersion_TE[]>
  abstract save(
    version: FormulationVersion_TE,
    ctx: RequestContext
  ): Promise<FormulationVersion_TE>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

export abstract class FormulationRevision_TE_Repository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<FormulationRevision_TE | null>
  abstract findByVersionId(
    versionId: string,
    ctx: RequestContext
  ): Promise<FormulationRevision_TE[]>
  abstract save(
    revision: FormulationRevision_TE,
    ctx: RequestContext
  ): Promise<FormulationRevision_TE>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

export abstract class FormulationItem_TE_Repository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<FormulationItem_TE | null>
  abstract findByRevisionId(
    revisionId: string,
    ctx: RequestContext
  ): Promise<FormulationItem_TE[]>
  abstract save(
    item: FormulationItem_TE,
    ctx: RequestContext
  ): Promise<FormulationItem_TE>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

// PRISMA IMPLEMENTATIONS

@Injectable()
export class PrismaFormulationVersion_TE_Repository implements FormulationVersion_TE_Repository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<FormulationVersion_TE | null> {
    const where: Prisma.FormulationVersion_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) where.tenantId = effectiveTenantId
    const data = await this.prisma.formulationVersion_TE.findUnique({ where })
    if (!data || data.systemState === SystemState.DELETED) return null
    return PrismaFormulationVersion_TE_Mapper.toDomain(data)
  }

  async findAll(ctx: RequestContext, skip = 0, take = 100): Promise<FormulationVersion_TE[]> {
    const where: Prisma.FormulationVersion_TEWhereInput = {}
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) where.tenantId = effectiveTenantId
    where.systemState = SystemState.ACTIVE
    const data = await this.prisma.formulationVersion_TE.findMany({
      where,
      skip,
      take,
      orderBy: { version: 'desc' }
    })
    return data.map(PrismaFormulationVersion_TE_Mapper.toDomain)
  }

  async findByProductId(
    productId: string,
    ctx: RequestContext
  ): Promise<FormulationVersion_TE[]> {
    const where: Prisma.FormulationVersion_TEWhereInput = { productId }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) where.tenantId = effectiveTenantId
    where.systemState = SystemState.ACTIVE
    const data = await this.prisma.formulationVersion_TE.findMany({
      where,
      orderBy: { version: 'desc' }
    })
    return data.map(PrismaFormulationVersion_TE_Mapper.toDomain)
  }

  async save(
    version: FormulationVersion_TE,
    ctx: RequestContext
  ): Promise<FormulationVersion_TE> {
    if (ctx.scope === UserScope.TENANT && version.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = version.id.value
    const data = PrismaFormulationVersion_TE_Mapper.toPersistence(version)
    await this.prisma.formulationVersion_TE.upsert({
      where: { id },
      update: data,
      create: data
    })
    return version
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.FormulationVersion_TEWhereUniqueInput = { id }
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) where.tenantId = effectiveTenantId
    await this.prisma.formulationVersion_TE.update({
      where,
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

@Injectable()
export class PrismaFormulationRevision_TE_Repository implements FormulationRevision_TE_Repository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<FormulationRevision_TE | null> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    const where: Prisma.FormulationRevision_TEWhereInput = { id }
    if (effectiveTenantId) where.formulationVersion_TE = { tenantId: effectiveTenantId }
    const data = await this.prisma.formulationRevision_TE.findFirst({ where })
    if (!data || data.systemState === SystemState.DELETED) return null
    return PrismaFormulationRevision_TE_Mapper.toDomain(data)
  }

  async findByVersionId(
    versionId: string,
    ctx: RequestContext
  ): Promise<FormulationRevision_TE[]> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    const where: Prisma.FormulationRevision_TEWhereInput = {
      formulationVersionId: versionId,
      systemState: SystemState.ACTIVE
    }
    if (effectiveTenantId) where.formulationVersion_TE = { tenantId: effectiveTenantId }
    const data = await this.prisma.formulationRevision_TE.findMany({
      where,
      orderBy: { revision: 'desc' }
    })
    return data.map(PrismaFormulationRevision_TE_Mapper.toDomain)
  }

  async save(
    revision: FormulationRevision_TE,
    ctx: RequestContext
  ): Promise<FormulationRevision_TE> {
    const tenantId = getEffectiveTenantId(ctx)
    if (tenantId) {
      const version = await this.prisma.formulationVersion_TE.findUnique({
        where: { id: revision.formulationVersionId },
        select: { tenantId: true }
      })
      if (!version || version.tenantId !== tenantId) throw new ForbiddenException()
    }
    if (!tenantId) throw new InternalServerErrorException('tenantId is required')
    const id = revision.id.value
    const data = PrismaFormulationRevision_TE_Mapper.toPersistence(revision)
    await this.prisma.formulationRevision_TE.upsert({
      where: { id },
      update: data,
      create: data
    })
    return revision
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      const revision = await this.prisma.formulationRevision_TE.findUnique({
        where: { id },
        select: { formulationVersion_TE: { select: { tenantId: true } } }
      })
      if (!revision || revision.formulationVersion_TE.tenantId !== effectiveTenantId)
        throw new ForbiddenException()
    }
    await this.prisma.formulationRevision_TE.update({
      where: { id },
      data: { systemState: SystemState.DELETED, updatedAt: new Date() }
    })
  }
}

@Injectable()
export class PrismaFormulationItem_TE_Repository implements FormulationItem_TE_Repository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<FormulationItem_TE | null> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    const where: Prisma.FormulationItem_TEWhereUniqueInput = { id }
    if (effectiveTenantId)
      where.formulationRevision_TE = {
        formulationVersion_TE: { tenantId: effectiveTenantId }
      }
    const data = await this.prisma.formulationItem_TE.findUnique({ where })
    if (!data) return null
    return PrismaFormulationItem_TE_Mapper.toDomain(data)
  }

  async findByRevisionId(
    revisionId: string,
    ctx: RequestContext
  ): Promise<FormulationItem_TE[]> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    const where: Prisma.FormulationItem_TEWhereInput = {
      formulationRevisionId: revisionId
    }
    if (effectiveTenantId)
      where.formulationRevision_TE = {
        formulationVersion_TE: { tenantId: effectiveTenantId }
      }
    const data = await this.prisma.formulationItem_TE.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    })
    return data.map(PrismaFormulationItem_TE_Mapper.toDomain)
  }

  async save(
    item: FormulationItem_TE,
    ctx: RequestContext
  ): Promise<FormulationItem_TE> {
    const tenantId = getEffectiveTenantId(ctx)
    if (tenantId) {
      const revision = await this.prisma.formulationRevision_TE.findUnique({
        where: { id: item.formulationRevisionId },
        select: { formulationVersion_TE: { select: { tenantId: true } } }
      })
      if (!revision || revision.formulationVersion_TE.tenantId !== tenantId)
        throw new ForbiddenException()
    }
    if (!tenantId) throw new InternalServerErrorException('tenantId is required')
    const id = item.id.value
    const data = PrismaFormulationItem_TE_Mapper.toPersistence(item)
    await this.prisma.formulationItem_TE.upsert({
      where: { id },
      update: data,
      create: data
    })
    return item
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const effectiveTenantId = getEffectiveTenantId(ctx)
    if (effectiveTenantId) {
      const item = await this.prisma.formulationItem_TE.findUnique({
        where: { id },
        select: {
          formulationRevision_TE: {
            select: { formulationVersion_TE: { select: { tenantId: true } } }
          }
        }
      })
      if (
        !item ||
        item.formulationRevision_TE.formulationVersion_TE.tenantId !== effectiveTenantId
      )
        throw new ForbiddenException()
    }
    await this.prisma.formulationItem_TE.delete({ where: { id } })
  }
}

// MAPPERS

class PrismaFormulationVersion_TE_Mapper {
  static toDomain(data: PrismaFormulationVersion_TE): FormulationVersion_TE {
    return FormulationVersion_TE.rehydrate({
      id: Id.from(data.id),
      tenantId: data.tenantId,
      productId: data.productId,
      version: data.version,
      notes: data.notes,
      systemState: SystemState[data.systemState],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    })
  }
  static toPersistence(
    version: FormulationVersion_TE
  ): Prisma.FormulationVersion_TEUncheckedCreateInput {
    return {
      id: version.id.value,
      tenantId: version.tenantId,
      productId: version.productId,
      version: version.version,
      notes: version.notes,
      systemState: version.systemState,
      createdAt: version.createdAt,
      updatedAt: version.updatedAt
    }
  }
}

class PrismaFormulationRevision_TE_Mapper {
  static toDomain(data: PrismaFormulationRevision_TE): FormulationRevision_TE {
    return FormulationRevision_TE.rehydrate({
      id: Id.from(data.id),
      formulationVersionId: data.formulationVersionId,
      revision: data.revision,
      notes: data.notes,
      status: FormulationRevisionStatus[data.status],
      tenantId: data.tenantId,
      approverId: data.approverId,
      approvedBy: data.approvedBy,
      approvedAt: data.approvedAt,
      drift: data.drift,
      systemState: SystemState[data.systemState],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    })
  }
  static toPersistence(
    revision: FormulationRevision_TE
  ): Prisma.FormulationRevision_TEUncheckedCreateInput {
    return {
      id: revision.id.value,
      formulationVersionId: revision.formulationVersionId,
      revision: revision.revision,
      notes: revision.notes,
      status: revision.status,
      drift: revision.drift,
      tenantId: revision.tenantId,
      approverId: revision.approverId,
      approvedBy: revision.approvedBy,
      approvedAt: revision.approvedAt,
      systemState: revision.systemState,
      createdAt: revision.createdAt,
      updatedAt: revision.updatedAt
    }
  }
}

class PrismaFormulationItem_TE_Mapper {
  static toDomain(data: PrismaFormulationItem_TE): FormulationItem_TE {
    return FormulationItem_TE.rehydrate({
      id: Id.from(data.id),
      formulationRevisionId: data.formulationRevisionId,
      ingredientId: data.ingredientId,
      quantity: Number(data.quantity),
      unitId: data.unitId,
      tenantId: data.tenantId,
      usageCategory: data.usageCategory,
      componentGroup: data.componentGroup,
      sortOrder: data.sortOrder,
      notes: data.notes,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    })
  }
  static toPersistence(
    item: FormulationItem_TE
  ): Prisma.FormulationItem_TEUncheckedCreateInput {
    return {
      id: item.id.value,
      formulationRevisionId: item.formulationRevisionId,
      ingredientId: item.ingredientId,
      quantity: item.quantity,
      unitId: item.unitId,
      tenantId: item.tenantId,
      usageCategory: item.usageCategory,
      componentGroup: item.componentGroup,
      sortOrder: item.sortOrder,
      notes: item.notes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }
  }
}
