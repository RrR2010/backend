import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Headers,
  Param,
  UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import type { Request, Response } from 'express'
import { Public } from '@shared/decorators/public.decorator'
import { BootstrapService } from '@bootstrap/bootstrap.service'
import {
  BootstrapRegisterDto,
  BootstrapRegisterResponseDto
} from '@bootstrap/bootstrap.dto'
import crypto from 'crypto'

@ApiTags('Bootstrap')
@Controller('bootstrap')
export class BootstrapController {
  constructor(
    private readonly bootstrapService: BootstrapService,
    private readonly configService: ConfigService
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Initiate tenant registration and create payment preference'
  })
  @ApiResponse({
    status: 201,
    description:
      'Registration created. Handoff token delivered in X-Handoff-Token header.',
    type: BootstrapRegisterResponseDto,
    headers: {
      'X-Handoff-Token': {
        description:
          'One-time handoff token for session claim. Store securely in frontend state.',
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

  @Public()
  @Post('webhook/payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle payment provider webhook notifications' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string>
  ): Promise<void> {
    await this.bootstrapService.handleWebhook(body, headers)
  }

  @Public()
  @Post('retry/:registrationId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retry provisioning for a registration stuck in PROVISIONING state'
  })
  @ApiResponse({
    status: 200,
    description: 'Provisioning retried successfully or already provisioned'
  })
  @ApiResponse({ status: 401, description: 'Invalid operator secret' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  @ApiResponse({ status: 409, description: 'Registration in invalid state' })
  async retryProvisioning(
    @Param('registrationId') registrationId: string,
    @Headers('x-operator-secret') operatorSecret: string
  ): Promise<{
    status: 'provisioned' | 'already-provisioned'
    registrationId: string
  }> {
    // Finding 3: Use timing-safe comparison for operator secret
    const expectedSecret = this.configService.get<string>('OPERATOR_SECRET')
    if (!expectedSecret) {
      throw new UnauthorizedException('Invalid operator secret')
    }
    const expectedBuffer = Buffer.from(expectedSecret)
    const providedBuffer = Buffer.from(operatorSecret ?? '')
    if (
      expectedBuffer.length !== providedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, providedBuffer)
    ) {
      throw new UnauthorizedException('Invalid operator secret')
    }

    const result = await this.bootstrapService.retryProvisioning(registrationId)

    // Finding 8: Return minimal info — no entity IDs leaked
    if (
      result &&
      'status' in result &&
      result.status === 'already-provisioned'
    ) {
      return { status: 'already-provisioned', registrationId }
    }

    return { status: 'provisioned', registrationId }
  }
}
