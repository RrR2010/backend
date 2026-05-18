import { Injectable } from '@nestjs/common'
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
import { BootstrapRegisterResult } from '@bootstrap/bootstrap.types'
import { BOOTSTRAP_AUDIT_ACTIONS } from '@bootstrap/bootstrap.constants'
import { PaymentService } from '@payments/payment.service'
import { PasswordHasher } from '@authentication/password.hasher.service'
import { TokenService } from '@authentication/token.service'
import { TenantSiteRepository } from '@tenant-sites/tenant-site.repository'
import { IdentityRepository } from '@identities/identity.repository'
import { AuthProviderType } from '@authentication/authentication.types'
import { RegistrationState } from '@shared/enums'
import { AuditLogService } from '@audit-logs/audit-log.service'

@Injectable()
export class BootstrapService {
  private readonly platformCtx: RequestContext = {
    userId: 'system',
    scope: UserScope.PLATFORM,
    roles: []
  }

  constructor(
    private readonly registrationRepo: TenantRegistrationRepository,
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

    let preference: Awaited<ReturnType<typeof this.paymentService.createPreference>>
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
}
