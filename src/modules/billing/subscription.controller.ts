import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Headers,
  Query,
  Param,
  Req,
  Inject,
  Optional,
  forwardRef,
  Logger,
  Get,
  Patch,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  DefaultValuePipe,
  ParseIntPipe
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { Public } from '@shared/decorators/public.decorator'
import { Authorize } from '@authorization/authorization.decorators'
import { Action, RequestContext } from '@authorization/authorization.types'
import { SubscriptionService } from '@billing/subscription.service'
import { SubscriptionLifecycleService } from '@billing/subscription-lifecycle.service'
import { PlanService } from '@billing/plan.service'
import { BootstrapService } from '@bootstrap/bootstrap.service'
import { UserScope, PlatformRole } from '@users/user.types'
import {
  SubscriptionResponseDto,
  ChangePlanRequestDto,
  ChangePlanResponseDto,
  AddUserRequestDto,
  AddUserResponseDto,
  CancelSubscriptionRequestDto,
  EventsResponseDto
} from '@billing/subscription.dto'
import type { Request } from 'express'

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly subscriptionLifecycleService: SubscriptionLifecycleService,
    private readonly planService: PlanService,
    @Optional()
    @Inject(forwardRef(() => BootstrapService))
    private readonly bootstrapService?: BootstrapService
  ) {}

  private readonly logger = new Logger(SubscriptionController.name)

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

    // Fallback: onboarding preapproval events where no local subscription exists yet.
    // The providerSubscriptionId is returned when processWebhook detects an
    // onboarding scenario (no local subscription found for a subscription_preapproval event).
    if (
      !result.processed &&
      result.providerSubscriptionId &&
      resolvedTopic === 'subscription_preapproval' &&
      this.bootstrapService
    ) {
      try {
        const ctx: RequestContext = {
          userId: 'system',
          scope: UserScope.PLATFORM,
          roles: [] as PlatformRole[],
          impersonatedTenantId: null
        }
        const onboardingResult =
          await this.bootstrapService.handleOnboardingWebhook(
            result.providerSubscriptionId,
            ctx
          )
        return onboardingResult
      } catch (error) {
        // Log but don't throw — return { processed: false } to let MP retry
        this.logger.error('Onboarding webhook handler failed', {
          providerSubscriptionId: result.providerSubscriptionId,
          error: error instanceof Error ? error.message : String(error)
        })
        return { processed: false }
      }
    }

    return result
  }

  /**
   * Safely extracts the tenant ID from the request context.
   * The @Authorize() decorator guarantees the request is tenant-scoped,
   * but TypeScript's discriminated union doesn't narrow the type automatically.
   */
  private getTenantId(request: Request): string {
    if (request.context.scope !== UserScope.TENANT) {
      throw new ForbiddenException('Not a tenant-scoped request')
    }
    // TypeScript narrows tenantId as required here after the UserScope.TENANT check
    return (request.context as RequestContext & { tenantId: string }).tenantId
  }

  // ─────────────────────────────────────────────
  // Phase 9: User-facing subscription endpoints
  // ─────────────────────────────────────────────

  // ── Task 76: GET /subscriptions/me ────────────

  @Get('me')
  @Authorize(Action.Read, 'all')
  @ApiOperation({ summary: 'Get current subscription for the authenticated tenant' })
  @ApiResponse({ status: 200, type: SubscriptionResponseDto })
  @ApiResponse({ status: 404, description: 'No subscription found' })
  async getCurrentSubscription(
    @Req() request: Request
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionService.getCurrentSubscription(
      this.getTenantId(request),
      request.context
    )
    if (!subscription) {
      throw new NotFoundException('No subscription found for this tenant')
    }

    // Look up plan for maxProducts and maxRevisions
    let maxProducts: number | null = null
    let maxRevisions: number | null = null
    try {
      const plan = await this.planService.getByType(
        subscription.planType,
        request.context
      )
      maxProducts = plan.maxProducts
      maxRevisions = plan.maxRevisions
    } catch {
      // Silently ignore — nullable fields stay null
    }

    // Fetch usage counts for the subscription dashboard
    const usageCounts = await this.subscriptionService.getUsageCounts(
      this.getTenantId(request),
      request.context
    )

    return SubscriptionResponseDto.fromDomainWithPlan(
      subscription,
      maxProducts,
      maxRevisions,
      usageCounts.currentProducts,
      usageCounts.currentActiveUsers,
      usageCounts.currentRevisions
    )
  }

  // ── Task 77: POST /subscriptions/me/pause ─────

  @Post('me/pause')
  @Authorize(Action.Update, 'all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pause the current subscription' })
  @ApiResponse({ status: 200, type: SubscriptionResponseDto })
  @ApiResponse({ status: 409, description: 'Subscription cannot be paused' })
  async pauseSubscription(
    @Req() request: Request
  ): Promise<SubscriptionResponseDto> {
    const tenantId = this.getTenantId(request)
    const subscription = await this.subscriptionService.pauseSubscription(
      tenantId,
      request.context
    )

    // Fetch usage counts to provide complete metrics in the response
    const usageCounts = await this.subscriptionService.getUsageCounts(
      tenantId,
      request.context
    )

    // Look up plan for maxProducts and maxRevisions
    let maxProducts: number | null = null
    let maxRevisions: number | null = null
    try {
      const plan = await this.planService.getByType(
        subscription.planType,
        request.context
      )
      maxProducts = plan.maxProducts
      maxRevisions = plan.maxRevisions
    } catch {
      // Silently ignore — nullable fields stay null
    }

    return SubscriptionResponseDto.fromDomainWithPlan(
      subscription,
      maxProducts,
      maxRevisions,
      usageCounts.currentProducts,
      usageCounts.currentActiveUsers,
      usageCounts.currentRevisions
    )
  }

  // ── Task 77: POST /subscriptions/me/resume ────

  @Post('me/resume')
  @Authorize(Action.Update, 'all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resume a paused subscription' })
  @ApiResponse({ status: 200, type: SubscriptionResponseDto })
  @ApiResponse({ status: 409, description: 'Subscription cannot be resumed' })
  async resumeSubscription(
    @Req() request: Request
  ): Promise<SubscriptionResponseDto> {
    const tenantId = this.getTenantId(request)
    const subscription = await this.subscriptionService.resumeSubscription(
      tenantId,
      request.context
    )

    // Fetch usage counts to provide complete metrics in the response
    const usageCounts = await this.subscriptionService.getUsageCounts(
      tenantId,
      request.context
    )

    // Look up plan for maxProducts and maxRevisions
    let maxProducts: number | null = null
    let maxRevisions: number | null = null
    try {
      const plan = await this.planService.getByType(
        subscription.planType,
        request.context
      )
      maxProducts = plan.maxProducts
      maxRevisions = plan.maxRevisions
    } catch {
      // Silently ignore — nullable fields stay null
    }

    return SubscriptionResponseDto.fromDomainWithPlan(
      subscription,
      maxProducts,
      maxRevisions,
      usageCounts.currentProducts,
      usageCounts.currentActiveUsers,
      usageCounts.currentRevisions
    )
  }

  // ── Task 78: POST /subscriptions/me/cancel ────

  @Post('me/cancel')
  @Authorize(Action.Update, 'all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel the current subscription' })
  @ApiResponse({ status: 200, type: SubscriptionResponseDto })
  @ApiResponse({ status: 409, description: 'Subscription cannot be canceled' })
  async cancelSubscription(
    @Body() dto: CancelSubscriptionRequestDto,
    @Req() request: Request
  ): Promise<SubscriptionResponseDto> {
    const cancelAtPeriodEnd = dto.cancelAtPeriodEnd ?? true
    const tenantId = this.getTenantId(request)
    const subscription = await this.subscriptionService.cancelSubscription(
      tenantId,
      cancelAtPeriodEnd,
      request.context
    )

    // Fetch usage counts to provide complete metrics in the response
    const usageCounts = await this.subscriptionService.getUsageCounts(
      tenantId,
      request.context
    )

    // Look up plan for maxProducts and maxRevisions
    let maxProducts: number | null = null
    let maxRevisions: number | null = null
    try {
      const plan = await this.planService.getByType(
        subscription.planType,
        request.context
      )
      maxProducts = plan.maxProducts
      maxRevisions = plan.maxRevisions
    } catch {
      // Silently ignore — nullable fields stay null
    }

    return SubscriptionResponseDto.fromDomainWithPlan(
      subscription,
      maxProducts,
      maxRevisions,
      usageCounts.currentProducts,
      usageCounts.currentActiveUsers,
      usageCounts.currentRevisions
    )
  }

  // ── Task 79: PATCH /subscriptions/me/change-plan ──

  @Patch('me/change-plan')
  @Authorize(Action.Update, 'all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a plan change (stored as pending until cycle end)' })
  @ApiResponse({ status: 200, type: ChangePlanResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid plan transition' })
  @ApiResponse({ status: 409, description: 'Subscription cannot be modified' })
  async changePlan(
    @Body() dto: ChangePlanRequestDto,
    @Req() request: Request
  ): Promise<ChangePlanResponseDto> {
    const result = await this.subscriptionService.changePlan(
      {
        tenantId: this.getTenantId(request),
        newPlanType: dto.newPlanType
      },
      request.context
    )
    return ChangePlanResponseDto.fromDomain(
      result.subscription,
      result.oldPlanType,
      result.currentAmount,
      result.paymentUrl ?? null
    )
  }

  // ── Task 80: POST /subscriptions/me/add-user ──

  @Post('me/add-user')
  @Authorize(Action.Update, 'all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add a user to the subscription and recalculate' })
  @ApiResponse({ status: 200, type: AddUserResponseDto })
  @ApiResponse({ status: 400, description: 'Plan does not allow additional users' })
  async addUser(
    @Body() dto: AddUserRequestDto,
    @Req() request: Request
  ): Promise<AddUserResponseDto> {
    // Validate confirmation
    if (!dto.confirmAdditionalCost) {
      // Look up the plan to show the cost
      const subscription = await this.subscriptionService.getCurrentSubscription(
        this.getTenantId(request),
        request.context
      )
      if (!subscription) {
        throw new NotFoundException('No subscription found for this tenant')
      }
      const plan = await this.planService.getByType(
        subscription.planType,
        request.context
      )
      const additionalCost =
        plan.additionalUserPrice !== null
          ? plan.additionalUserPrice
          : 0

      return AddUserResponseDto.fromDomain(subscription, additionalCost, true)
    }

    const subscription = await this.subscriptionService.addUserAndRecalculate(
      { tenantId: this.getTenantId(request), userId: dto.userId },
      request.context
    )

    const plan = await this.planService.getByType(
      subscription.planType,
      request.context
    )
    const additionalCost =
      plan.additionalUserPrice !== null ? plan.additionalUserPrice : 0

    return AddUserResponseDto.fromDomain(subscription, additionalCost, false)
  }

  // ── Task 81: GET /subscriptions/me/events ─────

  @Get('events')
  @Authorize(Action.Read, 'all')
  @ApiOperation({ summary: 'Get subscription events with pagination' })
  @ApiResponse({ status: 200, type: EventsResponseDto })
  async getEvents(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Req() request: Request
  ): Promise<EventsResponseDto> {
    limit = Math.min(limit, 100)
    const result = await this.subscriptionService.getEvents(
      this.getTenantId(request),
      { page, limit },
      request.context
    )
    return EventsResponseDto.fromResult(result)
  }

  // ─────────────────────────────────────────────
  // Phase 8: Lifecycle management endpoints
  // ─────────────────────────────────────────────

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

  @Post('lifecycle/apply-pending-changes')
  @Authorize(Action.Manage, 'all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Apply all due pending plan changes',
    description:
      'Finds all subscriptions with pendingPlanType set and pendingEffectiveFrom <= now(), ' +
      'then applies the changes. Updates the provider with the new amount. ' +
      'Should be run periodically (e.g., daily via cron).'
  })
  @ApiResponse({
    status: 200,
    description: 'Pending changes applied',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 5 },
        applied: { type: 'number', example: 3 },
        errors: { type: 'number', example: 0 }
      }
    }
  })
  async applyPendingChanges(@Req() request: Request): Promise<{
    total: number
    applied: number
    errors: number
  }> {
    return this.subscriptionService.applyAllDuePendingChanges(
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
