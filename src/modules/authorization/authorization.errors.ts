import { HttpException, HttpStatus } from '@nestjs/common'

// ============== AUTHENTICATION ERRORS ==============

/**
 * Error thrown when a user attempts to access a protected resource without authentication.
 * Use this when the request lacks a valid JWT token or the token is expired/invalid.
 */
export class UnauthorizedError extends HttpException {
  constructor() {
    super(
      {
        message: 'User is not authenticated',
        code: 'UNAUTHORIZED'
      },
      HttpStatus.UNAUTHORIZED
    )
  }
}

// ============== AUTHORIZATION ERRORS ==============

/**
 * Error thrown when a user is authenticated but denied access to a specific resource.
 * Use this for general access denial cases where more specific authorization errors don't apply.
 */
export class ForbiddenError extends HttpException {
  constructor(message = 'Access denied') {
    super(
      {
        message,
        code: 'FORBIDDEN'
      },
      HttpStatus.FORBIDDEN
    )
  }
}

/**
 * Error thrown when a user lacks the necessary permissions to perform an action.
 * Use this when the user is authenticated but doesn't have CASL permission for the requested operation.
 * The error message is generic to avoid exposing internal permission model details.
 */
export class InsufficientPermissionError extends HttpException {
  constructor(action?: string, subject?: string) {
    super(
      {
        message: 'Insufficient permission to perform this action',
        code: 'INSUFFICIENT_PERMISSION'
      },
      HttpStatus.FORBIDDEN
    )
  }
}

/**
 * Error thrown when a user's JWT token scope is insufficient for the requested operation.
 * Use this when the user is authenticated but lacks the required OAuth scope.
 * The error message is generic to avoid exposing internal scope values.
 */
export class InsufficientScopeError extends HttpException {
  constructor(requiredScope?: string, actualScope?: string) {
    super(
      {
        message: 'Insufficient scope for this operation',
        code: 'INSUFFICIENT_SCOPE'
      },
      HttpStatus.FORBIDDEN
    )
  }
}

// ============== INTERNAL ERRORS ==============

/**
 * Error thrown when an endpoint lacks authorization configuration.
 * This is a development-time error indicating the @UseGuards decorator is missing.
 */
export class AuthorizationNotDefinedError extends HttpException {
  constructor() {
    super(
      {
        message: 'Authorization not defined on endpoint',
        code: 'AUTHORIZATION_NOT_DEFINED'
      },
      HttpStatus.BAD_REQUEST
    )
  }
}

/**
 * Error thrown when CASL ability builder encounters a configuration error.
 * This is an internal error indicating a bug in the authorization definitions.
 */
export class AbilityBuilderError extends HttpException {
  constructor(message = 'Error building CASL ability') {
    super(
      {
        message,
        code: 'ABILITY_BUILDER_ERROR'
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }
}