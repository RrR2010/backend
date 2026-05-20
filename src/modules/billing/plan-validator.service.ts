import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '@shared/prisma/prisma.service'
import { Plan } from '@billing/plan.entity'
import { Subscription } from '@billing/subscription.entity'
import { PlanService } from '@billing/plan.service'
import { SubscriptionRepository } from '@billing/subscription.repository'
import {
  ValidationResult,
  ResourceUsage,
  UpgradeSuggestion,
  AccessCheck,
  ResourceType
} from '@billing/plan-validator.types'
import {
  ResourceLimitExceededError,
  SubscriptionAccessDeniedError
} from '@billing/billing.errors'
import { PlanType, SubscriptionStatus } from '@shared/enums'
import { SystemState } from '@shared/behaviours/lockable'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

@Injectable()
export class PlanValidatorService {
  private readonly logger = new Logger(PlanValidatorService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly planService: PlanService,
    private readonly subscriptionRepository: SubscriptionRepository
  ) {}

  /**
   * Check if tenant can add another user based on plan limits.
   * // TODO: zod validate input
   */
  async checkUserLimit(
    tenantId: string,
    ctx: RequestContext
  ): Promise<ValidationResult> {
    const subscription = await this.subscriptionRepository.findByTenantId(
      tenantId,
      ctx
    )

    if (!subscription) {
      // No subscription: count actual usage but return unlimited (null limit)
      const currentUsage = await this.getActiveUserCount(tenantId, ctx)
      return {
        allowed: true,
        currentUsage,
        limit: null,
        remaining: null,
        resourceType: 'users'
      }
    }

    const plan = await this.planService.getByType(subscription.planType, ctx)
    const currentUsage = await this.getActiveUserCount(tenantId, ctx)
    const limit = this.getUserLimit(plan, subscription)
    const remaining = limit !== null ? Math.max(0, limit - currentUsage) : null
    const allowed = limit === null || currentUsage < limit

    return {
      allowed,
      currentUsage,
      limit,
      remaining,
      resourceType: 'users'
    }
  }

  /**
   * Check if tenant can add another product based on plan limits.
   * // TODO: zod validate input
   */
  async checkProductLimit(
    tenantId: string,
    ctx: RequestContext
  ): Promise<ValidationResult> {
    const subscription = await this.subscriptionRepository.findByTenantId(
      tenantId,
      ctx
    )

    if (!subscription) {
      // No subscription: count actual usage but return unlimited (null limit)
      const currentUsage = this.getActiveProductCount(tenantId, ctx)
      return {
        allowed: true,
        currentUsage,
        limit: null,
        remaining: null,
        resourceType: 'products'
      }
    }

    const plan = await this.planService.getByType(subscription.planType, ctx)
    const currentUsage = this.getActiveProductCount(tenantId, ctx)
    const limit = plan.maxProducts
    const remaining = limit !== null ? Math.max(0, limit - currentUsage) : null
    const allowed = limit === null || currentUsage < limit

    return {
      allowed,
      currentUsage,
      limit,
      remaining,
      resourceType: 'products'
    }
  }

  /**
   * Check if a product can have another revision based on plan limits.
   * // TODO: zod validate input
   */
  async checkRevisionLimit(
    productId: string,
    tenantId: string,
    ctx: RequestContext
  ): Promise<ValidationResult> {
    const subscription = await this.subscriptionRepository.findByTenantId(
      tenantId,
      ctx
    )

    if (!subscription) {
      // No subscription: count actual usage but return unlimited (null limit)
      const currentUsage = this.getProductRevisionCount(
        productId,
        tenantId,
        ctx
      )
      return {
        allowed: true,
        currentUsage,
        limit: null,
        remaining: null,
        resourceType: 'revisions'
      }
    }

    const plan = await this.planService.getByType(subscription.planType, ctx)
    const currentUsage = this.getProductRevisionCount(productId, tenantId, ctx)
    const limit = plan.maxRevisions
    const remaining = limit !== null ? Math.max(0, limit - currentUsage) : null
    const allowed = limit === null || currentUsage < limit

    return {
      allowed,
      currentUsage,
      limit,
      remaining,
      resourceType: 'revisions'
    }
  }

  /**
   * Return usage information for all resources.
   * // TODO: zod validate input
   */
  async getResourceUsage(
    tenantId: string,
    ctx: RequestContext
  ): Promise<ResourceUsage> {
    const subscription = await this.subscriptionRepository.findByTenantId(
      tenantId,
      ctx
    )

    if (!subscription) {
      // No subscription: count actual usage but return unlimited (null limits)
      const userCount = await this.getActiveUserCount(tenantId, ctx)
      const productCount = this.getActiveProductCount(tenantId, ctx)
      return {
        users: {
          allowed: true,
          currentUsage: userCount,
          limit: null,
          remaining: null,
          resourceType: 'users'
        },
        products: {
          allowed: true,
          currentUsage: productCount,
          limit: null,
          remaining: null,
          resourceType: 'products'
        },
        revisions: {
          allowed: true,
          currentUsage: 0,
          limit: null,
          remaining: null,
          resourceType: 'revisions'
        },
        planType: PlanType.FREE,
        subscriptionStatus: null
      }
    }

    const plan = await this.planService.getByType(subscription.planType, ctx)
    const userCount = await this.getActiveUserCount(tenantId, ctx)
    const productCount = this.getActiveProductCount(tenantId, ctx)
    const userLimit = this.getUserLimit(plan, subscription)

    return {
      users: {
        allowed: userLimit === null || userCount < userLimit,
        currentUsage: userCount,
        limit: userLimit,
        remaining:
          userLimit !== null ? Math.max(0, userLimit - userCount) : null,
        resourceType: 'users'
      },
      products: {
        allowed: plan.maxProducts === null || productCount < plan.maxProducts,
        currentUsage: productCount,
        limit: plan.maxProducts,
        remaining:
          plan.maxProducts !== null
            ? Math.max(0, plan.maxProducts - productCount)
            : null,
        resourceType: 'products'
      },
      revisions: {
        // Revisions are per-product, not per-tenant. Aggregated tenant-level
        // revision count is not meaningful here. Use checkRevisionLimit(productId)
        // for per-product validation.
        allowed: true,
        currentUsage: 0,
        limit: plan.maxRevisions,
        remaining: plan.maxRevisions !== null ? plan.maxRevisions : null,
        resourceType: 'revisions'
      },
      planType: subscription.planType,
      subscriptionStatus: subscription.status
    }
  }

  /**
   * Return upgrade suggestion when a resource limit is exceeded.
   * // TODO: zod validate input
   */
  async getUpgradeSuggestion(
    tenantId: string,
    resourceType: ResourceType,
    ctx: RequestContext
  ): Promise<UpgradeSuggestion> {
    const subscription = await this.subscriptionRepository.findByTenantId(
      tenantId,
      ctx
    )

    if (!subscription) {
      return this.getSuggestionFromPlan(PlanType.FREE, resourceType, ctx)
    }

    return this.getSuggestionFromPlan(subscription.planType, resourceType, ctx)
  }

  /**
   * Check if tenant has access based on subscription status.
   * Returns whether access is allowed, degraded, or denied.
   * // TODO: zod validate input
   */
  async checkSubscriptionAccess(
    tenantId: string,
    ctx: RequestContext
  ): Promise<AccessCheck> {
    const subscription = await this.subscriptionRepository.findByTenantId(
      tenantId,
      ctx
    )

    if (!subscription) {
      return {
        hasAccess: true,
        isDegraded: false,
        restrictions: [],
        subscriptionStatus: null,
        graceEndsAt: null,
        message: null
      }
    }

    const status = subscription.status

    if (
      status === SubscriptionStatus.ACTIVE ||
      status === SubscriptionStatus.TRIALING
    ) {
      return {
        hasAccess: true,
        isDegraded: false,
        restrictions: [],
        subscriptionStatus: status,
        graceEndsAt: null,
        message: null
      }
    }

    if (status === SubscriptionStatus.PAST_DUE) {
      return {
        hasAccess: true,
        isDegraded: true,
        restrictions: ['read_only_mode'],
        subscriptionStatus: status,
        graceEndsAt: null,
        message: 'Payment is overdue. Some features may be restricted.'
      }
    }

    if (status === SubscriptionStatus.GRACE) {
      const isGraceExpired =
        subscription.graceEndsAt !== null &&
        subscription.graceEndsAt < new Date()

      if (isGraceExpired) {
        return {
          hasAccess: false,
          isDegraded: false,
          restrictions: ['full_lock'],
          subscriptionStatus: status,
          graceEndsAt: subscription.graceEndsAt,
          message: 'Grace period has expired. Access is suspended.'
        }
      }

      const graceEndsAt = subscription.graceEndsAt as Date

      return {
        hasAccess: true,
        isDegraded: true,
        restrictions: ['limited_features', 'warning_banner'],
        subscriptionStatus: status,
        graceEndsAt,
        message: `Grace period active until ${graceEndsAt.toISOString()}. Please update payment.`
      }
    }

    if (status === SubscriptionStatus.PAUSED) {
      return {
        hasAccess: true,
        isDegraded: true,
        restrictions: ['read_only_mode', 'no_new_resources'],
        subscriptionStatus: status,
        graceEndsAt: null,
        message:
          'Subscription is paused. You can view but not modify resources.'
      }
    }

    if (
      status === SubscriptionStatus.CANCELED ||
      status === SubscriptionStatus.EXPIRED
    ) {
      return {
        hasAccess: false,
        isDegraded: false,
        restrictions: ['full_lock'],
        subscriptionStatus: status,
        graceEndsAt: null,
        message: `Subscription is ${String(status).toLowerCase()}. Access is suspended.`
      }
    }

    return {
      hasAccess: false,
      isDegraded: false,
      restrictions: ['full_lock'],
      subscriptionStatus: status,
      graceEndsAt: null,
      message: `Unknown subscription status: ${String(status)}`
    }
  }

  /**
   * Assert that user limit is not exceeded. Throws if exceeded.
   * // TODO: zod validate input
   */
  async assertUserLimit(tenantId: string, ctx: RequestContext): Promise<void> {
    const result = await this.checkUserLimit(tenantId, ctx)
    if (!result.allowed) {
      throw new ResourceLimitExceededError(
        'users',
        result.currentUsage,
        result.limit ?? 0
      )
    }
  }

  /**
   * Assert that product limit is not exceeded. Throws if exceeded.
   * // TODO: zod validate input
   */
  async assertProductLimit(
    tenantId: string,
    ctx: RequestContext
  ): Promise<void> {
    const result = await this.checkProductLimit(tenantId, ctx)
    if (!result.allowed) {
      throw new ResourceLimitExceededError(
        'products',
        result.currentUsage,
        result.limit ?? 0
      )
    }
  }

  /**
   * Assert that revision limit is not exceeded. Throws if exceeded.
   * // TODO: zod validate input
   */
  async assertRevisionLimit(
    productId: string,
    tenantId: string,
    ctx: RequestContext
  ): Promise<void> {
    const result = await this.checkRevisionLimit(productId, tenantId, ctx)
    if (!result.allowed) {
      throw new ResourceLimitExceededError(
        'revisions',
        result.currentUsage,
        result.limit ?? 0
      )
    }
  }

  /**
   * Assert that subscription access is allowed. Throws if denied.
   * // TODO: zod validate input
   */
  async assertSubscriptionAccess(
    tenantId: string,
    ctx: RequestContext
  ): Promise<void> {
    const access = await this.checkSubscriptionAccess(tenantId, ctx)
    if (!access.hasAccess) {
      throw new SubscriptionAccessDeniedError(
        tenantId,
        access.subscriptionStatus ?? 'unknown'
      )
    }
  }

  // --- Private helpers ---

  private async getActiveUserCount(
    tenantId: string,
    ctx: RequestContext
  ): Promise<number> {
    const where: Record<string, unknown> = {
      tenantId,
      systemState: SystemState.ACTIVE
    }

    if (ctx.scope === UserScope.TENANT && tenantId !== ctx.tenantId) {
      return 0
    }

    const count = await this.prisma.tenantMembership.count({ where })
    return count
  }

  // TODO: Implement when Product module exists
  // private async getActiveProductCount(
  //   tenantId: string,
  //   ctx: RequestContext
  // ): Promise<number> {
  //   // Tenant-scope authorization guard
  //   if (ctx.scope === UserScope.TENANT && tenantId !== ctx.tenantId) {
  //     return 0
  //   }
  //   return this.productRepository.countByTenantId(
  //     tenantId,
  //     { isActive: true },
  //     ctx
  //   )
  // }
  private getActiveProductCount(
    _tenantId: string,
    _ctx: RequestContext
  ): number {
    // TODO: Return actual count when Product module exists
    return 0
  }

  // TODO: Implement when Product and Revision modules exist
  // private async getProductRevisionCount(
  //   productId: string,
  //   tenantId: string,
  //   ctx: RequestContext
  // ): Promise<number> {
  //   // Tenant-scope authorization guard
  //   if (ctx.scope === UserScope.TENANT && tenantId !== ctx.tenantId) {
  //     return 0
  //   }
  //   // Verify product belongs to tenant before counting revisions
  //   const product = await this.productRepository.findById(productId, ctx)
  //   if (!product || product.tenantId !== tenantId) {
  //     return 0
  //   }
  //   return this.revisionRepository.countByProductId(productId, ctx)
  // }
  private getProductRevisionCount(
    _productId: string,
    _tenantId: string,
    _ctx: RequestContext
  ): number {
    // TODO: Return actual count when Product and Revision modules exist
    return 0
  }

  private getUserLimit(plan: Plan, subscription: Subscription): number | null {
    const includedUsers = subscription.includedUsersSnapshot
    const additionalUsers = subscription.additionalUsers
    const totalUsers = includedUsers + additionalUsers

    // If the plan does not allow additional users AND has 0 included users,
    // treat it as unlimited (e.g., FREE plan with no user restrictions).
    // Otherwise, enforce the snapshot-based limit.
    if (plan.allowsAdditionalUsers === false && plan.includedUsers === 0) {
      return null
    }

    return totalUsers
  }

  private async getSuggestionFromPlan(
    currentPlanType: PlanType,
    resourceType: ResourceType,
    ctx: RequestContext
  ): Promise<UpgradeSuggestion> {
    const planOrder: PlanType[] = [
      PlanType.FREE,
      PlanType.BASIC,
      PlanType.PREMIUM,
      PlanType.ENTERPRISE
    ]

    const currentIndex = planOrder.indexOf(currentPlanType)
    let nextPlanType: PlanType = currentPlanType
    if (currentIndex < planOrder.length - 1) {
      nextPlanType = planOrder[currentIndex + 1] as PlanType
    }

    if (nextPlanType === currentPlanType) {
      return {
        recommendedPlanType: currentPlanType,
        currentPlanType,
        reason: 'No higher plan available',
        priceDifference: 0,
        newBasePrice: 0,
        newLimit: null
      }
    }

    // Fetch both plans in parallel for efficiency
    const [nextPlan, currentPlan] = await Promise.all([
      this.planService.getByType(nextPlanType, ctx),
      this.planService.getByType(currentPlanType, ctx)
    ])

    const priceDifference = nextPlan.basePrice - currentPlan.basePrice

    let newLimit: number | null
    let reason: string

    if (resourceType === 'users') {
      newLimit = nextPlan.includedUsers
      reason = `Upgrade to ${nextPlan.name} for ${nextPlan.includedUsers} included users`
    } else if (resourceType === 'products') {
      newLimit = nextPlan.maxProducts
      reason = `Upgrade to ${nextPlan.name} for up to ${nextPlan.maxProducts ?? 'unlimited'} products`
    } else {
      newLimit = nextPlan.maxRevisions
      reason = `Upgrade to ${nextPlan.name} for up to ${nextPlan.maxRevisions ?? 'unlimited'} revisions`
    }

    return {
      recommendedPlanType: nextPlanType,
      currentPlanType,
      reason,
      priceDifference,
      newBasePrice: nextPlan.basePrice,
      newLimit
    }
  }
}
