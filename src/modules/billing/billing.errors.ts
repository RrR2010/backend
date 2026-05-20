import { HttpException, HttpStatus } from '@nestjs/common'

export class PlanNotFoundError extends HttpException {
  constructor(planType: string) {
    super(
      {
        message: `Plan not found: ${planType}`,
        code: 'PLAN_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}

export class PlanInactiveError extends HttpException {
  constructor(planType: string) {
    super(
      {
        message: `Plan is not active: ${planType}`,
        code: 'PLAN_INACTIVE'
      },
      HttpStatus.BAD_REQUEST
    )
  }
}

export class PlanNotPublicError extends HttpException {
  constructor(planType: string) {
    super(
      {
        message: `Plan is not public: ${planType}`,
        code: 'PLAN_NOT_PUBLIC'
      },
      HttpStatus.BAD_REQUEST
    )
  }
}

export class SubscriptionNotFoundError extends HttpException {
  constructor(subscriptionId?: string, tenantId?: string) {
    const message = subscriptionId
      ? `Subscription not found: ${subscriptionId}`
      : `Subscription not found for tenant: ${tenantId}`
    super(
      {
        message,
        code: 'SUBSCRIPTION_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}

export class SubscriptionAlreadyExistsError extends HttpException {
  constructor(tenantId: string) {
    super(
      {
        message: `Subscription already exists for tenant: ${tenantId}`,
        code: 'SUBSCRIPTION_ALREADY_EXISTS'
      },
      HttpStatus.CONFLICT
    )
  }
}

export class InvalidPlanTransitionError extends HttpException {
  constructor(fromPlan: string, toPlan: string, reason: string) {
    super(
      {
        message: `Invalid plan transition from ${fromPlan} to ${toPlan}: ${reason}`,
        code: 'INVALID_PLAN_TRANSITION'
      },
      HttpStatus.BAD_REQUEST
    )
  }
}

export class SubscriptionNotModifiableError extends HttpException {
  constructor(subscriptionId: string, currentStatus: string) {
    super(
      {
        message: `Subscription ${subscriptionId} cannot be modified in status: ${currentStatus}`,
        code: 'SUBSCRIPTION_NOT_MODIFIABLE'
      },
      HttpStatus.CONFLICT
    )
  }
}

export class SubscriptionCannotPauseError extends HttpException {
  constructor(subscriptionId: string) {
    super(
      {
        message: `Subscription ${subscriptionId} cannot be paused`,
        code: 'SUBSCRIPTION_CANNOT_PAUSE'
      },
      HttpStatus.CONFLICT
    )
  }
}

export class SubscriptionCannotResumeError extends HttpException {
  constructor(subscriptionId: string) {
    super(
      {
        message: `Subscription ${subscriptionId} cannot be resumed`,
        code: 'SUBSCRIPTION_CANNOT_RESUME'
      },
      HttpStatus.CONFLICT
    )
  }
}

export class SubscriptionCannotCancelError extends HttpException {
  constructor(subscriptionId: string) {
    super(
      {
        message: `Subscription ${subscriptionId} cannot be canceled`,
        code: 'SUBSCRIPTION_CANNOT_CANCEL'
      },
      HttpStatus.CONFLICT
    )
  }
}

export class SubscriptionCancelConflictError extends HttpException {
  constructor(subscriptionId: string) {
    super(
      {
        message: `Subscription ${subscriptionId} is already set to cancel at period end. Cancel immediately is not allowed while pending cancellation.`,
        code: 'SUBSCRIPTION_CANCEL_CONFLICT'
      },
      HttpStatus.CONFLICT
    )
  }
}

export class AdditionalUsersNotAllowedError extends HttpException {
  constructor(planType: string) {
    super(
      {
        message: `Plan ${planType} does not allow additional users`,
        code: 'ADDITIONAL_USERS_NOT_ALLOWED'
      },
      HttpStatus.BAD_REQUEST
    )
  }
}

export class WebhookEventAlreadyProcessedError extends HttpException {
  constructor(providerEventId: string) {
    super(
      {
        message: `Webhook event already processed: ${providerEventId}`,
        code: 'WEBHOOK_EVENT_ALREADY_PROCESSED'
      },
      HttpStatus.CONFLICT
    )
  }
}

export class WebhookSignatureInvalidError extends HttpException {
  constructor() {
    super(
      {
        message: 'Webhook signature is invalid',
        code: 'WEBHOOK_SIGNATURE_INVALID'
      },
      HttpStatus.UNAUTHORIZED
    )
  }
}
export class ResourceLimitExceededError extends HttpException {
  constructor(resourceType: string, current: number, limit: number) {
    super(
      {
        message: `Resource limit exceeded: ${resourceType} (${current}/${limit})`,
        code: 'RESOURCE_LIMIT_EXCEEDED',
        resourceType,
        current,
        limit
      },
      HttpStatus.FORBIDDEN
    )
  }
}
export class SubscriptionAccessDeniedError extends HttpException {
  constructor(tenantId: string, status: string) {
    super(
      {
        message: `Access denied for tenant ${tenantId}: subscription status is ${status}`,
        code: 'SUBSCRIPTION_ACCESS_DENIED',
        tenantId,
        status
      },
      HttpStatus.FORBIDDEN
    )
  }
}
