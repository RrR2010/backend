import { SubscriptionService } from './subscription.service'
import { Subscription } from './subscription.entity'
import { Id } from '@shared/value-objects'
import { PlanType, SubscriptionStatus } from '@shared/enums'
import { UserScope } from '@users/user.types'
import type { RequestContext } from '@authorization/authorization.types'
import type { SubscriptionRepository } from './subscription.repository'
import type { SubscriptionEventRepository } from './subscription-event.repository'
import type { PlanService } from './plan.service'
import type { ConfigService } from '@nestjs/config'
import type { PrismaService } from '@shared/prisma/prisma.service'
import type { SubscriptionProvider } from './subscription-provider.interface'

describe('SubscriptionService.getCurrentSubscription', () => {
  let service: SubscriptionService
  let subscriptionRepository: any
  let subscriptionEventRepository: any
  let planService: any
  let configService: any
  let prisma: any
  let provider: any

  const tenantId = '27c0a5a6-9c7f-4b8d-9e0a-3f2c1d4e5b6a'
  const ctx: RequestContext = {
    userId: 'user-1',
    scope: UserScope.TENANT,
    roles: [],
    tenantId
  }

  beforeEach(() => {
    subscriptionRepository = {
      findByTenantId: jest.fn(),
      findById: jest.fn(),
      findByProviderSubscriptionId: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    }

    subscriptionEventRepository = {
      findById: jest.fn(),
      findByProviderEventId: jest.fn(),
      findBySubscriptionId: jest.fn(),
      findLatestBySubscriptionId: jest.fn(),
      findAll: jest.fn(),
      countByFilter: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    }

    planService = {
      getPublicPlans: jest.fn(),
      getByType: jest.fn(),
      calculatePrice: jest.fn(),
      applyPriceSnapshot: jest.fn(),
      recalculateWithAdditionalUsers: jest.fn(),
      seedInitialPlans: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    }

    configService = {
      get: jest.fn()
    }

    prisma = {
      product: { count: jest.fn() },
      tenantMembership: { count: jest.fn() },
      formulationRevision: { count: jest.fn() }
    }

    provider = {
      name: 'fake',
      createSubscription: jest.fn(),
      updateSubscription: jest.fn(),
      cancelSubscription: jest.fn(),
      pauseSubscription: jest.fn(),
      resumeSubscription: jest.fn(),
      getSubscription: jest.fn(),
      validateWebhookSignature: jest.fn()
    }

    service = new SubscriptionService(
      subscriptionRepository,
      subscriptionEventRepository,
      planService,
      configService,
      prisma,
      provider
    )
  })

  function createSubscription(
    overrides: Partial<{
      planType: PlanType
      status: SubscriptionStatus
      cancelAtPeriodEnd: boolean
      pendingPlanType: PlanType | null
    }> = {}
  ): Subscription {
    return Subscription.rehydrate({
      id: Id.generate(),
      tenantId,
      planType: overrides.planType ?? PlanType.FREE,
      status: overrides.status ?? SubscriptionStatus.ACTIVE,
      currency: 'BRL',
      provider: 'free',
      providerSubscriptionId: `free-${tenantId}`,
      providerPreapprovalId: null,
      providerCustomerId: null,
      basePriceSnapshot: 0,
      additionalUserPriceSnapshot: null,
      includedUsersSnapshot: 1,
      additionalUsers: 0,
      currentAmount: 0,
      nextBillingAmount: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      graceEndsAt: null,
      cancelAtPeriodEnd: overrides.cancelAtPeriodEnd ?? false,
      failedPaymentCount: 0,
      lastPaymentAt: null,
      lastWebhookAt: null,
      pendingPlanType: overrides.pendingPlanType ?? null,
      pendingEffectiveFrom: null,
      pendingNewAmount: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  // --------------- Happy Path ---------------

  it('should return the subscription when found', async () => {
    const subscription = createSubscription({
      planType: PlanType.BASIC,
      pendingPlanType: PlanType.PREMIUM
    })

    subscriptionRepository.findByTenantId.mockResolvedValue(subscription)

    const result = await service.getCurrentSubscription(tenantId, ctx)

    expect(result).not.toBeNull()
    expect(result!.planType).toBe(PlanType.BASIC)
    expect(result!.status).toBe(SubscriptionStatus.ACTIVE)
    expect(result!.cancelAtPeriodEnd).toBe(false)
    expect(result!.pendingPlanType).toBe(PlanType.PREMIUM)
  })

  // --------------- No subscription ---------------

  it('should return null when no subscription exists', async () => {
    subscriptionRepository.findByTenantId.mockResolvedValue(null)

    const result = await service.getCurrentSubscription(tenantId, ctx)

    expect(result).toBeNull()
  })

  // --------------- Passes correct args ---------------

  it('should call findByTenantId with correct tenantId and ctx', async () => {
    const subscription = createSubscription()
    subscriptionRepository.findByTenantId.mockResolvedValue(subscription)

    await service.getCurrentSubscription(tenantId, ctx)

    expect(subscriptionRepository.findByTenantId).toHaveBeenCalledWith(
      tenantId,
      ctx
    )
  })
})
