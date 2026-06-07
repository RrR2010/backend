import { ApiProperty } from '@nestjs/swagger'
import { Plan } from '@billing/plan.entity'
import { PriceSnapshot } from '@billing/plan.types'
import { PlanType } from '@shared/enums'

export class BasePlanResponseDto {
  @ApiProperty({ enum: PlanType })
  type!: PlanType

  @ApiProperty()
  name!: string

  @ApiProperty({ nullable: true })
  description!: string | null

  @ApiProperty({ description: 'Base price in cents' })
  basePrice!: number

  @ApiProperty({ enum: ['BRL'] })
  currency!: 'BRL'

  @ApiProperty({ description: 'Number of users included in base price' })
  includedUsers!: number

  @ApiProperty({
    nullable: true,
    description: 'Price per additional user in cents'
  })
  additionalUserPrice!: number | null

  @ApiProperty({ nullable: true })
  maxProducts!: number | null

  @ApiProperty({ nullable: true })
  maxRevisions!: number | null

  @ApiProperty({ type: [String] })
  features!: string[]

  @ApiProperty({ description: 'Whether additional users are allowed' })
  allowsAdditionalUsers!: boolean

  protected static applyBaseFields(dto: BasePlanResponseDto, plan: Plan): void {
    dto.type = plan.type
    dto.name = plan.name
    dto.description = plan.description
    dto.basePrice = plan.basePrice
    dto.currency = plan.currency
    dto.includedUsers = plan.includedUsers
    dto.additionalUserPrice = plan.additionalUserPrice
    dto.maxProducts = plan.maxProducts
    dto.maxRevisions = plan.maxRevisions
    dto.features = Array.isArray(plan.features)
      ? (plan.features as string[])
      : typeof plan.features === 'string'
        ? JSON.parse(plan.features)
        : []
    dto.allowsAdditionalUsers = plan.allowsAdditionalUsers
  }
}

export class PlanResponseDto extends BasePlanResponseDto {
  static fromDomain(plan: Plan): PlanResponseDto {
    const dto = new PlanResponseDto()
    BasePlanResponseDto.applyBaseFields(dto, plan)
    return dto
  }
}

export class PublicPlansResponseDto {
  @ApiProperty({ type: [PlanResponseDto] })
  plans!: PlanResponseDto[]

  static fromPlans(plans: Plan[]): PublicPlansResponseDto {
    const dto = new PublicPlansResponseDto()
    dto.plans = plans.map((plan) => PlanResponseDto.fromDomain(plan))
    return dto
  }
}

export class PriceSnapshotDto {
  @ApiProperty({ description: 'Base price in cents' })
  basePrice!: number

  @ApiProperty({
    nullable: true,
    description: 'Price per additional user in cents'
  })
  additionalUserPrice!: number | null

  @ApiProperty({ description: 'Number of users included in base price' })
  includedUsers!: number

  @ApiProperty({ description: 'Number of additional users' })
  additionalUsers!: number

  @ApiProperty({ description: 'Total cost for additional users in cents' })
  totalAdditionalCost!: number

  @ApiProperty({ description: 'Total price in cents' })
  totalPrice!: number

  static fromSnapshot(snapshot: PriceSnapshot): PriceSnapshotDto {
    const dto = new PriceSnapshotDto()
    dto.basePrice = snapshot.basePrice
    dto.additionalUserPrice = snapshot.additionalUserPrice
    dto.includedUsers = snapshot.includedUsers
    dto.additionalUsers = snapshot.additionalUsers
    dto.totalAdditionalCost = snapshot.totalAdditionalCost
    dto.totalPrice = snapshot.totalPrice
    return dto
  }
}

export class PlanWithPriceResponseDto extends BasePlanResponseDto {
  @ApiProperty({
    description: 'Calculated total price in cents (base + additional users)'
  })
  calculatedPrice!: number

  @ApiProperty({ description: 'Price snapshot at time of calculation' })
  priceSnapshot!: PriceSnapshotDto

  static fromDomainWithPrice(
    plan: Plan,
    snapshot: PriceSnapshot
  ): PlanWithPriceResponseDto {
    const dto = new PlanWithPriceResponseDto()
    BasePlanResponseDto.applyBaseFields(dto, plan)
    dto.calculatedPrice = snapshot.totalPrice
    dto.priceSnapshot = PriceSnapshotDto.fromSnapshot(snapshot)
    return dto
  }
}
