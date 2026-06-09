import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Request } from 'express'

/**
 * Validates the Asaas webhook token from the `asaas-access-token` header
 * against the `ASAAS_WEBHOOK_AUTH_TOKEN` environment variable.
 *
 * Applies to the POST /webhooks/asaas endpoint. Returns 401 if the token
 * is missing or does not match.
 */
@Injectable()
export class AsaasWebhookGuard implements CanActivate {
  private readonly logger = new Logger(AsaasWebhookGuard.name)

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()

    const token = request.headers['asaas-access-token']
    if (!token || typeof token !== 'string') {
      this.logger.warn('Webhook missing asaas-access-token header')
      throw new UnauthorizedException('Missing webhook authentication token')
    }

    const expectedToken = this.configService.get<string>(
      'ASAAS_WEBHOOK_AUTH_TOKEN',
      ''
    )

    if (!expectedToken) {
      this.logger.error(
        'ASAAS_WEBHOOK_AUTH_TOKEN is not configured — webhook validation cannot proceed'
      )
      throw new UnauthorizedException('Webhook not configured')
    }

    if (token !== expectedToken) {
      this.logger.warn('Webhook token mismatch — rejecting request')
      throw new UnauthorizedException('Invalid webhook authentication token')
    }

    return true
  }
}
