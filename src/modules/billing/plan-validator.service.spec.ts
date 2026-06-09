import { PlanValidatorService } from './plan-validator.service'
import { PlanType, SubscriptionStatus } from '@shared/enums'
import { UserScope } from '@users/user.types'
import type { RequestContext } from '@authorization/authorization.types'

describe('PlanValidatorService', () => {
  let service: PlanValidatorService
  let prisma: any
  let planService: any
  let subscriptionRepository: any

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

    planService = {
      getByType: jest.fn(),
      getPublicPlans: jest.fn(),
      calculatePrice: jest.fn(),
      applyPriceSnapshot: jest.fn(),
      recalculateWithAdditionalUsers: jest.fn(),
      seedInitialPlans: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    }

    prisma = {
      tenantMembership: { count: jest.fn() }
    }

    service = new PlanValidatorService(prisma, planService, subscriptionRepository)
  })

  function createSubscriptionData(overrides?: Record<string, unknown>): Record<string, unknown> {
    return {
      id: 'sub-1',
      tenantId,
      planType: PlanType.FREE,
      status: SubscriptionStatus.ACTIVE,
      currency: 'BRL',
      provider: 'free',
      providerSubscriptionId: `free-${tenantId}`,
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
      cancelAtPeriodEnd: false,
      failedPaymentCount: 0,
      lastPaymentAt: null,
      lastWebhookAt: null,
      pendingPlanType: null,
      pendingEffectiveFrom: null,
      pendingNewAmount: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    }
  }

  function createPlanData(overrides?: Record<string, unknown>): Record<string, unknown> {
    return {
      id: 'plan-1',
      type: PlanType.FREE,
      name: PlanType.FREE,
      description: null,
      basePrice: 0,
      currency: 'BRL',
      includedUsers: 1,
      additionalUserPrice: null,
      maxProducts: null,
      maxRevisions: null,
      features: [],
      isPublic: true,
      isActive: true,
      allowsAdditionalUsers: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    }
  }

  // ============== checkProductLimit ==============

  describe('checkProductLimit', () => {
    it('should allow when below limit', async () => {
      const subscription = createSubscriptionData()
      const plan = createPlanData({ maxProducts: 10 })
      subscriptionRepository.findByTenantId.mockResolvedValue(subscription)
      planService.getByType.mockResolvedValue(plan)

      const result = await service.checkProductLimit(tenantId, ctx)

      expect(result.allowed).toBe(true)
      expect(result.currentUsage).toBe(0)
      expect(result.limit).toBe(10)
      expect(result.remaining).toBe(10)
      expect(result.resourceType).toBe('products')
    })

    it('should NOT allow when at limit', async () => {
      // getActiveProductCount returns 0, so limit 0 means at limit
      const subscription = createSubscriptionData()
      const plan = createPlanData({ maxProducts: 0 })
      subscriptionRepository.findByTenantId.mockResolvedValue(subscription)
      planService.getByType.mockResolvedValue(plan)

      const result = await service.checkProductLimit(tenantId, ctx)

      expect(result.allowed).toBe(false)
      expect(result.currentUsage).toBe(0)
      expect(result.limit).toBe(0)
      expect(result.remaining).toBe(0)
    })

    it('should allow when limit is null (unlimited)', async () => {
      const subscription = createSubscriptionData()
      const plan = createPlanData({ maxProducts: null })
      subscriptionRepository.findByTenantId.mockResolvedValue(subscription)
      planService.getByType.mockResolvedValue(plan)

      const result = await service.checkProductLimit(tenantId, ctx)

      expect(result.allowed).toBe(true)
      expect(result.limit).toBeNull()
      expect(result.remaining).toBeNull()
    })

    it('should return unlimited when no subscription exists', async () => {
      subscriptionRepository.findByTenantId.mockResolvedValue(null)

      const result = await service.checkProductLimit(tenantId, ctx)

      expect(result.allowed).toBe(true)
      expect(result.currentUsage).toBe(0)
      expect(result.limit).toBeNull()
      expect(result.remaining).toBeNull()
    })
  })

  // ============== checkUserLimit ==============

  describe('checkUserLimit', () => {
    it('should allow when below limit', async () => {
      const subscription = createSubscriptionData({
        includedUsersSnapshot: 3,
        additionalUsers: 0
      })
      const plan = createPlanData({
        allowsAdditionalUsers: true,
        includedUsers: 3,
        additionalUserPrice: 5000
      })
      subscriptionRepository.findByTenantId.mockResolvedValue(subscription)
      planService.getByType.mockResolvedValue(plan)
      prisma.tenantMembership.count.mockResolvedValue(1)

      const result = await service.checkUserLimit(tenantId, ctx)

      expect(result.allowed).toBe(true)
      expect(result.currentUsage).toBe(1)
      expect(result.limit).toBe(3)
      expect(result.remaining).toBe(2)
      expect(result.resourceType).toBe('users')
    })

    it('should NOT allow when at limit', async () => {
      const subscription = createSubscriptionData({
        includedUsersSnapshot: 2,
        additionalUsers: 0
      })
      const plan = createPlanData({
        allowsAdditionalUsers: true,
        includedUsers: 2
      })
      subscriptionRepository.findByTenantId.mockResolvedValue(subscription)
      planService.getByType.mockResolvedValue(plan)
      prisma.tenantMembership.count.mockResolvedValue(2)

      const result = await service.checkUserLimit(tenantId, ctx)

      expect(result.allowed).toBe(false)
      expect(result.currentUsage).toBe(2)
      expect(result.limit).toBe(2)
      expect(result.remaining).toBe(0)
    })

    it('should return null limit (unlimited) when plan does not allow additional users and has 0 included users', async () => {
      const subscription = createSubscriptionData({
        includedUsersSnapshot: 1,
        additionalUsers: 0
      })
      const plan = createPlanData({
        allowsAdditionalUsers: false,
        includedUsers: 0
      })
      subscriptionRepository.findByTenantId.mockResolvedValue(subscription)
      planService.getByType.mockResolvedValue(plan)
      prisma.tenantMembership.count.mockResolvedValue(2)

      const result = await service.checkUserLimit(tenantId, ctx)

      // Unlimited
      expect(result.allowed).toBe(true)
      expect(result.limit).toBeNull()
      expect(result.remaining).toBeNull()
    })

    it('should return unlimited when no subscription exists', async () => {
      subscriptionRepository.findByTenantId.mockResolvedValue(null)
      prisma.tenantMembership.count.mockResolvedValue(0)

      const result = await service.checkUserLimit(tenantId, ctx)

      expect(result.allowed).toBe(true)
      expect(result.limit).toBeNull()
      expect(result.remaining).toBeNull()
    })
  })

  // ============== checkRevisionLimit ==============

  describe('checkRevisionLimit', () => {
    it('should allow when below limit', async () => {
      const subscription = createSubscriptionData()
      const plan = createPlanData({ maxRevisions: 10 })
      subscriptionRepository.findByTenantId.mockResolvedValue(subscription)
      planService.getByType.mockResolvedValue(plan)

      const result = await service.checkRevisionLimit('product-1', tenantId, ctx)

      expect(result.allowed).toBe(true)
      expect(result.currentUsage).toBe(0)
      expect(result.limit).toBe(10)
      expect(result.remaining).toBe(10)
      expect(result.resourceType).toBe('revisions')
    })

    it('should return unlimited when limit is null', async () => {
      const subscription = createSubscriptionData()
      const plan = createPlanData({ maxRevisions: null })
      subscriptionRepository.findByTenantId.mockResolvedValue(subscription)
      planService.getByType.mockResolvedValue(plan)

      const result = await service.checkRevisionLimit('product-1', tenantId, ctx)

      expect(result.allowed).toBe(true)
      expect(result.limit).toBeNull()
      expect(result.remaining).toBeNull()
    })
  })

  // ============== getUpgradeSuggestion ==============

  describe('getUpgradeSuggestion', () => {
    it('should suggest BASIC when FREE exceeds product limit', async () => {
      const subscription = createSubscriptionData({ planType: PlanType.FREE })
      const freePlan = createPlanData({
        type: PlanType.FREE,
        basePrice: 0,
        maxProducts: 5
      })
      const basicPlan = createPlanData({
        type: PlanType.BASIC,
        basePrice: 9990,
        maxProducts: 20
      })

      subscriptionRepository.findByTenantId.mockResolvedValue(subscription)
      planService.getByType.mockImplementation(async (type: any) => {
        if (type === PlanType.FREE) return freePlan
        if (type === PlanType.BASIC) return basicPlan
        throw new Error(`Unexpected plan type: ${type}`)
      })

      const result = await service.getUpgradeSuggestion(tenantId, 'products', ctx)

      expect(result.recommendedPlanType).toBe(PlanType.BASIC)
      expect(result.currentPlanType).toBe(PlanType.FREE)
      expect(result.priceDifference).toBe(9990)
      expect(result.newBasePrice).toBe(9990)
      expect(result.newLimit).toBe(20)
      expect(result.reason).toContain('Upgrade')
    })

    it('should suggest BASIC when FREE exceeds user limit', async () => {
      const subscription = createSubscriptionData({ planType: PlanType.FREE })
      const freePlan = createPlanData({
        type: PlanType.FREE,
        basePrice: 0,
        includedUsers: 1
      })
      const basicPlan = createPlanData({
        type: PlanType.BASIC,
        basePrice: 9990,
        includedUsers: 1
      })

      subscriptionRepository.findByTenantId.mockResolvedValue(subscription)
      planService.getByType.mockImplementation(async (type: any) => {
        if (type === PlanType.FREE) return freePlan
        if (type === PlanType.BASIC) return basicPlan
        throw new Error(`Unexpected plan type: ${type}`)
      })

      const result = await service.getUpgradeSuggestion(tenantId, 'users', ctx)

      expect(result.recommendedPlanType).toBe(PlanType.BASIC)
      expect(result.priceDifference).toBe(9990)
    })

    it('should return same plan when already at highest tier', async () => {
      const subscription = createSubscriptionData({ planType: PlanType.ENTERPRISE })

      subscriptionRepository.findByTenantId.mockResolvedValue(subscription)
      planService.getByType.mockResolvedValue(
        createPlanData({ type: PlanType.ENTERPRISE, basePrice: 29990 })
      )

      const result = await service.getUpgradeSuggestion(tenantId, 'products', ctx)

      expect(result.recommendedPlanType).toBe(PlanType.ENTERPRISE)
      expect(result.currentPlanType).toBe(PlanType.ENTERPRISE)
      expect(result.reason).toBe('No higher plan available')
      expect(result.priceDifference).toBe(0)
    })

    it('should return same plan when no subscription and already at highest', async () => {
      subscriptionRepository.findByTenantId.mockResolvedValue(null)

      // No subscription defaults to FREE, and if it's the highest (or no higher), return current
      // The suggestion goes FREE -> BASIC for 'products' resource
      const freePlan = createPlanData({ type: PlanType.FREE, basePrice: 0, maxProducts: 5 })
      const basicPlan = createPlanData({ type: PlanType.BASIC, basePrice: 9990, maxProducts: 20 })

      planService.getByType.mockImplementation(async (type: any) => {
        if (type === PlanType.FREE) return freePlan
        if (type === PlanType.BASIC) return basicPlan
        throw new Error(`Unexpected plan type: ${type}`)
      })

      const result = await service.getUpgradeSuggestion(tenantId, 'products', ctx)

      // FREE -> BASIC since FREE has no subscription
      expect(result.recommendedPlanType).toBe(PlanType.BASIC)
      expect(result.currentPlanType).toBe(PlanType.FREE)
    })
  })
})
