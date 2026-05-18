import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { TenantRegistrationRepository } from '@bootstrap/bootstrap.repository'
import { BootstrapRegisterDto } from '@bootstrap/bootstrap.dto'
import { TenantRegistration } from '@bootstrap/bootstrap.entity'
import {
  DuplicateEmailError,
  DuplicateTaxIdError
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
import { TenantSiteRepository } from '@tenant-sites/tenant-site.repository'
import { IdentityRepository } from '@identities/identity.repository'
import { AuthProviderType } from '@authentication/authentication.types'
import { RegistrationState } from '@shared/enums'
import { AuditLogService } from '@audit-logs/audit-log.service'
import { PrismaService } from '@shared/prisma/prisma.service'

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
    private readonly auditLogService: AuditLogService
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
        // Finding 8: Pass ctx to provisionRegistration
        const provisioningResult = await this.provisionRegistration(
          registration,
          ctx
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
   * Stub implementation — Phase 5 will implement actual entity creation.
   */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  async provisionRegistration(
    registration: TenantRegistration,
    ctx: RequestContext
  ): Promise<ProvisioningResult> {
    this.logger.warn(
      'provisionRegistration called — stub implementation (Phase 5)',
      { registrationId: registration.id.value }
    )
    // TODO: Phase 5 will implement actual entity creation using ctx for repository calls
    return Promise.resolve({
      userId: 'stub-user-id',
      tenantId: 'stub-tenant-id',
      membershipId: 'stub-membership-id',
      profileId: 'stub-profile-id',
      identityId: 'stub-identity-id',
      tenantSiteId: 'stub-tenant-site-id'
    })
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */

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
