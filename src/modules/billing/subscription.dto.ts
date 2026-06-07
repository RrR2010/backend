import { ApiProperty } from '@nestjs/swagger'
import { Subscription } from '@billing/subscription.entity'
import { PlanType, SubscriptionStatus } from '@shared/enums'
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator'
import { SubscriptionEvent } from '@billing/subscription-event.entity'

// ─────────────────────────────────────────────
// Task 76: Subscription Response DTO
// ─────────────────────────────────────────────

export class SubscriptionResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty({ enum: PlanType })
  planType!: PlanType

  @ApiProperty({ enum: SubscriptionStatus })
  status!: SubscriptionStatus

  @ApiProperty()
  currency!: string

  @ApiProperty({ description: 'Base price in cents' })
  currentAmount!: number

  @ApiProperty({ nullable: true, description: 'Next billing amount in cents' })
  nextBillingAmount!: number | null

  @ApiProperty({ nullable: true })
  currentPeriodStart!: Date | null

  @ApiProperty({ nullable: true })
  currentPeriodEnd!: Date | null

  @ApiProperty()
  includedUsersSnapshot!: number

  @ApiProperty()
  additionalUsers!: number

  @ApiProperty({ nullable: true })
  maxProducts!: number | null

  @ApiProperty({ nullable: true })
  maxRevisions!: number | null

  @ApiProperty({ nullable: true, enum: PlanType })
  pendingPlanType!: PlanType | null

  @ApiProperty({ nullable: true })
  pendingEffectiveFrom!: Date | null

  @ApiProperty({ nullable: true })
  pendingNewAmount!: number | null

  @ApiProperty()
  cancelAtPeriodEnd!: boolean

  @ApiProperty({ nullable: true, description: 'Current number of active products' })
  currentProducts!: number | null

  @ApiProperty({ nullable: true, description: 'Current number of active users' })
  currentActiveUsers!: number | null

  @ApiProperty({ nullable: true, description: 'Current number of revisions' })
  currentRevisions!: number | null

  @ApiProperty()
  createdAt!: Date

  static fromDomain(subscription: Subscription): SubscriptionResponseDto {
    return SubscriptionResponseDto.fromDomainWithPlan(subscription, null, null)
  }

  static fromDomainWithPlan(
    subscription: Subscription,
    maxProducts: number | null,
    maxRevisions: number | null,
    currentProducts: number | null = null,
    currentActiveUsers: number | null = null,
    currentRevisions: number | null = null
  ): SubscriptionResponseDto {
    const dto = new SubscriptionResponseDto()
    dto.id = subscription.id.value
    dto.planType = subscription.planType
    dto.status = subscription.status
    dto.currency = subscription.currency
    dto.currentAmount = subscription.currentAmount
    dto.nextBillingAmount = subscription.nextBillingAmount
    dto.currentPeriodStart = subscription.currentPeriodStart
    dto.currentPeriodEnd = subscription.currentPeriodEnd
    dto.includedUsersSnapshot = subscription.includedUsersSnapshot
    dto.additionalUsers = subscription.additionalUsers
    dto.maxProducts = maxProducts
    dto.maxRevisions = maxRevisions
    dto.currentProducts = currentProducts
    dto.currentActiveUsers = currentActiveUsers
    dto.currentRevisions = currentRevisions
    dto.pendingPlanType = subscription.pendingPlanType ?? null
    dto.pendingEffectiveFrom = subscription.pendingEffectiveFrom ?? null
    dto.pendingNewAmount = subscription.pendingNewAmount ?? null
    dto.cancelAtPeriodEnd = subscription.cancelAtPeriodEnd
    dto.createdAt = subscription.createdAt
    return dto
  }
}

// ─────────────────────────────────────────────
// Task 79: Change Plan DTOs
// ─────────────────────────────────────────────

export class ChangePlanRequestDto {
  @ApiProperty({ enum: PlanType })
  @IsEnum(PlanType)
  newPlanType!: PlanType
}

export class ChangePlanResponseDto {
  @ApiProperty()
  subscriptionId!: string

  @ApiProperty({ enum: PlanType })
  oldPlanType!: PlanType

  @ApiProperty({ enum: PlanType })
  newPlanType!: PlanType

  @ApiProperty({ nullable: true })
  effectiveFrom!: Date | null

  @ApiProperty()
  currentAmount!: number

  @ApiProperty()
  newAmount!: number

  @ApiProperty()
  pendingChange!: boolean

  @ApiProperty({ nullable: true })
  paymentUrl!: string | null

  static fromDomain(
    subscription: Subscription,
    oldPlanType: PlanType,
    currentAmount: number,
    paymentUrl: string | null = null
  ): ChangePlanResponseDto {
    const dto = new ChangePlanResponseDto()
    dto.subscriptionId = subscription.id.value
    dto.oldPlanType = oldPlanType
    dto.newPlanType = subscription.planType
    dto.effectiveFrom = subscription.pendingEffectiveFrom ?? null
    dto.currentAmount = currentAmount
    dto.newAmount = subscription.currentAmount
    dto.pendingChange = subscription.pendingPlanType !== null
    dto.paymentUrl = paymentUrl
    return dto
  }
}

// ─────────────────────────────────────────────
// Task 80: Add User DTOs
// ─────────────────────────────────────────────

export class AddUserRequestDto {
  @ApiProperty()
  @IsString()
  userId!: string

  @ApiProperty()
  @IsBoolean()
  confirmAdditionalCost!: boolean
}

export class AddUserResponseDto {
  @ApiProperty()
  userAdded!: boolean

  @ApiProperty({ description: 'Additional cost in cents' })
  additionalCost!: number

  @ApiProperty({ description: 'New monthly total in cents' })
  newMonthlyAmount!: number

  @ApiProperty()
  requiresConfirmation!: boolean

  @ApiProperty({ type: SubscriptionResponseDto })
  subscription!: SubscriptionResponseDto

  static fromDomain(
    subscription: Subscription,
    additionalCost: number,
    requiresConfirmation: boolean
  ): AddUserResponseDto {
    const dto = new AddUserResponseDto()
    dto.userAdded = !requiresConfirmation
    dto.additionalCost = additionalCost
    dto.newMonthlyAmount = subscription.currentAmount
    dto.requiresConfirmation = requiresConfirmation
    dto.subscription = SubscriptionResponseDto.fromDomain(subscription)
    return dto
  }
}

// ─────────────────────────────────────────────
// Task 81: Events DTO
// ─────────────────────────────────────────────

export class SubscriptionEventDto {
  @ApiProperty()
  id!: string

  @ApiProperty({ nullable: true })
  providerEventId!: string | null

  @ApiProperty()
  providerEventType!: string

  @ApiProperty({ nullable: true })
  statusBefore!: string | null

  @ApiProperty({ nullable: true })
  statusAfter!: string | null

  @ApiProperty({ default: 'COMPLETED' })
  actionStatus!: string

  @ApiProperty()
  payload!: Record<string, unknown>

  @ApiProperty()
  createdAt!: Date

  static fromDomain(event: SubscriptionEvent): SubscriptionEventDto {
    const dto = new SubscriptionEventDto()
    dto.id = event.id.value
    dto.providerEventId = event.providerEventId
    dto.providerEventType = event.providerEventType
    dto.statusBefore = event.statusBefore
    dto.statusAfter = event.statusAfter
    dto.actionStatus = event.actionStatus
    dto.payload = event.payload as Record<string, unknown>
    dto.createdAt = event.createdAt
    return dto
  }
}

export class EventsResponseDto {
  @ApiProperty({ type: [SubscriptionEventDto] })
  events!: SubscriptionEventDto[]

  @ApiProperty()
  total!: number

  @ApiProperty()
  page!: number

  @ApiProperty()
  limit!: number

  static fromResult(result: {
    events: SubscriptionEvent[]
    total: number
    page: number
    limit: number
  }): EventsResponseDto {
    const dto = new EventsResponseDto()
    dto.events = result.events.map((event) =>
      SubscriptionEventDto.fromDomain(event)
    )
    dto.total = result.total
    dto.page = result.page
    dto.limit = result.limit
    return dto
  }
}

// ─────────────────────────────────────────────
// Task 78: Cancel Subscription DTO
// ─────────────────────────────────────────────

export class CancelSubscriptionRequestDto {
  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  cancelAtPeriodEnd?: boolean
}
