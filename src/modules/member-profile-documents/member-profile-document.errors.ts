import { HttpException, HttpStatus } from '@nestjs/common'

export class MemberProfileDocumentNotFoundError extends HttpException {
  constructor(id?: string) {
    super(
      {
        message: id
          ? `Member profile document with id ${id} not found`
          : 'Member profile document not found',
        code: 'MEMBER_PROFILE_DOCUMENT_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}

export class MemberProfileDocumentAlreadyExistsError extends HttpException {
  constructor(memberProfileId: string, documentType: string) {
    super(
      {
        message: `Member profile document already exists for profile ${memberProfileId} with type ${documentType}`,
        code: 'MEMBER_PROFILE_DOCUMENT_ALREADY_EXISTS'
      },
      HttpStatus.CONFLICT
    )
  }
}
