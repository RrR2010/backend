import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import type { Response } from 'express'

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'Internal server error'

    switch (exception.code) {
      case 'P2002':
        status = HttpStatus.CONFLICT
        message = 'A record with this value already exists'
        break
      case 'P2025':
        status = HttpStatus.NOT_FOUND
        message = 'Record not found'
        break
      case 'P2003':
        status = HttpStatus.CONFLICT
        message = 'Referenced record does not exist'
        break
      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR
        message = 'Internal server error'
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: HttpStatus[status],
    })
  }
}
