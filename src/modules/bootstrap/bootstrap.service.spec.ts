import { BootstrapService } from './bootstrap.service'
import type { TenantRegistrationRepository } from './bootstrap.repository'
import type { PrismaService } from '@shared/prisma/prisma.service'
import type { SubscriptionService } from '@billing/subscription.service'
import type { SubscriptionRepository } from '@billing/subscription.repository'
import type { PlanService } from '@billing/plan.service'
import type { PasswordHasher } from '@authentication/password.hasher.service'
import type { TenantSiteRepository } from '@tenant-sites/tenant-site.repository'
import type { IdentityRepository } from '@identities/identity.repository'
import type { ConfigService } from '@nestjs/config'
import type { AuditLogService } from '@audit-logs/audit-log.service'
import type { TenantRepository } from '@tenants/tenant.repository'
import type { UserRepository } from '@users/user.repository'
import type { SessionService } from '@authentication/session.service'
import type { SubscriptionProvider } from '@billing/subscription-provider.interface'
import { PlanType, RegistrationState } from '@shared/enums'
import { TokenService } from '@authentication/token.service'
import type { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { BootstrapRegisterDto } from './bootstrap.dto'
import { Plan } from '@billing/plan.entity'

import type { Subscription } from '@billing/subscription.entity'
import { Id } from '@shared/value-objects'
import { TenantRegistration } from './bootstrap.entity'
import crypto from 'crypto'

// Mock TokenService.generateToken to return known values
jest.mock('@authentication/token.service', () => ({
  TokenService: {
    generateToken: jest.fn()
  }
}))

describe('BootstrapService.registerFreePlan', () => {
  let service: BootstrapService
  let registrationRepo: any
  let prisma: any
  let subscriptionService: any
  let subscriptionRepository: any
  let planService: any
  let passwordHasher: any
  let tenantSiteRepo: any
  let identityRepository: any
  let configService: any
  let auditLogService: any
  let tenantRepository: any
  let userRepository: any
  let sessionService: any
  let subscriptionProvider: any

  const platformCtx: RequestContext = {
    userId: 'system',
    scope: UserScope.PLATFORM,
    roles: [],
    impersonatedTenantId: null
  }

  beforeEach(() => {
    // Mock TokenService.generateToken to return a known handoff token
    const mockGenerateToken = TokenService.generateToken as jest.Mock
    mockGenerateToken.mockReturnValue({
      raw: 'handoff-token-123',
      hash: 'hashed-handoff-token-123'
    })

    registrationRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByExternalRef: jest.fn(),
      findBySubscriptionId: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn()
    }

    prisma = {
      $transaction: jest.fn((fn: any) => fn(prisma)),
      user: {
        create: jest.fn(),
        findUnique: jest.fn()
      },
      tenant: {
        create: jest.fn(),
        findUnique: jest.fn()
      },
      tenantMembership: { create: jest.fn() },
      memberProfile: { create: jest.fn() },
      identity: { create: jest.fn() },
      tenantSite: { create: jest.fn() },
      tenantRegistration: {
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn()
      },
      address: { create: jest.fn() },
      phone: { create: jest.fn() }
    }

    subscriptionService = {
      createSubscriptionForOnboarding: jest.fn(),
      finalizeOnboardingSubscription: jest.fn(),
      getCurrentSubscription: jest.fn(),
      getUsageCounts: jest.fn(),
      pauseSubscription: jest.fn(),
      resumeSubscription: jest.fn(),
      cancelSubscription: jest.fn(),
      changePlan: jest.fn(),
      addUserAndRecalculate: jest.fn(),
      applyGracePeriod: jest.fn(),
      checkGracePeriodExpiry: jest.fn(),
      handlePaymentFailure: jest.fn(),
      handlePaymentSuccess: jest.fn(),
      processWebhook: jest.fn(),
      getEvents: jest.fn(),
      applyPendingPlanChange: jest.fn(),
      applyAllDuePendingChanges: jest.fn()
    }

    subscriptionRepository = {
      findByTenantId: jest.fn(),
      findById: jest.fn(),
      findByProviderSubscriptionId: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    }

    const freePlan = Plan.rehydrate({
      id: Id.generate(),
      type: PlanType.FREE,
      name: 'Free',
      description: 'Free plan',
      basePrice: 0,
      currency: 'BRL',
      includedUsers: 1,
      additionalUserPrice: null,
      maxProducts: 5,
      maxRevisions: 5,
      features: [],
      isPublic: true,
      isActive: true,
      allowsAdditionalUsers: false,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    planService = {
      getByType: jest.fn().mockResolvedValue(freePlan),
      applyPriceSnapshot: jest.fn().mockReturnValue({
        basePrice: 0,
        additionalUserPrice: null,
        includedUsers: 1,
        additionalUsers: 0,
        totalAdditionalCost: 0,
        totalPrice: 0
      }),
      getPublicPlans: jest.fn(),
      calculatePrice: jest.fn(),
      recalculateWithAdditionalUsers: jest.fn(),
      seedInitialPlans: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    }

    passwordHasher = {
      hash: jest.fn().mockResolvedValue('hashed-password')
    }

    tenantSiteRepo = {
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    }

    identityRepository = {
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    }

    configService = {
      get: jest.fn()
    }

    auditLogService = {
      create: jest.fn().mockResolvedValue(undefined),
      findAll: jest.fn(),
      findById: jest.fn()
    }

    tenantRepository = {
      findBySlug: jest.fn().mockResolvedValue(null),
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    }

    userRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    }

    sessionService = {
      createSession: jest.fn().mockResolvedValue(undefined),
      revokeSession: jest.fn(),
      refreshSession: jest.fn(),
      validateSession: jest.fn()
    }

    subscriptionProvider = {
      name: 'fake',
      createSubscription: jest.fn(),
      updateSubscription: jest.fn(),
      cancelSubscription: jest.fn(),
      pauseSubscription: jest.fn(),
      resumeSubscription: jest.fn(),
      getSubscription: jest.fn(),
      validateWebhookSignature: jest.fn()
    }

    const asaasApiService = {
      createCustomer: jest.fn(),
      createSubscription: jest.fn(),
      updateSubscription: jest.fn(),
      cancelSubscription: jest.fn(),
      getSubscription: jest.fn(),
      getPayment: jest.fn(),
      listPaymentsBySubscription: jest.fn()
    } as any

    service = new BootstrapService(
      registrationRepo,
      prisma,
      subscriptionService,
      subscriptionRepository,
      planService,
      passwordHasher,
      tenantSiteRepo,
      identityRepository,
      configService,
      auditLogService,
      tenantRepository,
      userRepository,
      sessionService,
      subscriptionProvider,
      asaasApiService
    )

    // Mock crypto.randomUUID for deterministic IDs
    jest
      .spyOn(crypto, 'randomUUID')
      .mockReturnValue('mock-uuid-12345678-1234-1234-1234-123456789012')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  function createFreeRegisterDto(): BootstrapRegisterDto {
    const dto = new BootstrapRegisterDto()
    dto.tenantName = 'Test Tenant'
    dto.tenantSiteName = 'Test Site'
    dto.tenantSiteLegalName = 'Test Legal LTDA'
    dto.tenantSiteTaxId = '12345678901234'
    dto.fullName = 'Test User'
    dto.email = 'test@example.com'
    dto.password = 'StrongP@ss123'
    dto.planType = PlanType.FREE
    return dto
  }

  function createPaidRegisterDto(): BootstrapRegisterDto {
    const dto = new BootstrapRegisterDto()
    dto.tenantName = 'Test Tenant Paid'
    dto.tenantSiteName = 'Test Site Paid'
    dto.tenantSiteLegalName = 'Test Legal Paid LTDA'
    dto.tenantSiteTaxId = '98765432109876'
    dto.fullName = 'Test User Paid'
    dto.email = 'test-paid@example.com'
    dto.password = 'StrongP@ss123'
    dto.planType = PlanType.BASIC
    return dto
  }

  // ============== FREE plan tests ==============

  describe('register() with FREE plan', () => {
    it('should return checkoutUrl: null for FREE plan', async () => {
      const dto = createFreeRegisterDto()

      const result = await service.register(dto, null, null)

      expect(result.checkoutUrl).toBeNull()
    })

    it('should generate a handoff token', async () => {
      const dto = createFreeRegisterDto()

      const result = await service.register(dto, null, null)

      expect(result.handoffToken).toBe('handoff-token-123')
    })

    it('should create subscription with provider: free', async () => {
      const dto = createFreeRegisterDto()

      await service.register(dto, null, null)

      // subscriptionRepository.save should be called with Subscription having provider='free'
      expect(subscriptionRepository.save).toHaveBeenCalled()
      const savedSub = (subscriptionRepository.save as jest.Mock).mock
        .calls[0][0] as Subscription
      expect(savedSub.provider).toBe('free')
      expect(savedSub.planType).toBe(PlanType.FREE)
    })

    it('should mark registration as PROVISIONED', async () => {
      const dto = createFreeRegisterDto()

      await service.register(dto, null, null)

      // Registration should be saved with PROVISIONED state
      expect(registrationRepo.save).toHaveBeenCalled()
      const savedRegistration = (registrationRepo.save as jest.Mock).mock
        .calls[0][0] as TenantRegistration
      expect(savedRegistration.state).toBe(RegistrationState.PROVISIONED)
    })
  })

  // ============== PAID plan tests ==============

  describe('register() with PAID plan', () => {
    it('should create provider subscription for PAID plan', async () => {
      const dto = createPaidRegisterDto()

      subscriptionService.createSubscriptionForOnboarding.mockResolvedValue({
        providerResult: {
          providerSubscriptionId: 'prov-123',
          providerCustomerId: null,
          paymentUrl: 'http://example.com/pay',
          status: 'PENDING' as any
        },
        priceSnapshot: {
          basePrice: 9990,
          additionalUserPrice: 5000,
          includedUsers: 1,
          additionalUsers: 0,
          totalAdditionalCost: 0,
          totalPrice: 9990
        },
        plan: Plan.rehydrate({
          id: Id.generate(),
          type: PlanType.BASIC,
          name: 'Basic',
          description: 'Basic plan',
          basePrice: 9990,
          currency: 'BRL',
          includedUsers: 1,
          additionalUserPrice: 5000,
          maxProducts: 20,
          maxRevisions: null,
          features: [],
          isPublic: true,
          isActive: true,
          allowsAdditionalUsers: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      })

      // Mock planService.getByType to return BASIC plan
      configService.get.mockReturnValue('http://localhost:3000')
      planService.getByType.mockResolvedValue(
        Plan.rehydrate({
          id: Id.generate(),
          type: PlanType.BASIC,
          name: 'Basic',
          description: 'Basic plan',
          basePrice: 9990,
          currency: 'BRL',
          includedUsers: 1,
          additionalUserPrice: 5000,
          maxProducts: 20,
          maxRevisions: null,
          features: [],
          isPublic: true,
          isActive: true,
          allowsAdditionalUsers: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      )

      const result = await service.register(dto, null, null)

      expect(result.checkoutUrl).toBe('http://example.com/pay')
      expect(
        subscriptionService.createSubscriptionForOnboarding
      ).toHaveBeenCalledWith(
        PlanType.BASIC,
        'test-paid@example.com',
        'Test User Paid',
        `Plano ${PlanType.BASIC}`,
        expect.any(String),
        expect.any(String),
        expect.any(String),
        null
      )
    })

    it('should NOT provision entities for PAID plan (goes through payment)', async () => {
      const dto = createPaidRegisterDto()

      subscriptionService.createSubscriptionForOnboarding.mockResolvedValue({
        providerResult: {
          providerSubscriptionId: 'prov-123',
          providerCustomerId: null,
          paymentUrl: 'http://example.com/pay',
          status: 'PENDING' as any
        },
        priceSnapshot: {
          basePrice: 9990,
          additionalUserPrice: 5000,
          includedUsers: 1,
          additionalUsers: 0,
          totalAdditionalCost: 0,
          totalPrice: 9990
        },
        plan: Plan.rehydrate({
          id: Id.generate(),
          type: PlanType.BASIC,
          name: 'Basic',
          description: 'Basic plan',
          basePrice: 9990,
          currency: 'BRL',
          includedUsers: 1,
          additionalUserPrice: 5000,
          maxProducts: 20,
          maxRevisions: null,
          features: [],
          isPublic: true,
          isActive: true,
          allowsAdditionalUsers: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      })
      configService.get.mockReturnValue('http://localhost:3000')

      await service.register(dto, null, null)

      // subscriptionRepository.save should NOT be called for PAID plan
      // (it gets created by finalizeOnboardingSubscription after payment)
      expect(subscriptionRepository.save).not.toHaveBeenCalled()
    })
  })

  // ============== Address/Phone JSON blobs in register() ==============

  describe('register() with address/phone DTO fields', () => {
    function createDtoWithAddress(): BootstrapRegisterDto {
      const dto = createFreeRegisterDto()
      dto.addressStreet = 'Nove de Julho'
      dto.addressStreetType = 'Rua'
      dto.addressNumber = '123'
      dto.addressComplement = 'Apto 42'
      dto.addressDistrict = 'Centro'
      dto.addressCity = 'São Paulo'
      dto.addressState = 'SP'
      dto.addressPostalCode = '01310-000'
      dto.addressCountry = 'BR'
      dto.phoneCountryCode = '55'
      dto.phoneNumber = '11999998888'
      dto.phoneExtension = '200'
      dto.phoneIsWhatsapp = true
      return dto
    }

    it('should store address/phone JSON blobs when DTO has address/phone fields', async () => {
      const dto = createDtoWithAddress()

      await service.register(dto, null, null)

      // The first save should have addressData and phoneData set
      expect(registrationRepo.save).toHaveBeenCalled()
      const firstSaveCall = (registrationRepo.save as jest.Mock).mock.calls[0][0] as TenantRegistration
      expect(firstSaveCall.addressData).not.toBeNull()
      expect(firstSaveCall.phoneData).not.toBeNull()
      if (firstSaveCall.addressData) {
        const addr = firstSaveCall.addressData as Record<string, unknown>
        expect(addr.street).toBe('Nove de Julho')
        expect(addr.city).toBe('São Paulo')
      }
      if (firstSaveCall.phoneData) {
        const ph = firstSaveCall.phoneData as Record<string, unknown>
        expect(ph.number).toBe('11999998888')
      }
    })

    it('should store null addressData/phoneData when DTO has no address/phone', async () => {
      const dto = createFreeRegisterDto()

      await service.register(dto, null, null)

      expect(registrationRepo.save).toHaveBeenCalled()
      const firstSaveCall = (registrationRepo.save as jest.Mock).mock.calls[0][0] as TenantRegistration
      expect(firstSaveCall.addressData).toBeNull()
      expect(firstSaveCall.phoneData).toBeNull()
    })
  })

  // ============== Provisioning with Address/Phone ==============

  describe('provisionRegistration()', () => {
    function createRegistrationWithAddress(): TenantRegistration {
      const now = new Date()
      return TenantRegistration.create({
        externalRef: 'ref-1',
        state: RegistrationState.PENDING,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        handoffTokenHash: 'hash',
        handoffTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
        handoffTokenUsedAt: null,
        paymentId: null,
        subscriptionId: null,
        providerCustomerId: null,
        tenantData: { name: 'Test', locale: 'pt-BR', timezone: 'America/Sao_Paulo', language: 'pt', planType: PlanType.FREE },
        tenantSiteData: { name: 'Site', legalName: 'Legal', taxId: '123', siteType: 'FACTORY', isHeadquarters: true },
        userData: { scope: 'TENANT' },
        identityData: { provider: 'EMAIL', identifier: 'test@test.com', secretHash: 'hash' },
        profileData: { fullName: 'User', displayName: null, dateOfBirth: null, gender: null, photoUrl: null },
        addressData: {
          street: 'Nove de Julho',
          streetType: 'Rua',
          number: '123',
          complement: null,
          district: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          postalCode: '01310-000',
          country: 'BR'
        },
        phoneData: {
          countryCode: '55',
          number: '11999998888',
          extension: null,
          isWhatsapp: true
        },
        provisionedUserId: null,
        provisionedTenantId: null,
        provisionedMembershipId: null,
        provisionedProfileId: null,
        provisionedIdentityId: null,
        provisionedTenantSiteId: null,
        provisionedAddressId: null,
        provisionedPhoneId: null,
        paymentStatus: null,
        paymentStatusDetail: null,
        webhookProcessedAt: null,
        approvedAt: null,
        provisionedAt: null,
        rejectedAt: null,
        expiredAt: null
      })
    }

    function createRegistrationWithoutAddress(): TenantRegistration {
      const reg = createRegistrationWithAddress()
      // Override to have null address/phone data
      const nullReg = TenantRegistration.create({
        externalRef: 'ref-2',
        state: RegistrationState.PENDING,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        handoffTokenHash: 'hash2',
        handoffTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
        handoffTokenUsedAt: null,
        paymentId: null,
        subscriptionId: null,
        providerCustomerId: null,
        tenantData: { name: 'Test', locale: 'pt-BR', timezone: 'America/Sao_Paulo', language: 'pt', planType: PlanType.FREE },
        tenantSiteData: { name: 'Site', legalName: 'Legal', taxId: '123', siteType: 'FACTORY', isHeadquarters: true },
        userData: { scope: 'TENANT' },
        identityData: { provider: 'EMAIL', identifier: 'test@test.com', secretHash: 'hash' },
        profileData: { fullName: 'User', displayName: null, dateOfBirth: null, gender: null, photoUrl: null },
        addressData: null,
        phoneData: null,
        provisionedUserId: null,
        provisionedTenantId: null,
        provisionedMembershipId: null,
        provisionedProfileId: null,
        provisionedIdentityId: null,
        provisionedTenantSiteId: null,
        provisionedAddressId: null,
        provisionedPhoneId: null,
        paymentStatus: null,
        paymentStatusDetail: null,
        webhookProcessedAt: null,
        approvedAt: null,
        provisionedAt: null,
        rejectedAt: null,
        expiredAt: null
      })
      return nullReg
    }

    it('should create Address entity when addressData is present', async () => {
      const registration = createRegistrationWithAddress()
      prisma.user.findUnique.mockResolvedValue(null)
      prisma.tenant.findUnique.mockResolvedValue(null)

      await service.provisionRegistration(registration, platformCtx)

      const mockUuid = 'mock-uuid-12345678-1234-1234-1234-123456789012'
      expect(prisma.address.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ownerId: mockUuid,
            ownerType: 'TenantSite',
            tenantId: mockUuid,
            type: 'BILLING',
            street: 'Nove de Julho',
            streetType: 'Rua',
            number: '123'
          })
        })
      )
    })

    it('should create Phone entity when phoneData is present', async () => {
      const registration = createRegistrationWithAddress()
      prisma.user.findUnique.mockResolvedValue(null)
      prisma.tenant.findUnique.mockResolvedValue(null)

      await service.provisionRegistration(registration, platformCtx)

      const mockUuid = 'mock-uuid-12345678-1234-1234-1234-123456789012'
      expect(prisma.phone.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ownerId: mockUuid,
            ownerType: 'TenantSite',
            tenantId: mockUuid,
            type: 'WHATSAPP',
            number: '11999998888',
            countryCode: '55'
          })
        })
      )
    })

    it('should use OwnerType.TENANT_SITE for created Address and Phone', async () => {
      const registration = createRegistrationWithAddress()
      prisma.user.findUnique.mockResolvedValue(null)
      prisma.tenant.findUnique.mockResolvedValue(null)

      await service.provisionRegistration(registration, platformCtx)

      expect(prisma.address.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ownerType: 'TenantSite'
          })
        })
      )
      expect(prisma.phone.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ownerType: 'TenantSite'
          })
        })
      )
    })

    it('should NOT create Address when addressData is null', async () => {
      const registration = createRegistrationWithoutAddress()
      prisma.user.findUnique.mockResolvedValue(null)
      prisma.tenant.findUnique.mockResolvedValue(null)

      await service.provisionRegistration(registration, platformCtx)

      expect(prisma.address.create).not.toHaveBeenCalled()
    })

    it('should NOT create Phone when phoneData is null', async () => {
      const registration = createRegistrationWithoutAddress()
      prisma.user.findUnique.mockResolvedValue(null)
      prisma.tenant.findUnique.mockResolvedValue(null)

      await service.provisionRegistration(registration, platformCtx)

      expect(prisma.phone.create).not.toHaveBeenCalled()
    })

    it('should return provisionedAddressId and provisionedPhoneId in result', async () => {
      const registration = createRegistrationWithAddress()
      prisma.user.findUnique.mockResolvedValue(null)
      prisma.tenant.findUnique.mockResolvedValue(null)

      const result = await service.provisionRegistration(registration, platformCtx)

      expect(result.addressId).not.toBeNull()
      expect(result.phoneId).not.toBeNull()
    })

    it('should return null addressId and phoneId when no address/phone data', async () => {
      const registration = createRegistrationWithoutAddress()
      prisma.user.findUnique.mockResolvedValue(null)
      prisma.tenant.findUnique.mockResolvedValue(null)

      const result = await service.provisionRegistration(registration, platformCtx)

      expect(result.addressId).toBeNull()
      expect(result.phoneId).toBeNull()
    })
  })
})
