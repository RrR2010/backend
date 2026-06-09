import { WebhookService } from '@webhook/webhook.service'
import { BootstrapService } from '@bootstrap/bootstrap.service'
import type { SubscriptionRepository } from '@billing/subscription.repository'
import type { SubscriptionService } from '@billing/subscription.service'
import { Subscription } from '@billing/subscription.entity'
import { Id } from '@shared/value-objects'
import { PlanType, SubscriptionStatus } from '@shared/enums'
import type {
  AsaasWebhookPayload,
  AsaasWebhookEvent
} from '@webhook/webhook.types'

describe('WebhookService.handleEvent', () => {
  let service: WebhookService
  let bootstrapService: jest.Mocked<
    Pick<BootstrapService, 'processPaymentConfirmed'>
  >
  let subscriptionRepository: jest.Mocked<
    Pick<SubscriptionRepository, 'findByProviderSubscriptionId'>
  >
  let subscriptionService: jest.Mocked<
    Pick<SubscriptionService, 'applyGracePeriod' | 'cancelSubscription'>
  >

  const validSubscriptionId = 'sub_asaas_123'
  const validTenantId = '27c0a5a6-9c7f-4b8d-9e0a-3f2c1d4e5b6a'

  function createSubscription(
    overrides: Partial<{
      status: SubscriptionStatus
      planType: PlanType
    }> = {}
  ): Subscription {
    return Subscription.rehydrate({
      id: Id.generate(),
      tenantId: validTenantId,
      planType: overrides.planType ?? PlanType.BASIC,
      status: overrides.status ?? SubscriptionStatus.ACTIVE,
      currency: 'BRL',
      provider: 'asaas',
      providerSubscriptionId: validSubscriptionId,
      providerCustomerId: 'cus_123',
      basePriceSnapshot: 5990,
      additionalUserPriceSnapshot: null,
      includedUsersSnapshot: 1,
      additionalUsers: 0,
      currentAmount: 5990,
      nextBillingAmount: null,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(),
      graceEndsAt: null,
      cancelAtPeriodEnd: false,
      failedPaymentCount: 0,
      lastPaymentAt: null,
      lastWebhookAt: null,
      pendingPlanType: null,
      pendingEffectiveFrom: null,
      pendingNewAmount: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  function makePayload(
    event: AsaasWebhookEvent,
    subscription?: string
  ): AsaasWebhookPayload {
    return {
      event,
      payment: {
        id: 'pay_789',
        subscription: subscription ?? validSubscriptionId,
        value: 59.9,
        netValue: 59.9,
        status: 'CONFIRMED',
        dueDate: '2026-06-10',
        billingType: 'UNDEFINED',
        invoiceUrl: null
      },
      subscription: subscription
        ? {
            id: subscription,
            status: 'ACTIVE',
            cycle: 'MONTHLY',
            value: 59.9,
            nextDueDate: '2026-07-10'
          }
        : null
    }
  }

  beforeEach(() => {
    bootstrapService = {
      processPaymentConfirmed: jest.fn().mockResolvedValue({ processed: true })
    }

    subscriptionRepository = {
      findByProviderSubscriptionId: jest.fn()
    }

    subscriptionService = {
      applyGracePeriod: jest
        .fn()
        .mockResolvedValue(
          createSubscription({ status: SubscriptionStatus.GRACE })
        ),
      cancelSubscription: jest
        .fn()
        .mockResolvedValue(
          createSubscription({ status: SubscriptionStatus.CANCELED })
        )
    }

    service = new WebhookService(
      bootstrapService as unknown as BootstrapService,
      subscriptionRepository as unknown as SubscriptionRepository,
      subscriptionService as unknown as SubscriptionService
    )
  })

  // =====================
  // T-035: PAYMENT_CONFIRMED → provisioning
  // =====================

  describe('PAYMENT_CONFIRMED', () => {
    it('should call BootstrapService.processPaymentConfirmed with valid subscription ID', async () => {
      const payload = makePayload('PAYMENT_CONFIRMED')

      const result = await service.handleEvent(payload)

      expect(bootstrapService.processPaymentConfirmed).toHaveBeenCalledWith(
        validSubscriptionId,
        expect.objectContaining({
          userId: 'system',
          scope: 'PLATFORM'
        })
      )
      expect(result).toEqual({ processed: true })
    })

    it('should handle PAYMENT_RECEIVED the same as PAYMENT_CONFIRMED', async () => {
      const payload = makePayload('PAYMENT_RECEIVED')

      const result = await service.handleEvent(payload)

      expect(bootstrapService.processPaymentConfirmed).toHaveBeenCalledWith(
        validSubscriptionId,
        expect.anything()
      )
      expect(result).toEqual({ processed: true })
    })

    it('should handle gracefully when payment is null (no subscription ID available)', async () => {
      const payload = makePayload('PAYMENT_CONFIRMED', undefined)
      payload.payment = null

      const result = await service.handleEvent(payload)

      expect(bootstrapService.processPaymentConfirmed).not.toHaveBeenCalled()
      expect(result).toEqual({ processed: true })
    })

    it('should handle gracefully when processPaymentConfirmed returns processed=false (idempotent)', async () => {
      bootstrapService.processPaymentConfirmed.mockResolvedValue({
        processed: false
      })
      const payload = makePayload('PAYMENT_CONFIRMED')

      const result = await service.handleEvent(payload)

      expect(bootstrapService.processPaymentConfirmed).toHaveBeenCalled()
      expect(result).toEqual({ processed: false })
    })

    it('should handle gracefully when BootstrapService throws an error', async () => {
      bootstrapService.processPaymentConfirmed.mockRejectedValue(
        new Error('Provisioning failed')
      )
      const payload = makePayload('PAYMENT_CONFIRMED')

      await expect(service.handleEvent(payload)).rejects.toThrow(
        'Provisioning failed'
      )
    })
  })

  // =====================
  // T-036: PAYMENT_OVERDUE → grace
  // =====================

  describe('PAYMENT_OVERDUE', () => {
    it('should call SubscriptionService.applyGracePeriod with valid subscription', async () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.ACTIVE
      })
      subscriptionRepository.findByProviderSubscriptionId.mockResolvedValue(
        subscription
      )
      const payload = makePayload('PAYMENT_OVERDUE')

      const result = await service.handleEvent(payload)

      expect(
        subscriptionRepository.findByProviderSubscriptionId
      ).toHaveBeenCalledWith(validSubscriptionId, expect.anything())
      expect(subscriptionService.applyGracePeriod).toHaveBeenCalledWith(
        validTenantId,
        expect.objectContaining({
          userId: 'system',
          scope: 'PLATFORM'
        })
      )
      expect(result).toEqual({ processed: true })
    })

    it('should be idempotent when subscription is already in GRACE', async () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.GRACE
      })
      subscriptionRepository.findByProviderSubscriptionId.mockResolvedValue(
        subscription
      )
      const payload = makePayload('PAYMENT_OVERDUE')

      const result = await service.handleEvent(payload)

      // The service calls applyGracePeriod which checks isInGracePeriod internally
      expect(subscriptionService.applyGracePeriod).toHaveBeenCalled()
      expect(result).toEqual({ processed: true })
    })

    it('should handle gracefully when no local subscription found', async () => {
      subscriptionRepository.findByProviderSubscriptionId.mockResolvedValue(
        null
      )
      const payload = makePayload('PAYMENT_OVERDUE')

      const result = await service.handleEvent(payload)

      expect(subscriptionService.applyGracePeriod).not.toHaveBeenCalled()
      expect(result).toEqual({ processed: true })
    })

    it('should handle gracefully when payment is null (no subscription ID available)', async () => {
      const payload = makePayload('PAYMENT_OVERDUE', undefined)
      payload.payment = null

      const result = await service.handleEvent(payload)

      expect(
        subscriptionRepository.findByProviderSubscriptionId
      ).not.toHaveBeenCalled()
      expect(subscriptionService.applyGracePeriod).not.toHaveBeenCalled()
      expect(result).toEqual({ processed: true })
    })
  })

  // =====================
  // T-037: PAYMENT_REFUNDED → cancel
  // =====================

  describe('PAYMENT_REFUNDED', () => {
    it('should call SubscriptionService.cancelSubscription with valid subscription and cancelAtPeriodEnd=false', async () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.ACTIVE
      })
      subscriptionRepository.findByProviderSubscriptionId.mockResolvedValue(
        subscription
      )
      const payload = makePayload('PAYMENT_REFUNDED')

      const result = await service.handleEvent(payload)

      expect(
        subscriptionRepository.findByProviderSubscriptionId
      ).toHaveBeenCalledWith(validSubscriptionId, expect.anything())
      expect(subscriptionService.cancelSubscription).toHaveBeenCalledWith(
        validTenantId,
        false,
        expect.objectContaining({
          userId: 'system',
          scope: 'PLATFORM'
        })
      )
      expect(result).toEqual({ processed: true })
    })

    it('should handle gracefully when no local subscription found', async () => {
      subscriptionRepository.findByProviderSubscriptionId.mockResolvedValue(
        null
      )
      const payload = makePayload('PAYMENT_REFUNDED')

      const result = await service.handleEvent(payload)

      expect(subscriptionService.cancelSubscription).not.toHaveBeenCalled()
      expect(result).toEqual({ processed: true })
    })

    it('should handle gracefully when payment is null (no subscription ID available)', async () => {
      const payload = makePayload('PAYMENT_REFUNDED', undefined)
      payload.payment = null

      const result = await service.handleEvent(payload)

      expect(
        subscriptionRepository.findByProviderSubscriptionId
      ).not.toHaveBeenCalled()
      expect(subscriptionService.cancelSubscription).not.toHaveBeenCalled()
      expect(result).toEqual({ processed: true })
    })
  })

  // =====================
  // Edge cases: other events passing through
  // =====================

  describe('other events', () => {
    it('should handle SUBSCRIPTION_CREATED without action (log only)', async () => {
      const payload: AsaasWebhookPayload = {
        event: 'SUBSCRIPTION_CREATED',
        payment: null,
        subscription: { id: 'sub_456', status: 'ACTIVE' }
      }

      const result = await service.handleEvent(payload)

      expect(result).toEqual({ processed: true })
    })

    it('should handle unknown event gracefully', async () => {
      const payload = {
        event: 'UNKNOWN_EVENT',
        payment: { id: 'pay_1', subscription: 'sub_1', value: 100 },
        subscription: null
      } as unknown as AsaasWebhookPayload

      const result = await service.handleEvent(payload)

      expect(result).toEqual({ processed: true })
    })
  })
})
