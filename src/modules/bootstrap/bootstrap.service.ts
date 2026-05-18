import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope, TenantRole } from '@users/user.types'
import { Id } from '@shared/value-objects'
import { TenantRegistrationRepository } from '@bootstrap/bootstrap.repository'
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
import { PaymentService } from '@payments/payment.service'
import { PaymentNotification, WebhookHeaders } from '@payments/payment.types'
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
  SystemState
} from '@shared/enums'
import { Json } from '@shared/types'
import { AuditLogService } from '@audit-logs/audit-log.service'
import { PrismaService } from '@shared/prisma/prisma.service'
import { TenantRepository } from '@tenants/tenant.repository'
import { UserRepository } from '@users/user.repository'
import { Prisma } from '@prisma/client'
import type { Request, Response } from 'express'

@Injectable()
export class BootstrapService {
  private readonly logger = new Logger(BootstrapService.name)

  private readonly platformCtx: RequestContext = {
    userId: 'system',
    scope: UserScope.PLATFORM,
    roles: []
  }

  constructor(
    private readonly registrationRepo: TenantRegistrationRepository,
    private readonly prismaService: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly passwordHasher: PasswordHasher,
    private readonly tenantSiteRepo: TenantSiteRepository,
    private readonly identityRepository: IdentityRepository,
    private readonly configService: ConfigService,
    private readonly auditLogService: AuditLogService,
    private readonly tenantRepository: TenantRepository,
    private readonly userRepository: UserRepository,
    private readonly sessionService: SessionService
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
      preferenceId: null,
      tenantData: {
        name: normalizedTenantName,
        locale: dto.tenantLocale ?? 'pt-BR',
        timezone: dto.tenantTimezone ?? 'America/Sao_Paulo',
        language: dto.tenantLanguage ?? 'pt'
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

    // 7. Create payment preference
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000'
    )
    const backendUrl = this.configService.get<string>(
      'BACKEND_URL',
      'http://localhost:3001'
    )
    const price = Number(
      this.configService.get<string>('BOOTSTRAP_PLAN_PRICE', '9900')
    )

    let preference: Awaited<
      ReturnType<typeof this.paymentService.createPreference>
    >
    try {
      preference = await this.paymentService.createPreference({
        items: [
          {
            title: `ViverSorvete - ${normalizedTenantName}`,
            quantity: 1,
            unitPrice: price,
            currency: 'BRL'
          }
        ],
        externalReference: registration.externalRef,
        backUrls: {
          success: `${frontendUrl}/bootstrap/success`,
          pending: `${frontendUrl}/bootstrap/pending`,
          failure: `${frontendUrl}/bootstrap/failure`
        },
        notificationUrl: `${backendUrl}/bootstrap/webhook/payment`,
        payer: { email: normalizedEmail, name: dto.fullName.trim() }
      })
    } catch (error) {
      // Mark registration as rejected to prevent orphaned PENDING records
      registration.markRejected()
      await this.registrationRepo.save(registration, this.platformCtx)
      throw error
    }

    // 8. Update registration with preferenceId
    registration.updatePreferenceId(preference.preferenceId)
    await this.registrationRepo.save(registration, this.platformCtx)

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
          tenantName: normalizedTenantName
        }
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
        action: BOOTSTRAP_AUDIT_ACTIONS.PREFERENCE_CREATED,
        before: null,
        after: { preferenceId: preference.preferenceId }
      },
      this.platformCtx
    )

    // 10. Return result
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development')
    const paymentUrl =
      nodeEnv === 'production'
        ? preference.initPoint
        : preference.sandboxInitPoint

    if (!paymentUrl) {
      throw new Error('Payment provider returned no checkout URL')
    }

    return {
      registrationId: registration.id.value,
      paymentUrl,
      expiresAt: registration.expiresAt,
      handoffToken
    }
  }

  private normalizeTaxId(taxId: string): string {
    return taxId.replace(/[^\d]/g, '')
  }

  private async checkDuplicateEmail(email: string): Promise<void> {
    // TODO: Race condition — two concurrent requests with the same email could both pass
    // this check before either inserts. A unique DB constraint on
    // Identity(authProviderType, identifier) would prevent this at the DB level.
    const existing = await this.identityRepository.findAll(
      { identifier: email, authProviderType: AuthProviderType.EMAIL },
      this.platformCtx
    )
    const exactMatch = existing.find(
      (i) => i.identifier.toLowerCase() === email.toLowerCase()
    )
    if (exactMatch) {
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

  // --------------- Webhook Handling ---------------

  async handleWebhook(
    body: Record<string, unknown>,
    headers: Record<string, string>
  ): Promise<void> {
    const ctx = this.platformCtx

    // 1. Extract payment ID from payload
    const paymentId = this.extractPaymentId(body)
    if (!paymentId) {
      this.logger.warn('Webhook received without payment ID', { body })
      return // Return 200 silently
    }

    // 2. Validate webhook signature
    const webhookHeaders: WebhookHeaders = {
      'x-signature': headers['x-signature'] ?? '',
      'x-request-id': headers['x-request-id'] ?? ''
    }

    const isValid = this.paymentService.validateWebhookSignature(
      webhookHeaders,
      body
    )
    if (!isValid) {
      this.logger.warn('Invalid webhook signature', { paymentId })
      // Finding 9: Use placeholder for entityId — paymentId is unvalidated
      await this.auditLogService.create(
        {
          userId: 'system',
          tenantId: null,
          entityName: 'TenantRegistration',
          entityId: 'signature-invalid',
          ipAddress: null,
          userAgent: null,
          action: BOOTSTRAP_AUDIT_ACTIONS.WEBHOOK_SIGNATURE_INVALID,
          before: null,
          after: { paymentId: paymentId ?? 'unknown', headers: webhookHeaders }
        },
        ctx
      )
      return // Return 200 silently (don't expose validation failure)
    }

    // 3. Fetch authoritative payment data from provider
    const payment = await this.paymentService.getPayment(paymentId)

    // 4. Find registration by external reference
    const registration = await this.registrationRepo.findByExternalRef(
      payment.externalReference,
      ctx
    )

    if (!registration) {
      this.logger.warn('Webhook received for unknown registration', {
        externalReference: payment.externalReference
      })
      return // Return 200 silently
    }

    // 5. Handle already processed registrations (idempotency)
    if (registration.state === RegistrationState.PROVISIONED) {
      this.logger.debug('Registration already provisioned', {
        registrationId: registration.id.value
      })
      return
    }

    // Finding 2: Add PROVISIONING state check
    if (registration.state === RegistrationState.PROVISIONING) {
      this.logger.debug('Provisioning already in progress', {
        registrationId: registration.id.value
      })
      return
    }

    // Finding 4: Check if registration has expired
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
          after: { state: RegistrationState.EXPIRED }
        },
        ctx
      )

      return
    }

    if (registration.state === RegistrationState.EXPIRED) {
      this.logger.warn('Webhook received for expired registration', {
        registrationId: registration.id.value
      })
      return
    }

    // Finding 11: Capture stateBefore and write audit BEFORE any mutations
    const stateBefore = registration.state

    await this.auditLogService.create(
      {
        userId: 'system',
        tenantId: null,
        entityName: 'TenantRegistration',
        entityId: registration.id.value,
        ipAddress: null,
        userAgent: null,
        action: BOOTSTRAP_AUDIT_ACTIONS.WEBHOOK_RECEIVED,
        before: { state: stateBefore },
        after: { paymentId, paymentStatus: payment.status }
      },
      ctx
    )

    // 8. Handle based on payment status
    // Finding 6: Move payment detail persistence INTO the branches
    if (payment.status === 'approved') {
      // Persist payment details only when acting on the status
      registration.updatePaymentId(paymentId)
      registration.updatePaymentStatus(payment.status, payment.statusDetail)
      registration.markWebhookProcessed()
      await this.registrationRepo.save(registration, ctx)

      await this.handleApprovedPayment(registration, ctx)
    } else if (
      payment.status === 'rejected' ||
      payment.status === 'cancelled'
    ) {
      // Persist payment details only when acting on the status
      registration.updatePaymentId(paymentId)
      registration.updatePaymentStatus(payment.status, payment.statusDetail)
      registration.markWebhookProcessed()
      await this.registrationRepo.save(registration, ctx)

      await this.handleRejectedPayment(registration, payment, ctx)
    } else {
      // pending, in_process, etc. — just log, do NOT mutate registration
      this.logger.debug('Payment still pending', {
        registrationId: registration.id.value,
        status: payment.status
      })
    }
  }

  private async handleApprovedPayment(
    registration: TenantRegistration,
    ctx: RequestContext
  ): Promise<void> {
    // Finding 1: Wrap entire flow in a Prisma transaction with atomic state lock
    await this.prismaService.$transaction(async (tx) => {
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
        return
      }

      // Audit: provisioning started (inside transaction context)
      await this.auditLogService.create(
        {
          userId: 'system',
          tenantId: null,
          entityName: 'TenantRegistration',
          entityId: registration.id.value,
          ipAddress: null,
          userAgent: null,
          action: BOOTSTRAP_AUDIT_ACTIONS.PROVISIONING_STARTED,
          before: { state: RegistrationState.PENDING },
          after: { state: RegistrationState.PROVISIONING }
        },
        ctx
      )

      try {
        // Finding 8: Pass ctx and tx to provisionRegistration
        const provisioningResult = await this.provisionRegistration(
          registration,
          ctx,
          tx
        )

        // Mark as PROVISIONED
        await tx.tenantRegistration.update({
          where: { id: registration.id.value },
          data: {
            state: RegistrationState.PROVISIONED,
            provisionedUserId: provisioningResult.userId,
            provisionedTenantId: provisioningResult.tenantId,
            provisionedMembershipId: provisioningResult.membershipId,
            provisionedProfileId: provisioningResult.profileId,
            provisionedIdentityId: provisioningResult.identityId,
            provisionedTenantSiteId: provisioningResult.tenantSiteId,
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
              ...provisioningResult
            }
          },
          ctx
        )
      } catch (error) {
        // Finding 3: Do NOT throw — keep registration in PROVISIONING for operator recovery
        this.logger.error('Provisioning failed', {
          registrationId: registration.id.value,
          error: (error as Error).message
        })

        await this.auditLogService.create(
          {
            userId: 'system',
            tenantId: null,
            entityName: 'TenantRegistration',
            entityId: registration.id.value,
            ipAddress: null,
            userAgent: null,
            action: BOOTSTRAP_AUDIT_ACTIONS.PROVISIONING_FAILED,
            before: { state: RegistrationState.PROVISIONING },
            after: {
              state: RegistrationState.PROVISIONING,
              error: (error as Error).message
            }
          },
          ctx
        )

        // Do NOT throw — the webhook endpoint always returns 200
        // Registration stays in PROVISIONING for operator recovery
      }
    })
  }

  private async handleRejectedPayment(
    registration: TenantRegistration,
    payment: PaymentNotification,
    ctx: RequestContext
  ): Promise<void> {
    registration.markRejected()
    await this.registrationRepo.save(registration, ctx)

    await this.auditLogService.create(
      {
        userId: 'system',
        tenantId: null,
        entityName: 'TenantRegistration',
        entityId: registration.id.value,
        ipAddress: null,
        userAgent: null,
        action: BOOTSTRAP_AUDIT_ACTIONS.REGISTRATION_REJECTED,
        before: { state: registration.state },
        after: {
          state: RegistrationState.REJECTED,
          paymentStatus: payment.status
        }
      },
      ctx
    )
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

      // Rehydrate domain entity (explicit field mapping to satisfy type system)
      const domainRegistration = TenantRegistration.rehydrate({
        id: Id.from(registrationRecord.id),
        externalRef: registrationRecord.externalRef,
        state: registrationRecord.state as RegistrationState,
        paymentId: registrationRecord.paymentId,
        preferenceId: registrationRecord.preferenceId,
        expiresAt: registrationRecord.expiresAt,
        handoffTokenHash: registrationRecord.handoffTokenHash,
        handoffTokenExpiresAt: registrationRecord.handoffTokenExpiresAt,
        handoffTokenUsedAt: registrationRecord.handoffTokenUsedAt,
        tenantData: registrationRecord.tenantData as Json,
        tenantSiteData: registrationRecord.tenantSiteData as Json,
        userData: registrationRecord.userData as Json,
        identityData: registrationRecord.identityData as Json,
        profileData: registrationRecord.profileData as Json,
        provisionedUserId: registrationRecord.provisionedUserId,
        provisionedTenantId: registrationRecord.provisionedTenantId,
        provisionedMembershipId: registrationRecord.provisionedMembershipId,
        provisionedProfileId: registrationRecord.provisionedProfileId,
        provisionedIdentityId: registrationRecord.provisionedIdentityId,
        provisionedTenantSiteId: registrationRecord.provisionedTenantSiteId,
        paymentStatus: registrationRecord.paymentStatus,
        paymentStatusDetail: registrationRecord.paymentStatusDetail,
        webhookProcessedAt: registrationRecord.webhookProcessedAt,
        approvedAt: registrationRecord.approvedAt,
        provisionedAt: registrationRecord.provisionedAt,
        rejectedAt: registrationRecord.rejectedAt,
        expiredAt: registrationRecord.expiredAt,
        createdAt: registrationRecord.createdAt,
        updatedAt: registrationRecord.updatedAt
      })

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

  // --------------- Dev-Only Fake Approval ---------------

  /**
   * Simulates payment approval for a pending registration.
   * DEV ONLY — triggers the same webhook flow as a real approved payment.
   */
  async fakeApproveRegistration(registrationId: string): Promise<void> {
    const ctx = this.platformCtx
    const registration = await this.registrationRepo.findById(registrationId, ctx)
    if (!registration) {
      throw new RegistrationNotFoundError(registrationId)
    }
    if (registration.state !== RegistrationState.PENDING) {
      throw new InvalidRegistrationStateError()
    }

    // Simulate webhook flow for approved payment
    await this.handleWebhook(
      {
        action: 'payment.created',
        data: { id: `fake-approved-${registration.externalRef}` },
        external_reference: registration.externalRef
      },
      { 'x-signature': 'dev-signature', 'x-request-id': crypto.randomUUID() }
    )
  }

  // --------------- Session Handoff ---------------

  async getStatus(registrationId: string): Promise<BootstrapStatusResponseDto> {
    const ctx = this.platformCtx

    // Try finding by ID first, then by externalRef
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
          after: { state: RegistrationState.EXPIRED }
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
      // 1. Find registration
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
      const deviceInfo = req.headers['user-agent'] as string | undefined
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
          }
        },
        platformCtx
      )

      // 7. Return
      return ClaimSessionResponseDto.from(user, tenant)
    })
  }

  private extractPaymentId(body: Record<string, unknown>): string | null {
    // MP v2 format: data.id
    if (typeof body.data === 'object' && body.data !== null) {
      const data = body.data as Record<string, unknown>
      if (typeof data.id === 'string') return data.id
      if (typeof data.id === 'number') return String(data.id)
    }
    // Fallback: top-level id
    if (typeof body.id === 'string') return body.id
    if (typeof body.id === 'number') return String(body.id)
    return null
  }
}
