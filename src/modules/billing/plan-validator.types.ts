import { PlanType } from '@shared/enums'

export type ResourceType = 'users' | 'products' | 'revisions'

export type Restriction =
  | 'read_only_mode'
  | 'no_new_resources'
  | 'limited_features'
  | 'warning_banner'
  | 'full_lock'

export interface ValidationResult {
  allowed: boolean
  currentUsage: number
  limit: number | null
  remaining: number | null
  resourceType: ResourceType
}

export interface ResourceUsage {
  users: ValidationResult
  products: ValidationResult
  revisions: ValidationResult
  planType: PlanType
  subscriptionStatus: string | null
}

export interface UpgradeSuggestion {
  recommendedPlanType: PlanType
  currentPlanType: PlanType
  reason: string
  priceDifference: number
  newBasePrice: number
  newLimit: number | null
}

export interface AccessCheck {
  hasAccess: boolean
  isDegraded: boolean
  restrictions: Restriction[]
  subscriptionStatus: string | null
  graceEndsAt: Date | null
  message: string | null
}
