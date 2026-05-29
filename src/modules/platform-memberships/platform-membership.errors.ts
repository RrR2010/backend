import { HttpException, HttpStatus } from '@nestjs/common'

export class PlatformMembershipNotFoundError extends HttpException {
  constructor(id?: string) {
    super(
      {
        message: id
          ? `Platform membership with id ${id} not found`
          : 'Platform membership not found',
        code: 'PLATFORM_MEMBERSHIP_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}

export class PlatformMembershipAlreadyExistsError extends HttpException {
  constructor(userId: string, role: string) {
    super(
      {
        message: `Platform membership already exists for user ${userId} with role ${role}`,
        code: 'PLATFORM_MEMBERSHIP_ALREADY_EXISTS'
      },
      HttpStatus.CONFLICT
    )
  }
}

export class PlatformMembershipLockedError extends HttpException {
  constructor(id: string) {
    super(
      {
        message: `Platform membership with id ${id} is locked and cannot be modified`,
        code: 'PLATFORM_MEMBERSHIP_LOCKED'
      },
      HttpStatus.LOCKED
    )
  }
}
