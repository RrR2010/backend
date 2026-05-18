import { RegistrationState } from '@shared/enums'

export interface BootstrapRegisterResult {
  registrationId: string
  paymentUrl: string
  expiresAt: Date
  handoffToken: string
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
  preferenceId?: string
  handoffTokenHash?: string
}
