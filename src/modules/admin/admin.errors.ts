import {
  HttpException,
  HttpStatus,
  UnauthorizedException
} from '@nestjs/common'

export class BootstrapAlreadyExistsError extends HttpException {
  constructor() {
    super('Bootstrap not needed - users already exist', HttpStatus.FORBIDDEN)
  }
}

export class BootstrapInvalidKeyError extends UnauthorizedException {
  constructor() {
    super('Invalid bootstrap key')
  }
}
