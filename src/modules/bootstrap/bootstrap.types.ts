import { RegistrationState } from '@shared/enums'

export interface BootstrapRegisterResult {
  registrationId: string
  checkoutUrl: string | null
  expiresAt: Date
  handoffToken: string | null
  subscriptionId: string | null
  registrationExternalRef: string
}

export interface ProvisioningResult {
  userId: string
  tenantId: string
  membershipId: string
  profileId: string
  identityId: string
  tenantSiteId: string
}

export type TenantRegistrationFilter = {
  state?: RegistrationState
  externalRef?: string
  paymentId?: string
  handoffTokenHash?: string
  subscriptionId?: string
}
