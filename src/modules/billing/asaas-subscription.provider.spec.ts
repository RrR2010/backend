import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  AsaasSubscriptionProvider,
  mapAsaasStatus
} from './asaas-subscription.provider'
import { AsaasApiService } from './asaas-api.service'
import { SubscriptionStatus } from '@shared/enums'
import type {
  CreateSubscriptionInput,
  UpdateSubscriptionInput
} from '@billing/subscription-provider.types'

describe('mapAsaasStatus', () => {
  it('should return ACTIVE for ACTIVE', () => {
    expect(mapAsaasStatus('ACTIVE')).toBe(SubscriptionStatus.ACTIVE)
  })

  it('should return PAUSED for INACTIVE', () => {
    expect(mapAsaasStatus('INACTIVE')).toBe(SubscriptionStatus.PAUSED)
  })

  it('should return EXPIRED for EXPIRED', () => {
    expect(mapAsaasStatus('EXPIRED')).toBe(SubscriptionStatus.EXPIRED)
  })

  it('should return ACTIVE fallback for unknown status', () => {
    expect(mapAsaasStatus('UNKNOWN')).toBe(SubscriptionStatus.ACTIVE)
  })

  it('should return ACTIVE fallback for undefined', () => {
    expect(mapAsaasStatus(undefined)).toBe(SubscriptionStatus.ACTIVE)
  })
})

describe('AsaasSubscriptionProvider', () => {
  let provider: AsaasSubscriptionProvider
  let asaasApiService: jest.Mocked<AsaasApiService>
  let configService: jest.Mocked<ConfigService>

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation()
    jest.spyOn(Logger.prototype, 'warn').mockImplementation()
    jest.spyOn(Logger.prototype, 'error').mockImplementation()

    asaasApiService = {
      createCustomer: jest.fn(),
      createSubscription: jest.fn(),
      updateSubscription: jest.fn(),
      cancelSubscription: jest.fn(),
      getSubscription: jest.fn(),
      getPayment: jest.fn(),
      listPaymentsBySubscription: jest.fn()
    } as unknown as jest.Mocked<AsaasApiService>

    configService = {
      get: jest.fn()
    } as unknown as jest.Mocked<ConfigService>
    configService.get.mockImplementation(
      (key: string, defaultValue?: unknown) => {
        if (key === 'ASAAS_WEBHOOK_AUTH_TOKEN') return 'test-webhook-token'
        if (key === 'ASAAS_ENV') return 'sandbox'
        return defaultValue
      }
    )

    provider = new AsaasSubscriptionProvider(asaasApiService, configService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // ===================== createSubscription =====================

  describe('createSubscription', () => {
    const baseInput: CreateSubscriptionInput = {
      tenantId: 'tenant-1',
      planType: 'BASIC' as any,
      amount: 5990,
      currency: 'BRL',
      payerEmail: 'john@example.com',
      payerName: 'John Doe',
      reason: 'Plano BASIC',
      externalRef: 'ref-123',
      backUrlSuccess: 'http://localhost:3000/success?ref=ref-123',
      backUrlFailure: 'http://localhost:3000/failure',
      providerCustomerId: 'cus_123'
    }

    it('should call asaasApiService.createSubscription with correct params and return mapped result', async () => {
      asaasApiService.createSubscription.mockResolvedValue({
        id: 'sub_456',
        status: 'ACTIVE',
        dateCreated: '2026-06-09',
        nextDueDate: '2026-06-10',
        value: 59.9,
        cycle: 'MONTHLY',
        billingType: 'UNDEFINED',
        customer: 'cus_123',
        paymentLink: null,
        checkoutSession: 'sess_abc'
      })

      const result = await provider.createSubscription(baseInput)

      // Verify the API was called with correct params
      expect(asaasApiService.createSubscription).toHaveBeenCalledWith({
        customer: 'cus_123',
        billingType: 'UNDEFINED',
        value: 59.9, // 5990 / 100
        nextDueDate: expect.any(String), // tomorrow's date
        cycle: 'MONTHLY',
        externalReference: 'ref-123',
        callback: {
          successUrl: 'http://localhost:3000/success?ref=ref-123',
          autoRedirect: true,
          cancelUrl: 'http://localhost:3000/failure'
        }
      })

      // Verify the result mapping
      expect(result).toEqual({
        providerSubscriptionId: 'sub_456',
        providerCustomerId: 'cus_123',
        paymentUrl: 'https://sandbox.asaas.com/checkoutSession/show/sess_abc',
        status: SubscriptionStatus.ACTIVE
      })
    })

    it('should throw when providerCustomerId is null', async () => {
      const input = { ...baseInput, providerCustomerId: null }

      await expect(provider.createSubscription(input)).rejects.toThrow(
        'AsaasSubscriptionProvider.createSubscription requires providerCustomerId'
      )

      expect(asaasApiService.createSubscription).not.toHaveBeenCalled()
    })

    it('should use paymentLink when checkoutSession is null', async () => {
      asaasApiService.createSubscription.mockResolvedValue({
        id: 'sub_456',
        status: 'ACTIVE',
        dateCreated: '2026-06-09',
        nextDueDate: '2026-06-10',
        value: 59.9,
        cycle: 'MONTHLY',
        billingType: 'UNDEFINED',
        customer: 'cus_123',
        paymentLink: 'https://pay.asaas.com/link_abc',
        checkoutSession: null
      })

      const result = await provider.createSubscription(baseInput)

      expect(result.paymentUrl).toBe('https://pay.asaas.com/link_abc')
    })

    it('should use production URL when ASAAS_ENV is production', async () => {
      configService.get.mockImplementation(
        (key: string, defaultValue?: unknown) => {
          if (key === 'ASAAS_WEBHOOK_AUTH_TOKEN') return 'test-webhook-token'
          if (key === 'ASAAS_ENV') return 'production'
          return defaultValue
        }
      )
      provider = new AsaasSubscriptionProvider(asaasApiService, configService)

      asaasApiService.createSubscription.mockResolvedValue({
        id: 'sub_456',
        status: 'ACTIVE',
        dateCreated: '2026-06-09',
        nextDueDate: '2026-06-10',
        value: 59.9,
        cycle: 'MONTHLY',
        billingType: 'UNDEFINED',
        customer: 'cus_123',
        paymentLink: null,
        checkoutSession: 'sess_abc'
      })

      const result = await provider.createSubscription(baseInput)

      expect(result.paymentUrl).toBe(
        'https://www.asaas.com/checkoutSession/show/sess_abc'
      )
    })
  })

  // ===================== cancelSubscription =====================

  describe('cancelSubscription', () => {
    it('should call asaasApiService.cancelSubscription when cancelAtPeriodEnd is false', async () => {
      asaasApiService.cancelSubscription.mockResolvedValue(undefined)

      await provider.cancelSubscription('sub_456', false)

      expect(asaasApiService.cancelSubscription).toHaveBeenCalledWith('sub_456')
    })

    it('should NOT call API when cancelAtPeriodEnd is true (local only)', async () => {
      await provider.cancelSubscription('sub_456', true)

      expect(asaasApiService.cancelSubscription).not.toHaveBeenCalled()
    })
  })

  // ===================== pauseSubscription =====================

  describe('pauseSubscription', () => {
    it('should update subscription status to INACTIVE', async () => {
      asaasApiService.updateSubscription.mockResolvedValue(undefined)

      await provider.pauseSubscription('sub_456')

      expect(asaasApiService.updateSubscription).toHaveBeenCalledWith(
        'sub_456',
        { status: 'INACTIVE' }
      )
    })
  })

  // ===================== resumeSubscription =====================

  describe('resumeSubscription', () => {
    it('should update subscription status to ACTIVE', async () => {
      asaasApiService.updateSubscription.mockResolvedValue(undefined)

      await provider.resumeSubscription('sub_456')

      expect(asaasApiService.updateSubscription).toHaveBeenCalledWith(
        'sub_456',
        { status: 'ACTIVE' }
      )
    })
  })

  // ===================== updateSubscription =====================

  describe('updateSubscription', () => {
    const input: UpdateSubscriptionInput = {
      providerSubscriptionId: 'sub_456',
      amount: 7990,
      currency: 'BRL',
      reason: 'Plan upgrade'
    }

    it('should call asaasApiService.updateSubscription with correct params', async () => {
      asaasApiService.updateSubscription.mockResolvedValue(undefined)

      await provider.updateSubscription(input)

      expect(asaasApiService.updateSubscription).toHaveBeenCalledWith(
        'sub_456',
        { value: 79.9 } // 7990 / 100
      )
    })
  })

  // ===================== getSubscription =====================

  describe('getSubscription', () => {
    it('should return ProviderSubscriptionSnapshot with ACTIVE status', async () => {
      asaasApiService.getSubscription.mockResolvedValue({
        id: 'sub_456',
        customer: 'cus_123',
        status: 'ACTIVE',
        value: 59.9,
        nextDueDate: '2026-07-10',
        cycle: 'MONTHLY',
        billingType: 'UNDEFINED',
        deleted: false
      })

      const result = await provider.getSubscription('sub_456')

      expect(result.providerSubscriptionId).toBe('sub_456')
      expect(result.status).toBe(SubscriptionStatus.ACTIVE)
      expect(result.amount).toBe(5990) // 59.9 * 100
      expect(result.paused).toBe(false)
      expect(result.currency).toBe('BRL')
      expect(result.cancelAtPeriodEnd).toBe(false)
      expect(result.lastError).toBeNull()
      expect(result.currentPeriodEnd).toBeInstanceOf(Date)
      expect(result.raw).toBeDefined()
    })

    it('should map INACTIVE to PAUSED', async () => {
      asaasApiService.getSubscription.mockResolvedValue({
        id: 'sub_456',
        customer: 'cus_123',
        status: 'INACTIVE',
        value: 59.9,
        nextDueDate: '2026-07-10',
        cycle: 'MONTHLY',
        billingType: 'UNDEFINED',
        deleted: false
      })

      const result = await provider.getSubscription('sub_456')

      expect(result.status).toBe(SubscriptionStatus.PAUSED)
      expect(result.paused).toBe(true)
    })

    it('should map EXPIRED to EXPIRED', async () => {
      asaasApiService.getSubscription.mockResolvedValue({
        id: 'sub_456',
        customer: 'cus_123',
        status: 'EXPIRED',
        value: 59.9,
        nextDueDate: '2026-06-10',
        cycle: 'MONTHLY',
        billingType: 'UNDEFINED',
        deleted: false
      })

      const result = await provider.getSubscription('sub_456')

      expect(result.status).toBe(SubscriptionStatus.EXPIRED)
      expect(result.paused).toBe(false)
    })

    it('should default unknown status to ACTIVE', async () => {
      asaasApiService.getSubscription.mockResolvedValue({
        id: 'sub_456',
        customer: 'cus_123',
        status: 'SOME_UNKNOWN_STATUS',
        value: 59.9,
        nextDueDate: '2026-07-10',
        cycle: 'MONTHLY',
        billingType: 'UNDEFINED',
        deleted: false
      })

      const result = await provider.getSubscription('sub_456')

      expect(result.status).toBe(SubscriptionStatus.ACTIVE)
      expect(result.paused).toBe(false)
    })

    it('should set currentPeriodEnd from nextDueDate', async () => {
      asaasApiService.getSubscription.mockResolvedValue({
        id: 'sub_456',
        customer: 'cus_123',
        status: 'ACTIVE',
        value: 59.9,
        nextDueDate: '2026-07-10',
        cycle: 'MONTHLY',
        billingType: 'UNDEFINED',
        deleted: false
      })

      const result = await provider.getSubscription('sub_456')

      expect(result.currentPeriodEnd).toBeInstanceOf(Date)
      expect(result.currentPeriodEnd!.toISOString()).toContain('2026-07-10')
    })
  })

  // ===================== validateWebhookSignature =====================

  describe('validateWebhookSignature', () => {
    it('should return true for valid token', () => {
      const headers: Record<string, string> = {
        'asaas-access-token': 'test-webhook-token'
      }

      const result = provider.validateWebhookSignature(headers, {})

      expect(result).toBe(true)
    })

    it('should return false for invalid token', () => {
      const headers: Record<string, string> = {
        'asaas-access-token': 'wrong-token'
      }

      const result = provider.validateWebhookSignature(headers, {})

      expect(result).toBe(false)
    })

    it('should return false when token header is missing', () => {
      const result = provider.validateWebhookSignature({}, {})

      expect(result).toBe(false)
    })

    it('should return false when webhook auth token is not configured', () => {
      // Re-create provider with empty webhook token
      configService.get.mockImplementation(
        (key: string, defaultValue?: unknown) => {
          if (key === 'ASAAS_WEBHOOK_AUTH_TOKEN') return ''
          if (key === 'ASAAS_ENV') return 'sandbox'
          return defaultValue
        }
      )
      provider = new AsaasSubscriptionProvider(asaasApiService, configService)

      const headers: Record<string, string> = {
        'asaas-access-token': 'anything'
      }

      const result = provider.validateWebhookSignature(headers, {})

      expect(result).toBe(false)
    })
  })
})
