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
  Get,
  UnauthorizedException,
  ForbiddenException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import type { Request, Response } from 'express'
import { Public } from '@shared/decorators/public.decorator'
import { BootstrapService } from '@bootstrap/bootstrap.service'
import {
  BootstrapRegisterDto,
  BootstrapRegisterResponseDto,
  BootstrapStatusResponseDto,
  ClaimSessionDto,
  ClaimSessionResponseDto
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
    summary:
      'Initiate tenant registration and create subscription for onboarding'
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
    if (result.handoffToken !== null) {
      res.setHeader('X-Handoff-Token', result.handoffToken)
    }

    return BootstrapRegisterResponseDto.from(
      result.registrationId,
      result.paymentUrl,
      result.expiresAt,
      result.subscriptionId
    )
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

  @Public()
  @Get('status/:registrationId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check registration status (state only)' })
  @ApiResponse({
    status: 200,
    description: 'Registration status',
    type: BootstrapStatusResponseDto
  })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  async getStatus(
    @Param('registrationId') registrationId: string
  ): Promise<BootstrapStatusResponseDto> {
    return this.bootstrapService.getStatus(registrationId)
  }

  @Public()
  @Post('claim-session')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Claim session using registration ID and handoff token'
  })
  @ApiResponse({
    status: 200,
    description: 'Session created, cookies set',
    type: ClaimSessionResponseDto
  })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  @ApiResponse({ status: 401, description: 'Invalid or expired handoff token' })
  @ApiResponse({ status: 409, description: 'Registration in invalid state' })
  async claimSession(
    @Body() dto: ClaimSessionDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<ClaimSessionResponseDto> {
    return this.bootstrapService.claimSession(dto, req, res)
  }

  // TODO (2026-05-20 decision): After webhook consolidation, this endpoint
  // should be updated. For paid plans it should trigger the subscription webhook
  // handler directly. For FREE plans this endpoint is not needed (FREE skips
  // payment entirely). Consider renaming or removing based on the new flow.
  @Public()
  @Post('fake-approve/:registrationId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[DEV ONLY] Simulate payment approval for a registration'
  })
  @ApiResponse({
    status: 200,
    description: 'Registration approved and provisioning triggered'
  })
  @ApiResponse({
    status: 403,
    description: 'Fake approval is disabled in production'
  })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  @ApiResponse({ status: 409, description: 'Registration in invalid state' })
  async fakeApprove(
    @Param('registrationId') registrationId: string
  ): Promise<{ status: 'approved' }> {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development')
    const paymentProvider = this.configService.get<string>(
      'PAYMENT_PROVIDER',
      'fake'
    )

    if (nodeEnv === 'production' || paymentProvider !== 'fake') {
      throw new ForbiddenException(
        'Fake approval is disabled in this environment'
      )
    }
    await this.bootstrapService.fakeApproveRegistration(registrationId)
    return { status: 'approved' }
  }

  @Public()
  @Get('fake-approve/by-provider-subscription/:providerSubscriptionId')
  @ApiOperation({
    summary:
      '[DEV ONLY] Simulate payment approval by provider subscription ID'
  })
  @ApiResponse({ status: 302, description: 'Redirects to bootstrap success page' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  async fakeApproveByProviderSubscription(
    @Param('providerSubscriptionId') providerSubscriptionId: string,
    @Res() res: Response
  ) {
    const registrationId =
      await this.bootstrapService.fakeApproveByProviderSubscriptionId(
        providerSubscriptionId
      )

    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000'
    )
    res.redirect(
      `${frontendUrl}/bootstrap/pending?registrationId=${registrationId}`
    )
  }

  @Public()
  @Get('fake-approve/fail/by-provider-subscription/:providerSubscriptionId')
  @ApiOperation({
    summary: '[DEV ONLY] Simulate payment failure by provider subscription ID'
  })
  @ApiResponse({ status: 302, description: 'Redirects to bootstrap failure page' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  async fakeFailByProviderSubscription(
    @Param('providerSubscriptionId') providerSubscriptionId: string,
    @Res() res: Response
  ) {
    const registrationId =
      await this.bootstrapService.fakeFailByProviderSubscriptionId(
        providerSubscriptionId
      )

    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000'
    )
    res.redirect(
      `${frontendUrl}/bootstrap/failure?registrationId=${registrationId}`
    )
  }
}
