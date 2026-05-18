import { RegistrationState } from '@shared/enums'

export interface BootstrapRegisterResult {
  registrationId: string
  paymentUrl: string
  expiresAt: Date
  handoffToken: string
}

export type TenantRegistrationFilter = {
  state?: RegistrationState
  externalRef?: string
  paymentId?: string
  preferenceId?: string
  handoffTokenHash?: string
}
