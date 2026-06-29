import { Injectable, InternalServerErrorException, ForbiddenException } from '@nestjs/common'
import {
  FormulationRevisionStatus,
  Prisma,
  FormulationVersion_TE,
  FormulationRevision_TE,
  FormulationItem_TE
} from '@prisma/client'
import { PrismaService } from '@shared/prisma/prisma.service'
import type { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'
import { Id } from '@shared/value-objects'
import { SystemState } from '@shared/behaviours/lockable'
import { FormulationVersion } from './formulation-version.entity'
import { FormulationRevision } from './formulation-revision.entity'
import { FormulationItem } from './formulation-item.entity'

export abstract class FormulationVersionRepository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<FormulationVersion | null>
  abstract findAll(ctx: RequestContext): Promise<FormulationVersion[]>
  abstract findByProductId(
    productId: string,
    ctx: RequestContext
  ): Promise<FormulationVersion[]>
  abstract save(
    version: FormulationVersion,
    ctx: RequestContext
  ): Promise<FormulationVersion>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

export abstract class FormulationRevisionRepository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<FormulationRevision | null>
  abstract findByVersionId(
    versionId: string,
    ctx: RequestContext
  ): Promise<FormulationRevision[]>
  abstract save(
    revision: FormulationRevision,
    ctx: RequestContext
  ): Promise<FormulationRevision>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

export abstract class FormulationItemRepository {
  abstract findById(
    id: string,
    ctx: RequestContext
  ): Promise<FormulationItem | null>
  abstract findByRevisionId(
    revisionId: string,
    ctx: RequestContext
  ): Promise<FormulationItem[]>
  abstract save(
    item: FormulationItem,
    ctx: RequestContext
  ): Promise<FormulationItem>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

// PRISMA IMPLEMENTATIONS

@Injectable()
export class PrismaFormulationVersionRepository implements FormulationVersionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<FormulationVersion | null> {
    const where: Prisma.FormulationVersion_TEWhereUniqueInput = { id }
    const tid = getEffectiveTenantId(ctx)
    if (tid) where.tenantId = tid
    const data = await this.prisma.formulationVersion_TE.findUnique({ where })
    if (!data || data.systemState === 'DELETED') return null
    return PrismaFormulationVersionMapper.toDomain(data)
  }

  async findAll(ctx: RequestContext): Promise<FormulationVersion[]> {
    const where: Prisma.FormulationVersion_TEWhereInput = {}
    const tid = getEffectiveTenantId(ctx)
    if (tid) where.tenantId = tid
    where.systemState = 'ACTIVE'
    const data = await this.prisma.formulationVersion_TE.findMany({
      where,
      orderBy: { version: 'desc' }
    })
    return data.map(PrismaFormulationVersionMapper.toDomain)
  }

  async findByProductId(
    productId: string,
    ctx: RequestContext
  ): Promise<FormulationVersion[]> {
    const where: Prisma.FormulationVersion_TEWhereInput = { productId }
    const tid = getEffectiveTenantId(ctx)
    if (tid) where.tenantId = tid
    where.systemState = 'ACTIVE'
    const data = await this.prisma.formulationVersion_TE.findMany({
      where,
      orderBy: { version: 'desc' }
    })
    return data.map(PrismaFormulationVersionMapper.toDomain)
  }

  async save(
    version: FormulationVersion,
    ctx: RequestContext
  ): Promise<FormulationVersion> {
    if (ctx.scope === UserScope.TENANT && version.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = version.id.value
    const data = PrismaFormulationVersionMapper.toPersistence(version)
    await this.prisma.formulationVersion_TE.upsert({
      where: { id },
      update: data,
      create: data
    })
    return version
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.FormulationVersion_TEWhereUniqueInput = { id }
    const tid = getEffectiveTenantId(ctx)
    if (tid) where.tenantId = tid
    await this.prisma.formulationVersion_TE.update({
      where,
      data: { systemState: 'DELETED', updatedAt: new Date() }
    })
  }
}

@Injectable()
export class PrismaFormulationRevisionRepository implements FormulationRevisionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<FormulationRevision | null> {
    const tid = getEffectiveTenantId(ctx)
    const where: Prisma.FormulationRevision_TEWhereUniqueInput = { id }
    if (tid) where.formulationVersion_TE = { tenantId: tid }
    const data = await this.prisma.formulationRevision_TE.findUnique({ where })
    if (!data || data.systemState === 'DELETED') return null
    return PrismaFormulationRevisionMapper.toDomain(data)
  }

  async findByVersionId(
    versionId: string,
    ctx: RequestContext
  ): Promise<FormulationRevision[]> {
    const tid = getEffectiveTenantId(ctx)
    const where: Prisma.FormulationRevision_TEWhereInput = {
      formulationVersionId: versionId,
      systemState: 'ACTIVE'
    }
    if (tid) where.formulationVersion_TE = { tenantId: tid }
    const data = await this.prisma.formulationRevision_TE.findMany({
      where,
      orderBy: { revision: 'desc' }
    })
    return data.map(PrismaFormulationRevisionMapper.toDomain)
  }

  async save(
    revision: FormulationRevision,
    ctx: RequestContext
  ): Promise<FormulationRevision> {
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
    const data = PrismaFormulationRevisionMapper.toPersistence(
      revision,
      tenantId
    )
    await this.prisma.formulationRevision_TE.upsert({
      where: { id },
      update: data,
      create: data
    })
    return revision
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const tid = getEffectiveTenantId(ctx)
    if (tid) {
      const revision = await this.prisma.formulationRevision_TE.findUnique({
        where: { id },
        select: { formulationVersion_TE: { select: { tenantId: true } } }
      })
      if (!revision || revision.formulationVersion_TE.tenantId !== tid)
        throw new ForbiddenException()
    }
    await this.prisma.formulationRevision_TE.update({
      where: { id },
      data: { systemState: 'DELETED', updatedAt: new Date() }
    })
  }
}

@Injectable()
export class PrismaFormulationItemRepository implements FormulationItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    ctx: RequestContext
  ): Promise<FormulationItem | null> {
    const tid = getEffectiveTenantId(ctx)
    const where: Prisma.FormulationItem_TEWhereUniqueInput = { id }
    if (tid)
      where.formulationRevision_TE = {
        formulationVersion_TE: { tenantId: tid }
      }
    const data = await this.prisma.formulationItem_TE.findUnique({ where })
    if (!data) return null
    return PrismaFormulationItemMapper.toDomain(data)
  }

  async findByRevisionId(
    revisionId: string,
    ctx: RequestContext
  ): Promise<FormulationItem[]> {
    const tid = getEffectiveTenantId(ctx)
    const where: Prisma.FormulationItem_TEWhereInput = {
      formulationRevisionId: revisionId
    }
    if (tid)
      where.formulationRevision_TE = {
        formulationVersion_TE: { tenantId: tid }
      }
    const data = await this.prisma.formulationItem_TE.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    })
    return data.map(PrismaFormulationItemMapper.toDomain)
  }

  async save(
    item: FormulationItem,
    ctx: RequestContext
  ): Promise<FormulationItem> {
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
    const data = PrismaFormulationItemMapper.toPersistence(item, tenantId)
    await this.prisma.formulationItem_TE.upsert({
      where: { id },
      update: data,
      create: data
    })
    return item
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const tid = getEffectiveTenantId(ctx)
    if (tid) {
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
        item.formulationRevision_TE.formulationVersion_TE.tenantId !== tid
      )
        throw new ForbiddenException()
    }
    await this.prisma.formulationItem_TE.delete({ where: { id } })
  }
}

// MAPPERS

class PrismaFormulationVersionMapper {
  static toDomain(data: FormulationVersion_TE): FormulationVersion {
    return FormulationVersion.rehydrate({
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
    version: FormulationVersion
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

class PrismaFormulationRevisionMapper {
  static toDomain(data: FormulationRevision_TE): FormulationRevision {
    return FormulationRevision.rehydrate({
      id: Id.from(data.id),
      formulationVersionId: data.formulationVersionId,
      revision: data.revision,
      notes: data.notes,
      nutritionalSummary: null,
      complianceSummary: null,
      systemState: SystemState[data.systemState],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    })
  }
  static toPersistence(
    revision: FormulationRevision,
    tenantId: string
  ): Prisma.FormulationRevision_TEUncheckedCreateInput {
    return {
      id: revision.id.value,
      formulationVersionId: revision.formulationVersionId,
      revision: revision.revision,
      notes: revision.notes,
      status: FormulationRevisionStatus.DRAFT,
      drift: false,
      tenantId,
      systemState: revision.systemState,
      createdAt: revision.createdAt,
      updatedAt: revision.updatedAt
    }
  }
}

class PrismaFormulationItemMapper {
  static toDomain(data: FormulationItem_TE): FormulationItem {
    return FormulationItem.rehydrate({
      id: Id.from(data.id),
      formulationRevisionId: data.formulationRevisionId,
      ingredientId: data.ingredientId,
      quantity: Number(data.quantity),
      unit: data.unitId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    })
  }
  static toPersistence(
    item: FormulationItem,
    tenantId: string
  ): Prisma.FormulationItem_TEUncheckedCreateInput {
    return {
      id: item.id.value,
      formulationRevisionId: item.formulationRevisionId,
      ingredientId: item.ingredientId,
      quantity: item.quantity,
      unitId: item.unit,
      tenantId,
      sortOrder: 0,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }
  }
}
