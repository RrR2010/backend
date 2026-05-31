import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Headers,
  Query,
  Param,
  Req
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'
import { Public } from '@shared/decorators/public.decorator'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { SubscriptionService } from '@billing/subscription.service'
import { SubscriptionLifecycleService } from '@billing/subscription-lifecycle.service'
import { PlanService } from '@billing/plan.service'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { PlanType, SubscriptionStatus } from '@shared/enums'
import type { Request } from 'express'

// TODO: zod validate input
// Validation will be enforced when Zod pipe is implemented in the application.
// Until then, input is validated manually in the controller/service layer.
export class SubscriptionCheckoutDto {
  planType!: PlanType
  payerEmail!: string
  payerName!: string
  tenantId?: string
}

export class SubscriptionCheckoutResponseDto {
  subscriptionId!: string
  providerSubscriptionId!: string
  paymentUrl!: string
  status!: SubscriptionStatus
  amount!: number
  currency!: 'BRL'

  static from(
    subscriptionId: string,
    providerSubscriptionId: string,
    paymentUrl: string,
    status: SubscriptionStatus,
    amount: number
  ): SubscriptionCheckoutResponseDto {
    const dto = new SubscriptionCheckoutResponseDto()
    dto.subscriptionId = subscriptionId
    dto.providerSubscriptionId = providerSubscriptionId
    dto.paymentUrl = paymentUrl
    dto.status = status
    dto.amount = amount
    dto.currency = 'BRL'
    return dto
  }
}

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly subscriptionLifecycleService: SubscriptionLifecycleService,
    private readonly planService: PlanService,
    private readonly configService: ConfigService
  ) {}

  // ⛔ DEAD CODE (2026-05-20 decision): This entire endpoint is marked for deletion.
  // POST /subscriptions/checkout is a dead code leftover from the migration from
  // single-payment to recurring subscription mode. It creates subscriptions with
  // tenantId='checkout-pending' (orphaned), is @Public() (security risk), and has
  // no webhook handler to link the subscription back to a tenant.
  //
  // All subscription creation now goes through POST /bootstrap/register which:
  //   - Accepts planType (FREE/BASIC/PREMIUM)
  //   - For FREE: provisions immediately without payment
  //   - For paid: creates subscription in provider, provisions after webhook
  //
  // Actions needed:
  //   1. Delete this checkout() method
  //   2. Delete SubscriptionCheckoutDto class
  //   3. Delete SubscriptionCheckoutResponseDto class
  //   4. Remove the @Post('checkout') route
  //
  // Note: SubscriptionService.createSubscription() is also only called by this
  // dead endpoint and should be reviewed for deletion or repurposing.
  //
  // See docs/USER-STORIES.md §2C for the confirmed decision.
  @Public()
  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a subscription and return payment URL for checkout'
  })
  @ApiBody({
    description: 'Subscription checkout request',
    schema: {
      type: 'object',
      properties: {
        planType: {
          type: 'string',
          enum: ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'],
          example: 'BASIC'
        },
        payerEmail: { type: 'string', example: 'customer@email.com' },
        payerName: { type: 'string', example: 'Customer Name' },
        tenantId: { type: 'string', example: 'tenant-uuid' }
      },
      required: ['planType', 'payerEmail', 'payerName']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Subscription created. Payment URL returned for checkout.',
    type: SubscriptionCheckoutResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid plan type or missing fields'
  })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async checkout(
    @Body() dto: SubscriptionCheckoutDto
  ): Promise<SubscriptionCheckoutResponseDto> {
    // TODO: zod validate dto

    // Build platform context (public endpoint, no authenticated user)
    const ctx: RequestContext = {
      userId: 'system',
      scope: UserScope.PLATFORM,
      roles: [],
      impersonatedTenantId: null
    }

    // Calculate price using PlanService (backend is source of truth)
    // Note: price calculation is handled internally by the subscription service
    await this.planService.calculatePrice(dto.planType, 0, ctx)

    // Get plan for trial days
    // Note: trial days are handled internally by the subscription service
    await this.planService.getByType(dto.planType, ctx)

    // URLs for payment flow
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000'
    )
    const backendUrl = this.configService.get<string>(
      'BACKEND_URL',
      'http://localhost:3001'
    )

    // Create subscription via SubscriptionService
    const result = await this.subscriptionService.createSubscription(
      {
        tenantId: dto.tenantId ?? 'checkout-pending',
        planType: dto.planType,
        payerEmail: dto.payerEmail,
        payerName: dto.payerName,
        backUrlSuccess: `${frontendUrl}/subscriptions/success`,
        backUrlPending: `${frontendUrl}/subscriptions/pending`,
        backUrlFailure: `${frontendUrl}/subscriptions/failure`,
        webhookUrl: `${backendUrl}/subscriptions/webhook`
      },
      ctx
    )

    // Use paymentUrl from provider result (authoritative source, not constructed frontend route)
    const paymentUrl = result.paymentUrl

    if (!paymentUrl) {
      throw new Error('Subscription provider returned no checkout URL')
    }

    return SubscriptionCheckoutResponseDto.from(
      result.subscription.id.value,
      result.subscription.providerSubscriptionId,
      paymentUrl,
      result.subscription.status,
      result.subscription.currentAmount
    )
  }

  // TODO: Add rate limiting for webhook endpoint (e.g., @Throttle() decorator).
  // This will be addressed when the throttler module is configured for the app.
  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Handle subscription provider webhook notifications'
  })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({
    status: 200,
    description:
      'Invalid webhook signature — request acknowledged without processing'
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async handleWebhook(
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
    @Query('topic') topic?: string
  ): Promise<{ processed: boolean }> {
    // TODO: zod validate input

    const resolvedTopic =
      (body.topic as string) ?? topic ?? (body.type as string) ?? 'unknown'

    const result = await this.subscriptionService.processWebhook(
      body,
      headers,
      resolvedTopic
    )

    return result
  }

  // ─────────────────────────────────────────────
  // Phase 8: Lifecycle management endpoints
  // ─────────────────────────────────────────────

  // TODO (2026-05-20 decisions): Add plan change endpoint.
  // This endpoint is documented in EPIC_007 but not yet implemented.
  //
  // PATCH /subscriptions/me/change-plan
  // Guard: @Authorize(Action.Update, Subscription) — tenant-scoped
  // Request: { newPlanType: PlanType }
  // Response: {
  //   subscriptionId: string,
  //   oldPlanType: PlanType,
  //   newPlanType: PlanType,
  //   effectiveFrom: Date,        // currentPeriodEnd
  //   currentAmount: number,
  //   newAmount: number,
  //   pendingChange: boolean      // true = stored, will apply at cycle end
  // }
  //
  // Flow:
  //   1. Validate subscription is modifiable (not EXPIRED/CANCELED)
  //   2. Validate not during grace period
  //   3. Validate target plan is active + public
  //   4. If downgrade: validate user/product/revision counts ≤ new plan limits
  //   5. If FREE → Paid: branch to create provider subscription (onboarding flow)
  //   6. Store pending change on subscription entity
  //   7. Return confirmation with effective date
  //
  // See docs/USER-STORIES.md §4C for the confirmed flow diagram.

  // TODO: Add rate limiting or API-key protection for cron endpoints.
  // These lifecycle endpoints should be called by scheduled jobs (cron),
  // not by user requests. Consider adding:
  //   - API key validation via custom guard
  //   - IP whitelist for cron job servers
  //   - Rate limiting to prevent abuse
  // This will be addressed when the throttler module is configured for the app.
  @Post('lifecycle/sync')
  @Authorize(Action.Manage, 'all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Synchronize all subscriptions with the payment provider',
    description:
      'Runs a full sync of all local subscriptions against the payment provider. ' +
      'Catches missed webhooks and state drift. Should be run periodically (e.g., daily via cron).'
  })
  @ApiResponse({
    status: 200,
    description: 'Sync completed successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 42 },
        synced: { type: 'number', example: 3 },
        unchanged: { type: 'number', example: 38 },
        errors: { type: 'number', example: 1 }
      }
    }
  })
  async syncWithProvider(@Req() request: Request): Promise<{
    total: number
    synced: number
    unchanged: number
    errors: number
  }> {
    return this.subscriptionLifecycleService.syncAllSubscriptionsWithProvider(
      request.context
    )
  }

  @Post('lifecycle/check-grace-periods')
  @Authorize(Action.Manage, 'all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check and expire grace periods',
    description:
      'Checks all subscriptions in GRACE status and expires those whose grace period has ended. ' +
      'Also triggers tenant cleanup (soft-lock) for expired subscriptions. ' +
      'Should be run periodically (e.g., hourly via cron).'
  })
  @ApiResponse({
    status: 200,
    description: 'Grace period check completed',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 5 },
        expired: { type: 'number', example: 2 },
        stillInGrace: { type: 'number', example: 3 },
        tenantsLocked: { type: 'number', example: 2 }
      }
    }
  })
  async checkGracePeriods(@Req() request: Request): Promise<{
    total: number
    expired: number
    stillInGrace: number
    tenantsLocked: number
  }> {
    return this.subscriptionLifecycleService.checkAndExpireGracePeriods(
      request.context
    )
  }

  @Post('lifecycle/cleanup/:tenantId')
  @Authorize(Action.Manage, 'all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Clean up tenant after subscription expiry',
    description:
      'Soft-locks a tenant whose subscription has expired. Creates an AuditLog event. ' +
      'Idempotent: returns immediately if tenant is already locked.'
  })
  @ApiResponse({
    status: 200,
    description: 'Tenant cleanup completed',
    schema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', example: 'tenant-uuid' },
        action: {
          type: 'string',
          enum: ['locked', 'already_locked', 'not_found'],
          example: 'locked'
        }
      }
    }
  })
  async cleanupTenant(
    @Param('tenantId') tenantId: string,
    @Req() request: Request
  ): Promise<{
    tenantId: string
    action: 'locked' | 'already_locked' | 'not_found'
  }> {
    // TODO: zod validate input

    return this.subscriptionLifecycleService.handleTenantCleanup(
      tenantId,
      request.context
    )
  }
}
