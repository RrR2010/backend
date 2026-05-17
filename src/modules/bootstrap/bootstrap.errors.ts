export class RegistrationNotFoundError extends Error {
  constructor(registrationId: string) {
    super(`Tenant registration not found: ${registrationId}`)
    this.name = 'RegistrationNotFoundError'
  }
}

export class RegistrationExpiredError extends Error {
  constructor(registrationId: string) {
    super(`Tenant registration has expired: ${registrationId}`)
    this.name = 'RegistrationExpiredError'
  }
}

export class InvalidHandoffTokenError extends Error {
  constructor() {
    super('Invalid or expired handoff token')
    this.name = 'InvalidHandoffTokenError'
  }
}

export class RegistrationStateTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Invalid state transition from ${from} to ${to}`)
    this.name = 'RegistrationStateTransitionError'
  }
}
