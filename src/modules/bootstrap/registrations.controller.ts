import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { Public } from '@shared/decorators/public.decorator'
import { BootstrapService } from '@bootstrap/bootstrap.service'
import { BootstrapStatusResponseDto } from '@bootstrap/bootstrap.dto'
import { RegistrationNotFoundError } from '@bootstrap/bootstrap.errors'

/**
 * Public registration status polling endpoint.
 *
 * The externalRef is a UUID returned during registration and acts as a
 * one-time bearer token. The endpoint requires no authentication.
 */
@ApiTags('Registrations')
@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly bootstrapService: BootstrapService) {}

  @Public()
  @Get(':externalRef/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Poll registration status by externalRef (unauthenticated, uses externalRef as token)'
  })
  @ApiResponse({
    status: 200,
    description: 'Registration status',
    type: BootstrapStatusResponseDto
  })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  async getStatus(
    @Param('externalRef') externalRef: string
  ): Promise<BootstrapStatusResponseDto> {
    try {
      return await this.bootstrapService.getStatusByExternalRef(externalRef)
    } catch (error) {
      if (error instanceof RegistrationNotFoundError) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
