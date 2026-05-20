import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { Plan } from '@billing/plan.entity'
import { Plan as PrismaPlan, Prisma } from '@prisma/client'
import { Id } from '@shared/value-objects'
import { PlanType } from '@shared/enums'
import { Json } from '@shared/types'
import { RequestContext } from '@authorization/authorization.types'

export interface PlanFilter {
  type?: PlanType
  isPublic?: boolean
  isActive?: boolean
}

export abstract class PlanRepository {
  abstract findById(id: string, ctx: RequestContext): Promise<Plan | null>
  abstract findByType(type: PlanType, ctx: RequestContext): Promise<Plan | null>
  abstract findAll(filter: PlanFilter, ctx: RequestContext): Promise<Plan[]>
  abstract findPublicPlans(ctx: RequestContext): Promise<Plan[]>
  abstract save(plan: Plan, ctx: RequestContext): Promise<Plan>
  abstract delete(id: string, ctx: RequestContext): Promise<void>
}

@Injectable()
export class PrismaPlanRepository implements PlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, _ctx: RequestContext): Promise<Plan | null> {
    const prismaPlan = await this.prisma.plan.findUnique({
      where: { id }
    })
    if (!prismaPlan) return null
    return PlanMapper.toDomain(prismaPlan)
  }

  async findByType(type: PlanType, _ctx: RequestContext): Promise<Plan | null> {
    const prismaPlan = await this.prisma.plan.findUnique({
      where: { type }
    })
    if (!prismaPlan) return null
    return PlanMapper.toDomain(prismaPlan)
  }

  async findAll(filter: PlanFilter, _ctx: RequestContext): Promise<Plan[]> {
    const where: Prisma.PlanWhereInput = {}

    if (filter.type) {
      where.type = filter.type
    }
    if (filter.isPublic !== undefined) {
      where.isPublic = filter.isPublic
    }
    if (filter.isActive !== undefined) {
      where.isActive = filter.isActive
    }

    const prismaPlans = await this.prisma.plan.findMany({ where })
    return prismaPlans.map((plan) => PlanMapper.toDomain(plan))
  }

  async findPublicPlans(_ctx: RequestContext): Promise<Plan[]> {
    // Platform-level entity - no tenant filtering needed
    const prismaPlans = await this.prisma.plan.findMany({
      where: { isPublic: true, isActive: true }
    })
    return prismaPlans.map((plan) => PlanMapper.toDomain(plan))
  }

  async save(plan: Plan, _ctx: RequestContext): Promise<Plan> {
    const prismaPlan = PlanMapper.toPersistence(plan)
    await this.prisma.plan.upsert({
      where: { id: plan.id.value },
      update: prismaPlan,
      create: prismaPlan
    })
    return plan
  }

  async delete(id: string, _ctx: RequestContext): Promise<void> {
    // TODO: Add authorization check here or ensure it's handled at service layer
    // Plan deletion should be restricted based on business rules (e.g., cannot delete plans with active subscriptions)
    await this.prisma.plan.delete({ where: { id } })
  }
}

export { PlanMapper as PlanRepositoryMapper }

class PlanMapper {
  static toDomain(prismaPlan: PrismaPlan): Plan {
    return Plan.rehydrate({
      id: Id.from(prismaPlan.id),
      type: prismaPlan.type as PlanType,
      name: prismaPlan.name,
      description: prismaPlan.description ?? null,
      basePrice: prismaPlan.basePrice,
      currency: prismaPlan.currency as 'BRL',
      includedUsers: prismaPlan.includedUsers,
      additionalUserPrice: prismaPlan.additionalUserPrice ?? null,
      maxProducts: prismaPlan.maxProducts ?? null,
      maxRevisions: prismaPlan.maxRevisions ?? null,
      trialDays: prismaPlan.trialDays ?? null,
      features: prismaPlan.features as Json,
      isPublic: prismaPlan.isPublic,
      isActive: prismaPlan.isActive,
      allowsAdditionalUsers: prismaPlan.allowsAdditionalUsers,
      createdAt: prismaPlan.createdAt,
      updatedAt: prismaPlan.updatedAt
    })
  }

  static toPersistence(plan: Plan): Prisma.PlanUncheckedCreateInput {
    return {
      id: plan.id.value,
      type: plan.type,
      name: plan.name,
      description: plan.description ?? null,
      basePrice: plan.basePrice,
      currency: plan.currency,
      includedUsers: plan.includedUsers,
      additionalUserPrice: plan.additionalUserPrice ?? null,
      maxProducts: plan.maxProducts ?? null,
      maxRevisions: plan.maxRevisions ?? null,
      trialDays: plan.trialDays ?? null,
      features: plan.features as Prisma.InputJsonValue,
      isPublic: plan.isPublic,
      isActive: plan.isActive,
      allowsAdditionalUsers: plan.allowsAdditionalUsers,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt
    }
  }
}
