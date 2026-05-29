import { HttpException, HttpStatus } from '@nestjs/common'

export class MemberProfileNotFoundError extends HttpException {
  constructor() {
    super(
      {
        message: 'Member profile not found',
        code: 'MEMBER_PROFILE_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}

export class MemberProfileLockedError extends HttpException {
  constructor() {
    super(
      {
        message: 'Member profile is locked and cannot be modified',
        code: 'MEMBER_PROFILE_LOCKED'
      },
      HttpStatus.LOCKED
    )
  }
}
