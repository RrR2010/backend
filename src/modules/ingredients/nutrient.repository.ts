import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { Nutrient } from '@ingredients/nutrient.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'
import { Nutrient as PrismaNutrient, Prisma, NutrientUnit, NutrientCategory } from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

export type NutrientFilter = {
  name?: string
  unit?: NutrientUnit
  category?: NutrientCategory
  isActive?: boolean
  systemState?: SystemState
}

export abstract class NutrientRepository {
  abstract findById(id: string, ctx: RequestContext): Promise<Nutrient | null>
  abstract findAll(filter: NutrientFilter, ctx: RequestContext): Promise<Nutrient[]>
  abstract save(nutrient: Nutrient, ctx: RequestContext): Promise<Nutrient>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaNutrientRepository implements NutrientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, ctx: RequestContext): Promise<Nutrient | null> {
    const where: Prisma.NutrientWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    const prismaNutrient = await this.prisma.nutrient.findUnique({ where })
    if (!prismaNutrient) return null
    return PrismaNutrientMapper.toDomain(prismaNutrient)
  }

  async findAll(filter: NutrientFilter, ctx: RequestContext): Promise<Nutrient[]> {
    const where: Prisma.NutrientWhereInput = {
      ...(filter.name && { name: { contains: filter.name, mode: 'insensitive' } }),
      ...(filter.unit && { unit: filter.unit }),
      ...(filter.category && { category: filter.category }),
      ...(filter.isActive !== undefined && { isActive: filter.isActive }),
      ...(filter.systemState && { systemState: filter.systemState })
    }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    const prismaNutrients = await this.prisma.nutrient.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    })
    return prismaNutrients.map((nutrient) => PrismaNutrientMapper.toDomain(nutrient))
  }

  async save(nutrient: Nutrient, ctx: RequestContext): Promise<Nutrient> {
    if (ctx.scope === UserScope.TENANT && nutrient.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = nutrient.id.value
    const prismaNutrient = PrismaNutrientMapper.toPersistence(nutrient)
    await this.prisma.nutrient.upsert({
      where: { id },
      update: prismaNutrient,
      create: prismaNutrient
    })
    return nutrient
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.NutrientWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    await this.prisma.nutrient.update({
      where,
      data: { systemState: SystemState.HIDDEN, updatedAt: new Date() }
    })
  }
}

class PrismaNutrientMapper {
  static toDomain(prismaNutrient: PrismaNutrient): Nutrient {
    const systemState = SystemState[prismaNutrient.systemState as keyof typeof SystemState]
    if (!systemState) {
      throw new Error(`Invalid systemState value: ${prismaNutrient.systemState}`)
    }
    return Nutrient.rehydrate({
      id: Id.from(prismaNutrient.id),
      createdAt: prismaNutrient.createdAt,
      updatedAt: prismaNutrient.updatedAt,
      systemState,
      tenantId: prismaNutrient.tenantId,
      name: prismaNutrient.name,
      unit: prismaNutrient.unit,
      category: prismaNutrient.category,
      subcategory: prismaNutrient.subcategory,
      sortOrder: prismaNutrient.sortOrder,
      isActive: prismaNutrient.isActive
    })
  }

  static toPersistence(nutrient: Nutrient): Prisma.NutrientUncheckedCreateInput {
    return {
      id: nutrient.id.value,
      createdAt: nutrient.createdAt,
      updatedAt: nutrient.updatedAt,
      systemState: nutrient.systemState,
      tenantId: nutrient.tenantId,
      name: nutrient.name,
      unit: nutrient.unit,
      category: nutrient.category,
      subcategory: nutrient.subcategory,
      sortOrder: nutrient.sortOrder,
      isActive: nutrient.isActive
    }
  }
}
