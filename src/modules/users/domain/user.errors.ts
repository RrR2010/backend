export class UserAlreadyActiveError extends Error {
  constructor() {
    super('User is already active');
  }
}

export class UserAlreadyInactiveError extends Error {
  constructor() {
    super('User is already inactive');
  }
}
