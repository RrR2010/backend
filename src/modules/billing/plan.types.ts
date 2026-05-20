import { PlanType } from '@shared/enums'

export interface PlanDefinition {
  type: PlanType
  name: string
  description: string
  basePrice: number
  currency: 'BRL'
  includedUsers: number
  additionalUserPrice: number | null
  maxProducts: number | null
  maxRevisions: number | null
  trialDays: number | null
  features: string[]
  allowsAdditionalUsers: boolean
  isPublic: boolean
}

export interface PriceSnapshot {
  basePrice: number
  additionalUserPrice: number | null
  includedUsers: number
  additionalUsers: number
  totalAdditionalCost: number
  totalPrice: number
}
