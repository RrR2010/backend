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

export class UserAlreadyAdminError extends Error {
  constructor() {
    super('User is already an admin');
  }
}

export class UserAlreadyMemberError extends Error {
  constructor() {
    super('User is already a member');
  }
}
