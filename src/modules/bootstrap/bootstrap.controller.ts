import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import type { Request, Response } from 'express'
import { Public } from '@shared/decorators/public.decorator'
import { BootstrapService } from '@bootstrap/bootstrap.service'
import {
  BootstrapRegisterDto,
  BootstrapRegisterResponseDto
} from '@bootstrap/bootstrap.dto'

@ApiTags('Bootstrap')
@Controller('bootstrap')
export class BootstrapController {
  constructor(private readonly bootstrapService: BootstrapService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Initiate tenant registration and create payment preference'
  })
  @ApiResponse({
    status: 201,
    description: 'Registration created. Handoff token delivered in X-Handoff-Token header.',
    type: BootstrapRegisterResponseDto,
    headers: {
      'X-Handoff-Token': {
        description: 'One-time handoff token for session claim. Store securely in frontend state.',
        schema: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 409, description: 'Duplicate email or tax ID' })
  async register(
    @Body() dto: BootstrapRegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<BootstrapRegisterResponseDto> {
    const result = await this.bootstrapService.register(
      dto,
      req.ip ?? null,
      req.headers['user-agent'] ?? null
    )

    // Set handoff token in custom header (not in body)
    res.setHeader('X-Handoff-Token', result.handoffToken)

    return BootstrapRegisterResponseDto.from(
      result.registrationId,
      result.paymentUrl,
      result.expiresAt
    )
  }
}
