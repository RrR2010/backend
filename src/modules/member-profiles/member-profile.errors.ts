import { HttpException, HttpStatus } from '@nestjs/common'

export class MemberProfileNotFoundError extends HttpException {
  constructor(id?: string) {
    super(
      {
        message: id ? `Member profile with id ${id} not found` : 'Member profile not found',
        code: 'MEMBER_PROFILE_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}

export class MemberProfileLockedError extends HttpException {
  constructor(id: string) {
    super(
      {
        message: `Member profile with id ${id} is locked and cannot be modified`,
        code: 'MEMBER_PROFILE_LOCKED'
      },
      HttpStatus.LOCKED
    )
  }
}