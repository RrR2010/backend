import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { Allergen } from '@ingredients/allergen.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'
import { Allergen as PrismaAllergen, Prisma } from '@prisma/client'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

export type AllergenFilter = {
  name?: string
  category?: string
  isActive?: boolean
  systemState?: SystemState
}

export abstract class AllergenRepository {
  abstract findById(id: string, ctx: RequestContext): Promise<Allergen | null>
  abstract findAll(filter: AllergenFilter, ctx: RequestContext): Promise<Allergen[]>
  abstract save(allergen: Allergen, ctx: RequestContext): Promise<Allergen>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaAllergenRepository implements AllergenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, ctx: RequestContext): Promise<Allergen | null> {
    const where: Prisma.AllergenWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    const prismaAllergen = await this.prisma.allergen.findUnique({ where })
    if (!prismaAllergen) return null
    if (prismaAllergen && ctx.scope === UserScope.TENANT && prismaAllergen.systemState === SystemState.HIDDEN) {
      return null
    }
    return PrismaAllergenMapper.toDomain(prismaAllergen)
  }

  async findAll(filter: AllergenFilter, ctx: RequestContext): Promise<Allergen[]> {
    const where: Prisma.AllergenWhereInput = {
      ...(filter.name && { name: { contains: filter.name, mode: 'insensitive' } }),
      ...(filter.category && { category: { contains: filter.category, mode: 'insensitive' } }),
      ...(filter.isActive !== undefined && { isActive: filter.isActive }),
      ...(filter.systemState && { systemState: filter.systemState })
    }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    if (ctx.scope === UserScope.TENANT) {
      where.systemState = { not: SystemState.HIDDEN }
    }
    const prismaAllergens = await this.prisma.allergen.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    })
    return prismaAllergens.map((allergen) => PrismaAllergenMapper.toDomain(allergen))
  }

  async save(allergen: Allergen, ctx: RequestContext): Promise<Allergen> {
    if (ctx.scope === UserScope.TENANT && allergen.tenantId !== ctx.tenantId) {
      throw new ForbiddenException('Cannot modify resource outside your tenant')
    }
    const id = allergen.id.value
    const prismaAllergen = PrismaAllergenMapper.toPersistence(allergen)
    await this.prisma.allergen.upsert({
      where: { id },
      update: prismaAllergen,
      create: prismaAllergen
    })
    return allergen
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const where: Prisma.AllergenWhereUniqueInput = { id }
    if (ctx.scope === UserScope.TENANT) {
      where.tenantId = ctx.tenantId
    }
    await this.prisma.allergen.update({
      where,
      data: { systemState: SystemState.HIDDEN, updatedAt: new Date() }
    })
  }
}

class PrismaAllergenMapper {
  static toDomain(prismaAllergen: PrismaAllergen): Allergen {
    const systemState = SystemState[prismaAllergen.systemState as keyof typeof SystemState]
    if (!systemState) {
      throw new Error(`Invalid systemState value: ${prismaAllergen.systemState}`)
    }
    return Allergen.rehydrate({
      id: Id.from(prismaAllergen.id),
      createdAt: prismaAllergen.createdAt,
      updatedAt: prismaAllergen.updatedAt,
      systemState,
      tenantId: prismaAllergen.tenantId,
      name: prismaAllergen.name,
      category: prismaAllergen.category,
      regulatoryRef: prismaAllergen.regulatoryRef,
      sortOrder: prismaAllergen.sortOrder,
      isActive: prismaAllergen.isActive
    })
  }

  static toPersistence(allergen: Allergen): Prisma.AllergenUncheckedCreateInput {
    return {
      id: allergen.id.value,
      createdAt: allergen.createdAt,
      updatedAt: allergen.updatedAt,
      systemState: allergen.systemState,
      tenantId: allergen.tenantId,
      name: allergen.name,
      category: allergen.category,
      regulatoryRef: allergen.regulatoryRef,
      sortOrder: allergen.sortOrder,
      isActive: allergen.isActive
    }
  }
}
