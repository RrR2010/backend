import { Id } from '@shared/value-objects'
import { Base } from '@shared/base-entity'
import { Auditable, type AuditableProps } from '@shared/behaviours/auditable'
import { Json } from '@shared/types'
import { RegistrationState } from '@shared/enums'

export type TenantRegistrationProps = AuditableProps & {
  id: Id
  externalRef: string
  state: RegistrationState
  paymentId: string | null
  subscriptionId: string | null
  providerCustomerId: string | null
  expiresAt: Date
  handoffTokenHash: string | null
  handoffTokenExpiresAt: Date | null
  handoffTokenUsedAt: Date | null
  tenantData: Json
  tenantSiteData: Json
  userData: Json
  identityData: Json
  profileData: Json
  addressData: Json | null
  phoneData: Json | null
  provisionedUserId: string | null
  provisionedTenantId: string | null
  provisionedMembershipId: string | null
  provisionedProfileId: string | null
  provisionedIdentityId: string | null
  provisionedTenantSiteId: string | null
  paymentStatus: string | null
  paymentStatusDetail: string | null
  webhookProcessedAt: Date | null
  approvedAt: Date | null
  provisionedAt: Date | null
  rejectedAt: Date | null
  expiredAt: Date | null
}

type CreateTenantRegistrationProps = Omit<
  TenantRegistrationProps,
  keyof AuditableProps | 'id'
>

export class TenantRegistration extends Auditable(
  Base<TenantRegistrationProps>
) {
  protected constructor(props: TenantRegistrationProps) {
    super(props)
  }

  // --------------- Factory Methods ---------------

  static create(props: CreateTenantRegistrationProps): TenantRegistration {
    const now = new Date()
    const registration = new TenantRegistration({
      ...props,
      id: Id.generate(),
      providerCustomerId: props.providerCustomerId ?? null,
      createdAt: now,
      updatedAt: now
    })
    return registration
  }

  static rehydrate(props: TenantRegistrationProps): TenantRegistration {
    return new TenantRegistration(props)
  }

  // --------------- Getters ---------------

  get id(): Id {
    return this._props.id
  }

  get externalRef(): string {
    return this._props.externalRef
  }

  get state(): RegistrationState {
    return this._props.state
  }

  get paymentId(): string | null {
    return this._props.paymentId
  }

  get subscriptionId(): string | null {
    return this._props.subscriptionId
  }

  get providerCustomerId(): string | null {
    return this._props.providerCustomerId
  }

  get expiresAt(): Date {
    return this._props.expiresAt
  }

  get handoffTokenHash(): string | null {
    return this._props.handoffTokenHash
  }

  get handoffTokenExpiresAt(): Date | null {
    return this._props.handoffTokenExpiresAt
  }

  get handoffTokenUsedAt(): Date | null {
    return this._props.handoffTokenUsedAt
  }

  get tenantData(): Json {
    return this._props.tenantData
  }

  get tenantSiteData(): Json {
    return this._props.tenantSiteData
  }

  get userData(): Json {
    return this._props.userData
  }

  get identityData(): Json {
    return this._props.identityData
  }

  get profileData(): Json {
    return this._props.profileData
  }

  get addressData(): Json | null {
    return this._props.addressData
  }

  get phoneData(): Json | null {
    return this._props.phoneData
  }

  get provisionedUserId(): string | null {
    return this._props.provisionedUserId
  }

  get provisionedTenantId(): string | null {
    return this._props.provisionedTenantId
  }

  get provisionedMembershipId(): string | null {
    return this._props.provisionedMembershipId
  }

  get provisionedProfileId(): string | null {
    return this._props.provisionedProfileId
  }

  get provisionedIdentityId(): string | null {
    return this._props.provisionedIdentityId
  }

  get provisionedTenantSiteId(): string | null {
    return this._props.provisionedTenantSiteId
  }

  get paymentStatus(): string | null {
    return this._props.paymentStatus
  }

  get paymentStatusDetail(): string | null {
    return this._props.paymentStatusDetail
  }

  get webhookProcessedAt(): Date | null {
    return this._props.webhookProcessedAt
  }

  get approvedAt(): Date | null {
    return this._props.approvedAt
  }

  get provisionedAt(): Date | null {
    return this._props.provisionedAt
  }

  get rejectedAt(): Date | null {
    return this._props.rejectedAt
  }

  get expiredAt(): Date | null {
    return this._props.expiredAt
  }

  // --------------- State Transitions ---------------

  updateSubscriptionId(subscriptionId: string): void {
    this._props.subscriptionId = subscriptionId
    this.touch()
  }

  updateProviderCustomerId(providerCustomerId: string): void {
    this._props.providerCustomerId = providerCustomerId
    this.touch()
  }

  updatePaymentId(paymentId: string): void {
    this._props.paymentId = paymentId
    this.touch()
  }

  markProvisioned(ids: {
    userId: string
    tenantId: string
    membershipId: string
    profileId: string
    identityId: string
    tenantSiteId: string
  }): void {
    this._props.provisionedUserId = ids.userId
    this._props.provisionedTenantId = ids.tenantId
    this._props.provisionedMembershipId = ids.membershipId
    this._props.provisionedProfileId = ids.profileId
    this._props.provisionedIdentityId = ids.identityId
    this._props.provisionedTenantSiteId = ids.tenantSiteId
    this._props.state = RegistrationState.PROVISIONED
    this._props.provisionedAt = new Date()
    this.touch()
  }

  markRejected(): void {
    this._props.state = RegistrationState.REJECTED
    this._props.rejectedAt = new Date()
    this.touch()
  }

  markApproved(): void {
    this._props.state = RegistrationState.APPROVED
    this._props.approvedAt = new Date()
    this.touch()
  }

  markProvisioning(): void {
    this._props.state = RegistrationState.PROVISIONING
    this.touch()
  }

  markExpired(): void {
    this._props.state = RegistrationState.EXPIRED
    this._props.expiredAt = new Date()
    this.touch()
  }

  updatePaymentStatus(status: string, statusDetail: string): void {
    this._props.paymentStatus = status
    this._props.paymentStatusDetail = statusDetail
    this.touch()
  }

  markWebhookProcessed(): void {
    this._props.webhookProcessedAt = new Date()
    this.touch()
  }

  markHandoffTokenUsed(): void {
    this._props.handoffTokenUsedAt = new Date()
    this._props.handoffTokenHash = null
    this.touch()
  }
}
