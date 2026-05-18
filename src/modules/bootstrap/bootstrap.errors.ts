import { HttpException, HttpStatus } from '@nestjs/common'

export class DuplicateEmailError extends HttpException {
  constructor(email: string) {
    super(
      {
        message: `Email already registered: ${email}`,
        code: 'DUPLICATE_EMAIL'
      },
      HttpStatus.CONFLICT
    )
  }
}

export class DuplicateTaxIdError extends HttpException {
  constructor(taxId: string) {
    super(
      {
        message: `Tax ID already registered: ${taxId}`,
        code: 'DUPLICATE_TAX_ID'
      },
      HttpStatus.CONFLICT
    )
  }
}

export class RegistrationExpiredError extends HttpException {
  constructor() {
    super(
      { message: 'Registration has expired', code: 'REGISTRATION_EXPIRED' },
      HttpStatus.GONE
    )
  }
}

export class InvalidHandoffTokenError extends HttpException {
  constructor() {
    super(
      {
        message: 'Invalid or expired handoff token',
        code: 'INVALID_HANDOFF_TOKEN'
      },
      HttpStatus.UNAUTHORIZED
    )
  }
}

export class RegistrationNotFoundError extends HttpException {
  constructor(id?: string) {
    super(
      {
        message: id
          ? `Registration not found: ${id}`
          : 'Registration not found',
        code: 'REGISTRATION_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}

export class ProvisioningError extends Error {
  constructor(message: string, cause?: unknown) {
    super(`Provisioning failed: ${message}`, { cause })
    this.name = 'ProvisioningError'
  }
}

export class InvalidRegistrationStateError extends HttpException {
  constructor() {
    super(
      {
        message: 'Registration is not in a claimable state',
        code: 'INVALID_REGISTRATION_STATE'
      },
      HttpStatus.CONFLICT
    )
  }
}

export class ProvisionedEntityNotFoundError extends HttpException {
  constructor(entityType: string) {
    super(
      {
        message: `Provisioned ${entityType} not found`,
        code: 'PROVISIONED_ENTITY_NOT_FOUND'
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }
}
