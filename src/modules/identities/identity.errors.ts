import { HttpException, HttpStatus } from '@nestjs/common'

export class IdentityNotFoundError extends HttpException {
  constructor(id?: string) {
    super(
      {
        message: id ? `Identity with id ${id} not found` : 'Identity not found',
        code: 'IDENTITY_NOT_FOUND'
      },
      HttpStatus.NOT_FOUND
    )
  }
}

export class IdentityAlreadyExistsError extends HttpException {
  constructor(provider: string, providerId: string) {
    super(
      {
        message: `Identity already exists for provider ${provider} with id ${providerId}`,
        code: 'IDENTITY_ALREADY_EXISTS'
      },
      HttpStatus.CONFLICT
    )
  }
}
