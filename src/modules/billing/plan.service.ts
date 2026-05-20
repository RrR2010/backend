import { Injectable } from '@nestjs/common'
import { Plan } from '@billing/plan.entity'
import { PlanRepository, PlanFilter } from '@billing/plan.repository'
import {
  PlanNotFoundError,
  PlanInactiveError,
  AdditionalUsersNotAllowedError
} from '@billing/billing.errors'
import { PlanDefinition, PriceSnapshot } from '@billing/plan.types'
import { PlanType } from '@shared/enums'
import { RequestContext } from '@authorization/authorization.types'

@Injectable()
export class PlanService {
  constructor(private readonly planRepository: PlanRepository) {}

  // ============== TASK 13: List public plans ==============

  async getPublicPlans(ctx: RequestContext): Promise<Plan[]> {
    return this.planRepository.findPublicPlans(ctx)
  }

  // ============== TASK 14: Get plan by type ==============

  async getByType(planType: PlanType, ctx: RequestContext): Promise<Plan> {
    const plan = await this.planRepository.findByType(planType, ctx)
    if (!plan) {
      throw new PlanNotFoundError(planType)
    }
    if (!plan.isActive) {
      throw new PlanInactiveError(planType)
    }
    return plan
  }

  // ============== TASK 15: Calculate final price ==============

  async calculatePrice(
    planType: PlanType,
    additionalUsers: number,
    ctx: RequestContext
  ): Promise<number> {
    const plan = await this.getByType(planType, ctx)
    return plan.calculatePrice(additionalUsers)
  }

  // ============== TASK 16: Apply price snapshot ==============

  applyPriceSnapshot(plan: Plan, additionalUsers: number): PriceSnapshot {
    const totalAdditionalCost =
      plan.additionalUserPrice !== null
        ? plan.additionalUserPrice * additionalUsers
        : 0
    const totalPrice = plan.basePrice + totalAdditionalCost

    return {
      basePrice: plan.basePrice,
      additionalUserPrice: plan.additionalUserPrice,
      includedUsers: plan.includedUsers,
      additionalUsers,
      totalAdditionalCost,
      totalPrice
    }
  }

  // ============== TASK 17: Recalculate with additional users ==============

  recalculateWithAdditionalUsers(
    plan: Plan,
    newAdditionalUsers: number
  ): number {
    if (!plan.allowsAdditionalUsers && newAdditionalUsers > 0) {
      throw new AdditionalUsersNotAllowedError(plan.type)
    }
    const newAdditionalCost =
      plan.additionalUserPrice !== null
        ? plan.additionalUserPrice * newAdditionalUsers
        : 0
    return plan.basePrice + newAdditionalCost
  }

  // ============== TASK 12: Seed initial plans ==============

  async seedInitialPlans(ctx: RequestContext): Promise<Plan[]> {
    const existing = await this.planRepository.findAll({}, ctx)
    if (existing.length > 0) {
      return existing
    }

    // TODO: zod validate input
    const planDefinitions: PlanDefinition[] = [
      {
        type: PlanType.FREE,
        name: 'Free',
        description:
          'Get started with basic features. Perfect for testing the platform.',
        basePrice: 0,
        currency: 'BRL',
        includedUsers: 1,
        additionalUserPrice: null,
        maxProducts: 5,
        maxRevisions: 5,
        trialDays: null,
        features: [
          'Basic product catalog',
          'Limited revisions',
          'Single user',
          'Email support'
        ],
        allowsAdditionalUsers: false,
        isPublic: true
      },
      {
        type: PlanType.BASIC,
        name: 'Basic',
        description:
          'For growing businesses that need more capacity and flexibility.',
        basePrice: 9990,
        currency: 'BRL',
        includedUsers: 1,
        additionalUserPrice: 5000,
        maxProducts: 20,
        maxRevisions: null,
        trialDays: 7,
        features: [
          'Extended product catalog',
          'Unlimited revisions',
          'Additional users available',
          'Email support',
          'Trial period'
        ],
        allowsAdditionalUsers: true,
        isPublic: true
      },
      {
        type: PlanType.PREMIUM,
        name: 'Premium',
        description:
          'For established businesses that need full power and priority support.',
        basePrice: 19990,
        currency: 'BRL',
        includedUsers: 5,
        additionalUserPrice: 5000,
        maxProducts: 100,
        maxRevisions: null,
        trialDays: 7,
        features: [
          'Large product catalog',
          'Unlimited revisions',
          'Team collaboration',
          'Additional users available',
          'Priority support',
          'Trial period'
        ],
        allowsAdditionalUsers: true,
        isPublic: true
      }
    ]

    const plans = planDefinitions.map((def) =>
      Plan.create({
        type: def.type,
        name: def.name,
        description: def.description,
        basePrice: def.basePrice,
        currency: def.currency,
        includedUsers: def.includedUsers,
        additionalUserPrice: def.additionalUserPrice,
        maxProducts: def.maxProducts,
        maxRevisions: def.maxRevisions,
        trialDays: def.trialDays,
        features: def.features,
        isPublic: def.isPublic,
        isActive: true,
        allowsAdditionalUsers: def.allowsAdditionalUsers
      })
    )

    // Loop used for domain entity creation (each plan goes through Plan.create factory)
    // rather than raw bulk insert, to ensure domain invariants are applied.
    const saved: Plan[] = []
    for (const plan of plans) {
      const savedPlan = await this.planRepository.save(plan, ctx)
      saved.push(savedPlan)
    }

    return saved
  }

  // ============== Additional utility methods ==============

  async findAll(filter: PlanFilter, ctx: RequestContext): Promise<Plan[]> {
    return this.planRepository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<Plan | null> {
    return this.planRepository.findById(id, ctx)
  }

  async save(plan: Plan, ctx: RequestContext): Promise<Plan> {
    return this.planRepository.save(plan, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    await this.planRepository.delete(id, ctx)
  }
}
