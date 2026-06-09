import { Injectable, Logger, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope, TenantRole } from '@users/user.types'
import {
  TenantRegistrationRepository,
  TenantRegistrationMapper
} from '@bootstrap/bootstrap.repository'
import crypto from 'crypto'
import {
  BootstrapRegisterDto,
  ClaimSessionDto,
  ClaimSessionResponseDto,
  BootstrapStatusResponseDto
} from '@bootstrap/bootstrap.dto'
import { TenantRegistration } from '@bootstrap/bootstrap.entity'
import {
  DuplicateEmailError,
  DuplicateTaxIdError,
  RegistrationNotFoundError,
  InvalidRegistrationStateError,
  InvalidHandoffTokenError,
  ProvisionedEntityNotFoundError
} from '@bootstrap/bootstrap.errors'
import {
  BootstrapRegisterResult,
  ProvisioningResult
} from '@bootstrap/bootstrap.types'
import { BOOTSTRAP_AUDIT_ACTIONS } from '@bootstrap/bootstrap.constants'
import { PasswordHasher } from '@authentication/password.hasher.service'
import { TokenService } from '@authentication/token.service'
import { SessionService } from '@authentication/session.service'
import { TenantSiteRepository } from '@tenant-sites/tenant-site.repository'
import { IdentityRepository } from '@identities/identity.repository'
import { AuthProviderType } from '@authentication/authentication.types'
import {
  RegistrationState,
  TenantSiteType,
  Gender,
  PlanType,
  SubscriptionStatus
} from '@shared/enums'
import { SystemState } from '@shared/behaviours/lockable'
import { AuditLogService } from '@audit-logs/audit-log.service'
import { PrismaService } from '@shared/prisma/prisma.service'
import { TenantRepository } from '@tenants/tenant.repository'
import { UserRepository } from '@users/user.repository'
import { Prisma } from '@prisma/client'
import type { Request, Response } from 'express'
import { SubscriptionService } from '@billing/subscription.service'
import { SubscriptionRepository } from '@billing/subscription.repository'
import { PlanService } from '@billing/plan.service'
import { Subscription } from '@billing/subscription.entity'
import type { SubscriptionProvider } from '@billing/subscription-provider.interface'
import { SUBSCRIPTION_PROVIDER_TOKEN } from '@billing/billing.constants'

@Injectable()
export class BootstrapService {
  private readonly logger = new Logger(BootstrapService.name)

  private readonly platformCtx: RequestContext = {
    userId: 'system',
    scope: UserScope.PLATFORM,
    roles: [],
    impersonatedTenantId: null
  }

  constructor(
    private readonly registrationRepo: TenantRegistrationRepository,
    private readonly prismaService: PrismaService,
    private readonly subscriptionService: SubscriptionService,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly planService: PlanService,
    private readonly passwordHasher: PasswordHasher,
    private readonly tenantSiteRepo: TenantSiteRepository,
    private readonly identityRepository: IdentityRepository,
    private readonly configService: ConfigService,
    private readonly auditLogService: AuditLogService,
    private readonly tenantRepository: TenantRepository,
    private readonly userRepository: UserRepository,
    private readonly sessionService: SessionService,
    @Inject(SUBSCRIPTION_PROVIDER_TOKEN)
    private readonly subscriptionProvider: SubscriptionProvider
  ) {}

  async register(
    dto: BootstrapRegisterDto,
    _reqIp: string | null,
    _reqUserAgent: string | null
  ): Promise<BootstrapRegisterResult> {
    // 1. Normalize inputs
    const normalizedEmail = dto.email.toLowerCase().trim()
    const normalizedTaxId = this.normalizeTaxId(dto.tenantSiteTaxId)
    const normalizedTenantName = dto.tenantName.trim()

    // 2. Check duplicates
    await this.checkDuplicateEmail(normalizedEmail)
    await this.checkDuplicateTaxId(normalizedTaxId)

    // 3. Hash password
    const passwordHash = await this.passwordHasher.hash(dto.password)

    // 4. Generate handoff token
    const { raw: handoffToken, hash: handoffTokenHash } =
      TokenService.generateToken()
    const handoffTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 min

    // 5. Build registration data
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 min expiry

    const registration = TenantRegistration.create({
      externalRef: crypto.randomUUID(),
      state: RegistrationState.PENDING,
      expiresAt,
      handoffTokenHash,
      handoffTokenExpiresAt,
      handoffTokenUsedAt: null,
      paymentId: null,
      subscriptionId: null,
      providerCustomerId: null,
      tenantData: {
        name: normalizedTenantName,
        locale: dto.tenantLocale ?? 'pt-BR',
        timezone: dto.tenantTimezone ?? 'America/Sao_Paulo',
        language: dto.tenantLanguage ?? 'pt',
        planType: dto.planType
      },
      tenantSiteData: {
        name: dto.tenantSiteName.trim(),
        legalName: dto.tenantSiteLegalName.trim(),
        taxId: normalizedTaxId,
        siteType: dto.tenantSiteType ?? 'FACTORY',
        isHeadquarters: true
      },
      userData: { scope: 'TENANT' },
      identityData: {
        provider: 'EMAIL',
        identifier: normalizedEmail,
        secretHash: passwordHash
      },
      profileData: {
        fullName: dto.fullName.trim(),
        displayName: dto.displayName?.trim() ?? null,
        dateOfBirth: dto.dateOfBirth
          ? new Date(dto.dateOfBirth).toISOString()
          : null,
        gender: dto.gender ?? null,
        photoUrl: null
      },
      provisionedUserId: null,
      provisionedTenantId: null,
      provisionedMembershipId: null,
      provisionedProfileId: null,
      provisionedIdentityId: null,
      provisionedTenantSiteId: null,
      paymentStatus: null,
      paymentStatusDetail: null,
      webhookProcessedAt: null,
      approvedAt: null,
      provisionedAt: null,
      rejectedAt: null,
      expiredAt: null
    })

    // 6. Save registration
    await this.registrationRepo.save(registration, this.platformCtx)

    // 7. Branch for FREE plan — skip payment provider entirely
    if (dto.planType === PlanType.FREE) {
      return this.registerFreePlan(
        registration,
        handoffToken,
        dto,
        _reqIp,
        _reqUserAgent
      )
    }

    // 8. Create subscription in provider (replaces old payment preference flow)
    // NOTE: This path is only for PAID plans (BASIC, PREMIUM).
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000'
    )

    let onboardingResult: Awaited<
      ReturnType<
        typeof this.subscriptionService.createSubscriptionForOnboarding
      >
    >
    try {
      onboardingResult =
        await this.subscriptionService.createSubscriptionForOnboarding(
          dto.planType,
          normalizedEmail,
          dto.fullName.trim(),
          `Plano ${dto.planType}`,
          registration.id.value,
          `${frontendUrl}/bootstrap/success`,
          `${frontendUrl}/bootstrap/pending`,
          `${frontendUrl}/bootstrap/failure`
        )
    } catch (error) {
      // Mark registration as rejected to prevent orphaned PENDING records
      registration.markRejected()
      await this.registrationRepo.save(registration, this.platformCtx)
      throw error
    }

    // 8. Update registration with provider subscription ID
    registration.updateSubscriptionId(
      onboardingResult.providerResult.providerSubscriptionId
    )
    await this.registrationRepo.save(registration, this.platformCtx)

    // TODO: Add compensating action to cancel provider subscription if registration save fails.
    // If the save above throws, the provider subscription already exists but is not linked
    // to any registration. Log the provider ID for manual cleanup or implement automatic
    // cancellation as a compensating action.
    const providerSubscriptionId =
      onboardingResult.providerResult.providerSubscriptionId
    this.logger.log(`Provider subscription created: ${providerSubscriptionId}`)

    // 9. Audit log
    await this.auditLogService.create(
      {
        userId: 'system',
        tenantId: null,
        entityName: 'TenantRegistration',
        entityId: registration.id.value,
        ipAddress: _reqIp,
        userAgent: _reqUserAgent,
        action: BOOTSTRAP_AUDIT_ACTIONS.REGISTRATION_CREATED,
        before: null,
        after: {
          externalRef: registration.externalRef,
          email: normalizedEmail,
          taxId: normalizedTaxId,
          tenantName: normalizedTenantName,
          planType: dto.planType
        },
        description: null
      },
      this.platformCtx
    )

    await this.auditLogService.create(
      {
        userId: 'system',
        tenantId: null,
        entityName: 'TenantRegistration',
        entityId: registration.id.value,
        ipAddress: null,
        userAgent: null,
        action: BOOTSTRAP_AUDIT_ACTIONS.SUBSCRIPTION_CREATED,
        before: null,

        after: {
          state: RegistrationState.PENDING,
          providerSubscriptionId: 'pending'
        },
        description: null
      },
      this.platformCtx
    )

    // 10. Return result
    // Use paymentUrl directly from provider result (no environment-based branching needed)
    const paymentUrl = onboardingResult.providerResult.paymentUrl

    if (!paymentUrl) {
      throw new Error('Subscription provider returned no checkout URL')
    }

    return {
      registrationId: registration.id.value,
      paymentUrl,
      expiresAt: registration.expiresAt,
      handoffToken,
      subscriptionId: onboardingResult.providerResult.providerSubscriptionId
    }
  }

  /**
   * Registers a FREE plan tenant without involving the payment provider.
   * Provisions all entities immediately and returns a result with no payment URL.
   */
  private async registerFreePlan(
    registration: TenantRegistration,
    handoffToken: string,
    dto: BootstrapRegisterDto,
    _reqIp: string | null,
    _reqUserAgent: string | null
  ): Promise<BootstrapRegisterResult> {
    this.logger.log(
      `Registering FREE plan for registration ${registration.id.value}`
    )

    // Step 1: Provision all tenant entities
    const provisioningResult = await this.provisionRegistration(
      registration,
      this.platformCtx
    )

    // Step 2: Create local subscription directly (no provider call for FREE plan)
    // We bypass finalizeOnboardingSubscription because it uses the payment provider
    // name. FREE plans have no provider, so we set provider='free' explicitly.
    const plan = await this.planService.getByType(PlanType.FREE, this.platformCtx)
    const priceSnapshot = this.planService.applyPriceSnapshot(plan, 0)
    const now = new Date()
    const syntheticProviderId = `free-${registration.id.value}`

    const subscription = Subscription.create({
      tenantId: provisioningResult.tenantId,
      planType: PlanType.FREE,
      status: SubscriptionStatus.ACTIVE,
      currency: 'BRL',
      provider: 'free',
      providerSubscriptionId: syntheticProviderId,
      providerCustomerId: null,
      basePriceSnapshot: priceSnapshot.basePrice,
      additionalUserPriceSnapshot: priceSnapshot.additionalUserPrice,
      includedUsersSnapshot: priceSnapshot.includedUsers,
      additionalUsers: 0,
      currentAmount: priceSnapshot.totalPrice,
      nextBillingAmount: priceSnapshot.totalPrice,
      currentPeriodStart: now,
      currentPeriodEnd: new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000
      ),
      graceEndsAt: null,
      cancelAtPeriodEnd: false,
      pendingPlanType: null,
      pendingEffectiveFrom: null,
      pendingNewAmount: null,
      failedPaymentCount: 0,
      lastPaymentAt: null,
      lastWebhookAt: null
    })

    await this.subscriptionRepository.save(subscription, this.platformCtx)

    // Create onboarding event
    await this.auditLogService.create(
      {
        userId: 'system',
        tenantId: provisioningResult.tenantId,
        entityName: 'Subscription',
        entityId: subscription.id.value,
        ipAddress: _reqIp,
        userAgent: _reqUserAgent,
        action: 'subscription.onboarding_completed',
        before: null,
        after: {
          planType: PlanType.FREE,
          amount: 0,
          providerSubscriptionId: syntheticProviderId,
          source: 'onboarding'
        },
        description: null
      },
      this.platformCtx
    )

    // Step 3: Mark registration as PROVISIONED
    registration.markProvisioned({
      userId: provisioningResult.userId,
      tenantId: provisioningResult.tenantId,
      membershipId: provisioningResult.membershipId,
      profileId: provisioningResult.profileId,
      identityId: provisioningResult.identityId,
      tenantSiteId: provisioningResult.tenantSiteId
    })
    await this.registrationRepo.save(registration, this.platformCtx)

    // Step 4: Audit log
    await this.auditLogService.create(
      {
        userId: 'system',
        tenantId: null,
        entityName: 'TenantRegistration',
        entityId: registration.id.value,
        ipAddress: _reqIp,
        userAgent: _reqUserAgent,
        action: BOOTSTRAP_AUDIT_ACTIONS.REGISTRATION_CREATED,
        before: null,
        after: {
          externalRef: registration.externalRef,
          email: (registration.identityData as Record<string, unknown>)
            ?.identifier as string,
          planType: PlanType.FREE
        },
        description: null
      },
      this.platformCtx
    )

    this.logger.log(
      `FREE plan registration completed: ${registration.id.value}`
    )

    // Return result with paymentUrl = null
    return {
      registrationId: registration.id.value,
      paymentUrl: null,
      expiresAt: registration.expiresAt,
      handoffToken,
      subscriptionId: syntheticProviderId
    }
  }

  private normalizeTaxId(taxId: string): string {
    return taxId.replace(/[^\d]/g, '')
  }

  private async checkDuplicateEmail(email: string): Promise<void> {
    const existing = await this.identityRepository.findAll(
      { identifier: email, authProviderType: AuthProviderType.EMAIL },
      this.platformCtx
    )
    // TODO: Race condition — two concurrent requests with the same email could both pass
    // this check before either inserts. A unique DB constraint on
    // Identity(authProviderType, identifier) would prevent this at the DB level.
    if (existing.length > 0) {
      throw new DuplicateEmailError(email)
    }
  }

  private async checkDuplicateTaxId(taxId: string): Promise<void> {
    const existing = await this.tenantSiteRepo.findAll(
      { taxId },
      this.platformCtx
    )
    if (existing.length > 0) {
      throw new DuplicateTaxIdError(taxId)
    }
  }

  // --------------- Provisioning ---------------

  /**
   * Handles approved subscription by provisioning the tenant and
   * creating the local subscription entity.
   */
  private async handleApprovedSubscription(
    registration: TenantRegistration,
    ctx: RequestContext
  ): Promise<void> {
    // Finding 1: Wrap entire flow in a Prisma transaction with atomic state lock
    const provisioningResult = await this.prismaService.$transaction(
      async (tx) => {
        // Atomic conditional update: PENDING/APPROVED → PROVISIONING
        const updated = await tx.tenantRegistration.updateMany({
          where: {
            id: registration.id.value,
            state: {
              in: [RegistrationState.PENDING, RegistrationState.APPROVED]
            }
          },
          data: {
            state: RegistrationState.PROVISIONING,
            updatedAt: new Date()
          }
        })

        if (updated.count === 0) {
          // Another request already claimed it — return silently
          this.logger.debug('Registration already claimed by another request', {
            registrationId: registration.id.value
          })
          return null
        }

        // Audit: provisioning started
        await this.auditLogService.create(
          {
            userId: 'system',
            tenantId: null,
            entityName: 'TenantRegistration',
            entityId: registration.id.value,
            ipAddress: null,
            userAgent: null,
            action: BOOTSTRAP_AUDIT_ACTIONS.PROVISIONING_STARTED,
            before: { state: RegistrationState.APPROVED },
            after: { state: RegistrationState.PROVISIONING },
            description: null
          },
          ctx
        )

        // Provision tenant entities (this is the part that must share the transaction)
        const result = await this.provisionRegistration(registration, ctx, tx)

        // Mark as PROVISIONED (tenant/user/membership/profile/identity/site now exist)
        await tx.tenantRegistration.update({
          where: { id: registration.id.value },
          data: {
            state: RegistrationState.PROVISIONED,
            provisionedUserId: result.userId,
            provisionedTenantId: result.tenantId,
            provisionedMembershipId: result.membershipId,
            provisionedProfileId: result.profileId,
            provisionedIdentityId: result.identityId,
            provisionedTenantSiteId: result.tenantSiteId,
            provisionedAt: new Date(),
            updatedAt: new Date()
          }
        })

        // Audit: provisioning completed
        await this.auditLogService.create(
          {
            userId: 'system',
            tenantId: null,
            entityName: 'TenantRegistration',
            entityId: registration.id.value,
            ipAddress: null,
            userAgent: null,
            action: BOOTSTRAP_AUDIT_ACTIONS.PROVISIONING_COMPLETED,
            before: { state: RegistrationState.PROVISIONING },
            after: {
              state: RegistrationState.PROVISIONED,
              ...result
            },
            description: null
          },
          ctx
        )

        return result
      }
    ) // ← transaction commits here — tenant is now visible to other connections

    // Bail out if another request already claimed this registration
    if (!provisioningResult) return

    // ------------------------------------------------------------------
    // Create local subscription entity AFTER the transaction commits
    // so the subscription repository can resolve the tenant FK.
    // ------------------------------------------------------------------
    const planType = (registration.tenantData as Record<string, unknown>)
      .planType

    if (
      typeof planType !== 'string' ||
      !Object.values(PlanType).includes(planType as PlanType)
    ) {
      this.logger.error('Invalid planType in registration tenantData', {
        registrationId: registration.id.value,
        planType
      })
      throw new Error(`Invalid planType: ${planType}`)
    }

    if (registration.subscriptionId) {
      try {
        await this.subscriptionService.finalizeOnboardingSubscription(
          provisioningResult.tenantId,
          registration.subscriptionId,
          planType as PlanType,
          ctx
        )
      } catch (error) {
        // Log but don't fail — the registration is already PROVISIONED
        // and the subscription can be retried via /bootstrap/retry
        this.logger.warn(
          'Subscription creation failed after provisioning (can retry)',
          {
            registrationId: registration.id.value,
            error: (error as Error).message
          }
        )
      }
    }
  }

  /**
   * Provisions all tenant entities atomically after payment approval.
   * Creates User, Tenant, TenantMembership, MemberProfile, Identity, and TenantSite.
   * Accepts an optional Prisma transaction client so all calls participate in the
   * same transaction. When no tx is provided, falls back to the default Prisma client.
   * The method is idempotent — it skips entities that were already provisioned.
   */
  async provisionRegistration(
    registration: TenantRegistration,
    ctx: RequestContext,
    tx?: Prisma.TransactionClient
  ): Promise<ProvisioningResult> {
    const prisma = tx ?? this.prismaService
    const now = new Date()

    // Parse registration data
    const tenantData = registration.tenantData as Record<string, unknown>
    const tenantSiteData = registration.tenantSiteData as Record<
      string,
      unknown
    >
    const identityData = registration.identityData as Record<string, unknown>
    const profileData = registration.profileData as Record<string, unknown>

    // Generate slug from tenant name
    const tenantName = tenantData.name as string
    const baseSlug = tenantName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    // Finding 9: Slug collision check
    let finalSlug = baseSlug
    let suffix = 1
    while (await this.tenantRepository.findBySlug(finalSlug, ctx)) {
      finalSlug = `${baseSlug}-${suffix}`
      suffix++
    }

    // Resolve existing provisioned IDs from the registration
    const existingUserId = registration.provisionedUserId
    const existingTenantId = registration.provisionedTenantId
    const existingMembershipId = registration.provisionedMembershipId
    const existingProfileId = registration.provisionedProfileId
    const existingIdentityId = registration.provisionedIdentityId
    const existingTenantSiteId = registration.provisionedTenantSiteId

    // 1. Create User (TENANT scope) — idempotent
    let userId: string
    if (existingUserId) {
      this.logger.debug('User already provisioned, skipping', {
        userId: existingUserId
      })
      userId = existingUserId
    } else {
      userId = crypto.randomUUID()
      await prisma.user.create({
        data: {
          id: userId,
          scope: UserScope.TENANT,
          systemState: SystemState.ACTIVE,
          createdAt: now,
          updatedAt: now
        }
      })
      if (tx) {
        await tx.tenantRegistration.update({
          where: { id: registration.id.value },
          data: { provisionedUserId: userId, updatedAt: new Date() }
        })
      }
    }

    // 2. Create Tenant — idempotent
    let tenantId: string
    if (existingTenantId) {
      this.logger.debug('Tenant already provisioned, skipping', {
        tenantId: existingTenantId
      })
      tenantId = existingTenantId
    } else {
      tenantId = crypto.randomUUID()
      await prisma.tenant.create({
        data: {
          id: tenantId,
          name: tenantName,
          slug: finalSlug,
          website: null,
          locale: (tenantData.locale as string) ?? 'pt-BR',
          timezone: (tenantData.timezone as string) ?? 'America/Sao_Paulo',
          language: (tenantData.language as string) ?? 'pt',
          logoUrl: null,
          settings: Prisma.JsonNull,
          systemState: SystemState.ACTIVE,
          providerCustomerId: registration.providerCustomerId ?? null,
          createdAt: now,
          updatedAt: now
        }
      })
      if (tx) {
        await tx.tenantRegistration.update({
          where: { id: registration.id.value },
          data: { provisionedTenantId: tenantId, updatedAt: new Date() }
        })
      }
    }

    // 3. Create TenantMembership (owner, ADMIN role) — idempotent
    let membershipId: string
    if (existingMembershipId) {
      this.logger.debug('Membership already provisioned, skipping', {
        membershipId: existingMembershipId
      })
      membershipId = existingMembershipId
    } else {
      membershipId = crypto.randomUUID()
      await prisma.tenantMembership.create({
        data: {
          id: membershipId,
          userId,
          tenantId,
          isOwner: true,
          roles: [TenantRole.ADMIN],
          systemState: SystemState.ACTIVE,
          createdAt: now,
          updatedAt: now
        }
      })
      if (tx) {
        await tx.tenantRegistration.update({
          where: { id: registration.id.value },
          data: { provisionedMembershipId: membershipId, updatedAt: new Date() }
        })
      }
    }

    // 4. Create MemberProfile — idempotent
    let profileId: string
    if (existingProfileId) {
      this.logger.debug('Profile already provisioned, skipping', {
        profileId: existingProfileId
      })
      profileId = existingProfileId
    } else {
      profileId = crypto.randomUUID()
      await prisma.memberProfile.create({
        data: {
          id: profileId,
          fullName: profileData.fullName as string,
          displayName: (profileData.displayName as string) ?? null,
          dateOfBirth: profileData.dateOfBirth
            ? new Date(profileData.dateOfBirth as string)
            : null,
          gender: (profileData.gender as Gender) ?? null,
          photoUrl: (profileData.photoUrl as string) ?? null,
          externalId: null,
          locale: (tenantData.locale as string) ?? 'pt-BR',
          timezone: (tenantData.timezone as string) ?? 'America/Sao_Paulo',
          language: (tenantData.language as string) ?? 'pt',
          platformMembershipId: null,
          tenantMembershipId: membershipId,
          systemState: SystemState.ACTIVE,
          createdAt: now,
          updatedAt: now
        }
      })
      if (tx) {
        await tx.tenantRegistration.update({
          where: { id: registration.id.value },
          data: { provisionedProfileId: profileId, updatedAt: new Date() }
        })
      }
    }

    // 5. Create Identity (reuse stored password hash) — idempotent
    let identityId: string
    if (existingIdentityId) {
      this.logger.debug('Identity already provisioned, skipping', {
        identityId: existingIdentityId
      })
      identityId = existingIdentityId
    } else {
      identityId = crypto.randomUUID()
      await prisma.identity.create({
        data: {
          id: identityId,
          userId,
          authProviderType: AuthProviderType.EMAIL,
          identifier: identityData.identifier as string,
          secretHash: identityData.secretHash as string,
          systemState: SystemState.ACTIVE,
          createdAt: now,
          updatedAt: now
        }
      })
      if (tx) {
        await tx.tenantRegistration.update({
          where: { id: registration.id.value },
          data: { provisionedIdentityId: identityId, updatedAt: new Date() }
        })
      }
    }

    // 6. Create TenantSite (headquarters) — idempotent
    let tenantSiteId: string
    if (existingTenantSiteId) {
      this.logger.debug('TenantSite already provisioned, skipping', {
        tenantSiteId: existingTenantSiteId
      })
      tenantSiteId = existingTenantSiteId
    } else {
      tenantSiteId = crypto.randomUUID()
      await prisma.tenantSite.create({
        data: {
          id: tenantSiteId,
          tenantId,
          name: tenantSiteData.name as string,
          legalName: tenantSiteData.legalName as string,
          externalId: null,
          taxId: tenantSiteData.taxId as string,
          siteType:
            (tenantSiteData.siteType as TenantSiteType) ??
            TenantSiteType.FACTORY,
          isHeadquarters: true,
          systemState: SystemState.ACTIVE,
          createdAt: now,
          updatedAt: now
        }
      })
      if (tx) {
        await tx.tenantRegistration.update({
          where: { id: registration.id.value },
          data: { provisionedTenantSiteId: tenantSiteId, updatedAt: new Date() }
        })
      }
    }

    return {
      userId,
      tenantId,
      membershipId,
      profileId,
      identityId,
      tenantSiteId
    }
  }

  /**
   * Retry provisioning for a registration that failed mid-flight.
   * Operators can call this with the x-operator-secret header.
   * Wrapped in a $transaction for atomicity.
   */
  async retryProvisioning(
    registrationId: string
  ): Promise<ProvisioningResult | { status: 'already-provisioned' }> {
    const ctx = this.platformCtx

    return this.prismaService.$transaction(async (tx) => {
      // Finding 5: Search by findById first (matching the parameter name)
      const registrationRecord = await tx.tenantRegistration.findUnique({
        where: { id: registrationId }
      })

      if (!registrationRecord) {
        throw new RegistrationNotFoundError(registrationId)
      }

      const state = registrationRecord.state as RegistrationState

      if (state === RegistrationState.PROVISIONED) {
        return { status: 'already-provisioned' }
      }

      if (state !== RegistrationState.PROVISIONING) {
        throw new InvalidRegistrationStateError()
      }

      // Rehydrate domain entity using the shared mapper
      const domainRegistration =
        TenantRegistrationMapper.toDomain(registrationRecord)

      // Run provisioning with transaction client (idempotent)
      const result = await this.provisionRegistration(
        domainRegistration,
        ctx,
        tx
      )

      // Mark as PROVISIONED and persist entity IDs
      await tx.tenantRegistration.update({
        where: { id: registrationId },
        data: {
          state: RegistrationState.PROVISIONED,
          provisionedUserId: result.userId,
          provisionedTenantId: result.tenantId,
          provisionedMembershipId: result.membershipId,
          provisionedProfileId: result.profileId,
          provisionedIdentityId: result.identityId,
          provisionedTenantSiteId: result.tenantSiteId,
          provisionedAt: new Date(),
          updatedAt: new Date()
        }
      })

      return result
    })
  }

  async fakeApproveByProviderSubscriptionId(
    providerSubscriptionId: string
  ): Promise<string> {
    const ctx = this.platformCtx

    const registration = await this.registrationRepo.findBySubscriptionId(
      providerSubscriptionId,
      ctx
    )
    if (!registration) {
      throw new RegistrationNotFoundError(
        `Subscription ${providerSubscriptionId}`
      )
    }

    const registrationId = registration.id.value
    await this.fakeApproveRegistration(registrationId)
    return registrationId
  }

  async fakeFailByProviderSubscriptionId(
    providerSubscriptionId: string
  ): Promise<string> {
    const ctx = this.platformCtx

    const registration = await this.registrationRepo.findBySubscriptionId(
      providerSubscriptionId,
      ctx
    )
    if (!registration) {
      throw new RegistrationNotFoundError(
        `Subscription ${providerSubscriptionId}`
      )
    }

    const registrationId = registration.id.value
    registration.markRejected()
    await this.registrationRepo.save(registration, ctx)
    return registrationId
  }

  // --------------- Dev-Only Fake Approval ---------------

  /**
   * Simulates subscription authorization for a pending registration.
   * DEV ONLY — triggers the same webhook flow as a real authorized subscription.
   *
   * TODO (2026-05-20 decision): This method simulates the preapproval webhook flow
   * which is dead code. After the webhook consolidation, this should be updated to:
   *   - For paid plans: trigger the subscription webhook handler directly
   *   - For FREE plans: this endpoint is not needed (FREE skips payment entirely)
   * Consider renaming to reflect its new purpose or removing if the subscription
   * webhook handler can be called directly in tests.
   */
  async fakeApproveRegistration(registrationId: string): Promise<void> {
    const paymentProvider = this.configService.get<string>(
      'PAYMENT_PROVIDER',
      'fake'
    )
    if (paymentProvider !== 'fake') {
      throw new Error(
        'Fake approval is only available when PAYMENT_PROVIDER=fake'
      )
    }

    const ctx = this.platformCtx

    // Check registration exists
    const registration = await this.registrationRepo.findById(
      registrationId,
      ctx
    )
    if (!registration) {
      throw new RegistrationNotFoundError(registrationId)
    }
    if (registration.state !== RegistrationState.PENDING) {
      throw new InvalidRegistrationStateError()
    }

    // Step 1: Construct fake webhook payload and send through the
    // real webhook pipeline to test the signature validation,
    // status fetching, and deduplication logic.
    // TODO (EP-001): Adapt to Asaas webhook format when implementing
    // the full Asaas flow. Currently uses MP-like payload.
    const fakeBody = {
      type: 'subscription_preapproval',
      data: { id: registration.subscriptionId }
    }
    const fakeHeaders = {
      'x-signature': 'fake',
      'x-request-id': 'fake'
    }

    try {
      const pipelineResult = await this.subscriptionService.processWebhook(
        fakeBody,
        fakeHeaders,
        'subscription_preapproval'
      )
      this.logger.debug('Fake webhook pipeline result', {
        registrationId,
        processed: pipelineResult.processed,
        providerSubscriptionId: pipelineResult.providerSubscriptionId
      })
    } catch (error) {
      this.logger.warn('Fake webhook pipeline test failed (non-fatal)', {
        registrationId,
        error: error instanceof Error ? error.message : String(error)
      })
      // Don't block provisioning — this is a dev-only helper
    }

    // Step 2: Continue with existing provisioning flow
    if (registration.state === RegistrationState.PENDING) {
      registration.markApproved()
      await this.registrationRepo.save(registration, ctx)

      await this.auditLogService.create(
        {
          userId: 'system',
          tenantId: null,
          entityName: 'TenantRegistration',
          entityId: registration.id.value,
          ipAddress: null,
          userAgent: null,
          action: BOOTSTRAP_AUDIT_ACTIONS.SUBSCRIPTION_AUTHORIZED,
          before: { state: RegistrationState.PENDING },
          after: {
            state: RegistrationState.APPROVED,
            providerSubscriptionId: registration.subscriptionId
          },
          description: null
        },
        ctx
      )
    }

    await this.handleApprovedSubscription(registration, ctx)
  }

  // --------------- Onboarding Webhook Handler ---------------

  /**
   * Handles an onboarding webhook from the payment provider.
   * Called by SubscriptionController when processWebhook detects a
   * subscription_preapproval event without a local subscription.
   *
   * Flow:
   * 1. Find registration by provider subscription ID
   * 2. Idempotency: skip if already processed
   * 3. Check if registration has expired
   * 4. Fetch authoritative status from provider
   * 5. Proceed only if subscription is ACTIVE
   * 6. Mark approved and trigger provisioning
   */
  async handleOnboardingWebhook(
    providerSubscriptionId: string,
    ctx: RequestContext
  ): Promise<{ processed: boolean }> {
    this.logger.log('Handling onboarding webhook', { providerSubscriptionId })

    // Find registration by provider subscription ID
    const registration = await this.registrationRepo.findBySubscriptionId(
      providerSubscriptionId,
      ctx
    )

    if (!registration) {
      this.logger.warn('Onboarding webhook for unknown registration', {
        providerSubscriptionId
      })
      return { processed: false }
    }

    // Idempotency: skip if already provisioned or in provisioning
    if (
      registration.state === RegistrationState.PROVISIONED ||
      registration.state === RegistrationState.PROVISIONING
    ) {
      this.logger.debug('Registration already processed', {
        registrationId: registration.id.value
      })
      return { processed: false }
    }

    // Check if registration has expired
    if (
      registration.state === RegistrationState.PENDING &&
      registration.expiresAt < new Date()
    ) {
      registration.markExpired()
      await this.registrationRepo.save(registration, ctx)
      this.logger.warn(
        'Registration expired before subscription authorization',
        {
          registrationId: registration.id.value
        }
      )
      return { processed: false }
    }

    // Fetch authoritative status from provider
    let snapshot
    try {
      snapshot = await this.subscriptionProvider.getSubscription(
        providerSubscriptionId
      )
    } catch (error) {
      this.logger.error('Failed to fetch provider snapshot for preapproval', {
        providerSubscriptionId,
        error: error instanceof Error ? error.message : String(error)
      })
      return { processed: false }
    }

    // Only proceed if subscription is authorized (ACTIVE in MP)
    if (snapshot.status !== SubscriptionStatus.ACTIVE) {
      this.logger.debug('Subscription not yet authorized, waiting', {
        providerSubscriptionId,
        status: snapshot.status
      })
      return { processed: false }
    }

    // Mark as approved and trigger provisioning
    registration.markApproved()
    await this.registrationRepo.save(registration, ctx)

    await this.auditLogService.create(
      {
        userId: 'system',
        tenantId: null,
        entityName: 'TenantRegistration',
        entityId: registration.id.value,
        ipAddress: null,
        userAgent: null,
        action: BOOTSTRAP_AUDIT_ACTIONS.SUBSCRIPTION_AUTHORIZED,
        before: { state: RegistrationState.PENDING },
        after: {
          state: RegistrationState.APPROVED,
          providerSubscriptionId
        },
        description: null
      },
      ctx
    )

    await this.handleApprovedSubscription(registration, ctx)
    return { processed: true }
  }

  // --------------- Session Handoff ---------------

  async getStatus(registrationId: string): Promise<BootstrapStatusResponseDto> {
    const ctx = this.platformCtx

    // Support both primary key ID and externalRef for flexibility
    let registration = await this.registrationRepo.findById(registrationId, ctx)
    if (!registration) {
      registration = await this.registrationRepo.findByExternalRef(
        registrationId,
        ctx
      )
    }

    if (!registration) {
      throw new RegistrationNotFoundError(registrationId)
    }

    // Check expiry
    if (
      registration.state === RegistrationState.PENDING &&
      registration.expiresAt < new Date()
    ) {
      registration.markExpired()
      await this.registrationRepo.save(registration, ctx)

      await this.auditLogService.create(
        {
          userId: 'system',
          tenantId: null,
          entityName: 'TenantRegistration',
          entityId: registration.id.value,
          ipAddress: null,
          userAgent: null,
          action: BOOTSTRAP_AUDIT_ACTIONS.REGISTRATION_EXPIRED,
          before: { state: RegistrationState.PENDING },
          after: { state: RegistrationState.EXPIRED },
          description: null
        },
        ctx
      )
    }

    return BootstrapStatusResponseDto.from(registration.state)
  }

  async claimSession(
    dto: ClaimSessionDto,
    req: Request,
    res: Response
  ): Promise<ClaimSessionResponseDto> {
    const platformCtx = this.platformCtx

    return this.prismaService.$transaction(async (tx) => {
      // Support both primary key ID and externalRef for flexibility
      let registration = await tx.tenantRegistration.findUnique({
        where: { id: dto.registrationId }
      })
      if (!registration) {
        registration = await tx.tenantRegistration.findUnique({
          where: { externalRef: dto.registrationId }
        })
      }
      if (!registration) {
        throw new RegistrationNotFoundError(dto.registrationId)
      }

      // 2. Validate state
      if (registration.state !== RegistrationState.PROVISIONED) {
        throw new InvalidRegistrationStateError()
      }

      // 3. Atomic token validation + invalidation
      const now = new Date()
      const tokenHash = crypto
        .createHash('sha256')
        .update(dto.handoffToken)
        .digest('hex')

      const updated = await tx.tenantRegistration.updateMany({
        where: {
          id: registration.id,
          state: RegistrationState.PROVISIONED,
          handoffTokenHash: tokenHash,
          handoffTokenExpiresAt: { gt: now },
          handoffTokenUsedAt: null
        },
        data: {
          handoffTokenUsedAt: now,
          handoffTokenHash: null,
          updatedAt: now
        }
      })

      if (updated.count === 0) {
        throw new InvalidHandoffTokenError()
      }

      // 4. Get user and tenant
      const user = await this.userRepository.findById(
        registration.provisionedUserId!,
        platformCtx
      )
      if (!user) {
        throw new ProvisionedEntityNotFoundError('User')
      }

      const tenant = await this.tenantRepository.findById(
        registration.provisionedTenantId!,
        platformCtx
      )
      if (!tenant) {
        throw new ProvisionedEntityNotFoundError('Tenant')
      }

      // 5. Create session
      const deviceInfo = req.headers['user-agent']
      const ipAddress = req.ip ?? null

      await this.sessionService.createSession(
        res,
        user.id.value,
        {
          type: 'auth',
          userId: user.id.value,
          scope: UserScope.TENANT,
          tenantId: tenant.id.value,
          roles: [TenantRole.ADMIN]
        },
        deviceInfo ?? null,
        ipAddress,
        tenant.id.value
      )

      // 6. Audit
      // Note: registration is a raw Prisma record here, so registration.id is a string (not Id VO)
      await this.auditLogService.create(
        {
          userId: 'system',
          tenantId: null,
          entityName: 'TenantRegistration',
          entityId: registration.id,
          ipAddress: ipAddress,
          userAgent: deviceInfo ?? null,
          action: BOOTSTRAP_AUDIT_ACTIONS.SESSION_CLAIMED,
          before: { state: RegistrationState.PROVISIONED },
          after: {
            state: RegistrationState.PROVISIONED,
            userId: user.id.value,
            tenantId: tenant.id.value
          },
          description: null
        },
        platformCtx
      )

      // 7. Return
      return ClaimSessionResponseDto.from(user, tenant)
    })
  }
}
