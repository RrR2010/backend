import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '@shared/prisma/prisma.service'
import type { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'
import { ForbiddenException } from '@nestjs/common'
import { Id } from '@shared/value-objects'
import { FormulationVersion } from './formulation-version.entity'
import { FormulationRevision } from './formulation-revision.entity'
import { FormulationItem } from './formulation-item.entity'

export abstract class FormulationVersionRepository {
  abstract findById(id: string, ctx: RequestContext): Promise<FormulationVersion | null>
  abstract findAll(ctx: RequestContext): Promise<FormulationVersion[]>
  abstract findByProductId(productId: string, ctx: RequestContext): Promise<FormulationVersion[]>
  abstract save(v: FormulationVersion, ctx: RequestContext): Promise<FormulationVersion>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

export abstract class FormulationRevisionRepository {
  abstract findById(id: string, ctx: RequestContext): Promise<FormulationRevision | null>
  abstract findByVersionId(versionId: string, ctx: RequestContext): Promise<FormulationRevision[]>
  abstract save(r: FormulationRevision, ctx: RequestContext): Promise<FormulationRevision>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

export abstract class FormulationItemRepository {
  abstract findById(id: string, ctx: RequestContext): Promise<FormulationItem | null>
  abstract findByRevisionId(revisionId: string, ctx: RequestContext): Promise<FormulationItem[]>
  abstract save(i: FormulationItem, ctx: RequestContext): Promise<FormulationItem>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

// PRISMA IMPLEMENTATIONS

@Injectable()
export class PrismaFormulationVersionRepository implements FormulationVersionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, ctx: RequestContext): Promise<FormulationVersion | null> {
    const where: Prisma.FormulationVersionWhereUniqueInput = { id }
    const tid = getEffectiveTenantId(ctx)
    if (tid) where.tenantId = tid
    const data = await this.prisma.formulationVersion.findUnique({ where })
    if (!data || data.systemState === 'HIDDEN') return null
    return PrismaFormulationVersionMapper.toDomain(data)
  }

  async findAll(ctx: RequestContext): Promise<FormulationVersion[]> {
    const where: Prisma.FormulationVersionWhereInput = {}
    const tid = getEffectiveTenantId(ctx)
    if (tid) where.tenantId = tid
    where.systemState = 'ACTIVE'
    const data = await this.prisma.formulationVersion.findMany({ where, orderBy: { version: 'desc' } })
    return data.map(PrismaFormulationVersionMapper.toDomain)
  }

  async findByProductId(productId: string, ctx: RequestContext): Promise<FormulationVersion[]> {
    const where: Prisma.FormulationVersionWhereInput = { productId }
    const tid = getEffectiveTenantId(ctx)
    if (tid) where.tenantId = tid
    where.systemState = 'ACTIVE'
    const data = await this.prisma.formulationVersion.findMany({ where, orderBy: { version: 'desc' } })
    return data.map(PrismaFormulationVersionMapper.toDomain)
  }

  async save(v: FormulationVersion, ctx: RequestContext): Promise<FormulationVersion> {
    if (ctx.scope === UserScope.TENANT && v.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = v.id.value
    const data = PrismaFormulationVersionMapper.toPersistence(v)
    await this.prisma.formulationVersion.upsert({ where: { id }, update: data, create: data })
    return v
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.FormulationVersionWhereUniqueInput = { id }
    const tid = getEffectiveTenantId(ctx)
    if (tid) where.tenantId = tid
    await this.prisma.formulationVersion.update({ where, data: { systemState: 'HIDDEN', updatedAt: new Date() } })
  }
}

@Injectable()
export class PrismaFormulationRevisionRepository implements FormulationRevisionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, ctx: RequestContext): Promise<FormulationRevision | null> {
    const tid = getEffectiveTenantId(ctx)
    const where: Prisma.FormulationRevisionWhereUniqueInput = { id }
    if (tid) where.formulationVersion = { tenantId: tid }
    const data = await this.prisma.formulationRevision.findUnique({ where })
    if (!data || data.systemState === 'HIDDEN') return null
    return PrismaFormulationRevisionMapper.toDomain(data)
  }

  async findByVersionId(versionId: string, ctx: RequestContext): Promise<FormulationRevision[]> {
    const tid = getEffectiveTenantId(ctx)
    const where: Prisma.FormulationRevisionWhereInput = { formulationVersionId: versionId, systemState: 'ACTIVE' }
    if (tid) where.formulationVersion = { tenantId: tid }
    const data = await this.prisma.formulationRevision.findMany({ where, orderBy: { revision: 'desc' } })
    return data.map(PrismaFormulationRevisionMapper.toDomain)
  }

  async save(r: FormulationRevision, ctx: RequestContext): Promise<FormulationRevision> {
    const tid = getEffectiveTenantId(ctx)
    if (tid) {
      const version = await this.prisma.formulationVersion.findUnique({
        where: { id: r.formulationVersionId },
        select: { tenantId: true },
      })
      if (!version || version.tenantId !== tid) throw new ForbiddenException()
    }
    const id = r.id.value
    const data = PrismaFormulationRevisionMapper.toPersistence(r)
    await this.prisma.formulationRevision.upsert({ where: { id }, update: data, create: data })
    return r
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const tid = getEffectiveTenantId(ctx)
    if (tid) {
      const revision = await this.prisma.formulationRevision.findUnique({
        where: { id },
        select: { formulationVersion: { select: { tenantId: true } } },
      })
      if (!revision || revision.formulationVersion.tenantId !== tid) throw new ForbiddenException()
    }
    await this.prisma.formulationRevision.update({ where: { id }, data: { systemState: 'HIDDEN', updatedAt: new Date() } })
  }
}

@Injectable()
export class PrismaFormulationItemRepository implements FormulationItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, ctx: RequestContext): Promise<FormulationItem | null> {
    const tid = getEffectiveTenantId(ctx)
    const where: Prisma.FormulationItemWhereUniqueInput = { id }
    if (tid) where.formulationRevision = { formulationVersion: { tenantId: tid } }
    const data = await this.prisma.formulationItem.findUnique({ where })
    if (!data) return null
    return PrismaFormulationItemMapper.toDomain(data)
  }

  async findByRevisionId(revisionId: string, ctx: RequestContext): Promise<FormulationItem[]> {
    const tid = getEffectiveTenantId(ctx)
    const where: Prisma.FormulationItemWhereInput = { formulationRevisionId: revisionId }
    if (tid) where.formulationRevision = { formulationVersion: { tenantId: tid } }
    const data = await this.prisma.formulationItem.findMany({ where, orderBy: { createdAt: 'asc' } })
    return data.map(PrismaFormulationItemMapper.toDomain)
  }

  async save(i: FormulationItem, ctx: RequestContext): Promise<FormulationItem> {
    const tid = getEffectiveTenantId(ctx)
    if (tid) {
      const revision = await this.prisma.formulationRevision.findUnique({
        where: { id: i.formulationRevisionId },
        select: { formulationVersion: { select: { tenantId: true } } },
      })
      if (!revision || revision.formulationVersion.tenantId !== tid) throw new ForbiddenException()
    }
    const id = i.id.value
    const data = PrismaFormulationItemMapper.toPersistence(i)
    await this.prisma.formulationItem.upsert({ where: { id }, update: data, create: data })
    return i
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const tid = getEffectiveTenantId(ctx)
    if (tid) {
      const item = await this.prisma.formulationItem.findUnique({
        where: { id },
        select: { formulationRevision: { select: { formulationVersion: { select: { tenantId: true } } } } },
      })
      if (!item || item.formulationRevision.formulationVersion.tenantId !== tid) throw new ForbiddenException()
    }
    await this.prisma.formulationItem.delete({ where: { id } })
  }
}

// MAPPERS

class PrismaFormulationVersionMapper {
  static toDomain(data: any): FormulationVersion {
    return FormulationVersion.rehydrate({
      id: Id.from(data.id), tenantId: data.tenantId, productId: data.productId,
      version: data.version, notes: data.notes,
      systemState: data.systemState, createdAt: data.createdAt, updatedAt: data.updatedAt,
    })
  }
  static toPersistence(v: FormulationVersion): Prisma.FormulationVersionUncheckedCreateInput {
    return {
      id: v.id.value, tenantId: v.tenantId, productId: v.productId,
      version: v.version, notes: v.notes,
      systemState: v.systemState, createdAt: v.createdAt, updatedAt: v.updatedAt,
    }
  }
}

class PrismaFormulationRevisionMapper {
  static toDomain(data: any): FormulationRevision {
    return FormulationRevision.rehydrate({
      id: Id.from(data.id), formulationVersionId: data.formulationVersionId,
      revision: data.revision, notes: data.notes,
      nutritionalSummary: data.nutritionalSummary,
      complianceSummary: data.complianceSummary,
      systemState: data.systemState, createdAt: data.createdAt, updatedAt: data.updatedAt,
    })
  }
  static toPersistence(r: FormulationRevision): Prisma.FormulationRevisionUncheckedCreateInput {
    return {
      id: r.id.value, formulationVersionId: r.formulationVersionId,
      revision: r.revision, notes: r.notes,
      nutritionalSummary: r.nutritionalSummary as any,
      complianceSummary: r.complianceSummary as any,
      systemState: r.systemState, createdAt: r.createdAt, updatedAt: r.updatedAt,
    }
  }
}

class PrismaFormulationItemMapper {
  static toDomain(data: any): FormulationItem {
    return FormulationItem.rehydrate({
      id: Id.from(data.id), formulationRevisionId: data.formulationRevisionId,
      ingredientId: data.ingredientId, quantity: Number(data.quantity), unit: data.unit,
      createdAt: data.createdAt, updatedAt: data.updatedAt,
    })
  }
  static toPersistence(i: FormulationItem): Prisma.FormulationItemUncheckedCreateInput {
    return {
      id: i.id.value, formulationRevisionId: i.formulationRevisionId,
      ingredientId: i.ingredientId, quantity: i.quantity, unit: i.unit,
      createdAt: i.createdAt, updatedAt: i.updatedAt,
    }
  }
}
