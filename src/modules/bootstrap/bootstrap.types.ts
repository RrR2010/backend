import { RegistrationState } from '@shared/enums'

export type TenantRegistrationFilter = {
  state?: RegistrationState
  externalRef?: string
  paymentId?: string
  preferenceId?: string
}
