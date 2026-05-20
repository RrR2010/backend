import { Id } from '@shared/value-objects'
import { PlanType } from '@shared/enums'
import { Json } from '@shared/types'

export interface PlanProps {
  id: Id
  type: PlanType
  name: string
  description: string | null
  basePrice: number
  currency: 'BRL'
  includedUsers: number
  additionalUserPrice: number | null
  maxProducts: number | null
  maxRevisions: number | null
  trialDays: number | null
  features: Json
  isPublic: boolean
  isActive: boolean
  allowsAdditionalUsers: boolean
  createdAt: Date
  updatedAt: Date
}

export class Plan {
  readonly id: Id
  readonly type: PlanType
  readonly name: string
  readonly description: string | null
  readonly basePrice: number
  readonly currency: 'BRL'
  readonly includedUsers: number
  readonly additionalUserPrice: number | null
  readonly maxProducts: number | null
  readonly maxRevisions: number | null
  readonly trialDays: number | null
  readonly features: Json
  readonly isPublic: boolean
  readonly isActive: boolean
  readonly allowsAdditionalUsers: boolean
  readonly createdAt: Date
  readonly updatedAt: Date

  private constructor(props: PlanProps) {
    this.id = props.id
    this.type = props.type
    this.name = props.name
    this.description = props.description
    this.basePrice = props.basePrice
    this.currency = props.currency
    this.includedUsers = props.includedUsers
    this.additionalUserPrice = props.additionalUserPrice
    this.maxProducts = props.maxProducts
    this.maxRevisions = props.maxRevisions
    this.trialDays = props.trialDays
    this.features = props.features
    this.isPublic = props.isPublic
    this.isActive = props.isActive
    this.allowsAdditionalUsers = props.allowsAdditionalUsers
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  // TODO: zod validate input
  static create(
    props: Omit<PlanProps, 'id' | 'createdAt' | 'updatedAt'>
  ): Plan {
    return new Plan({
      id: Id.generate(),
      ...props,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  static rehydrate(props: PlanProps): Plan {
    return new Plan(props)
  }

  isFree(): boolean {
    return this.type === PlanType.FREE
  }

  calculatePrice(additionalUsers: number): number {
    if (additionalUsers <= 0) {
      return this.basePrice
    }
    if (this.additionalUserPrice === null) {
      return this.basePrice
    }
    const additionalCost = this.additionalUserPrice * additionalUsers
    return this.basePrice + additionalCost
  }
}
