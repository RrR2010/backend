import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import {
  TokenService,
  PreAuthPayload,
  AuthTokenPayload,
} from '@modules/authentication/domain/token.service';

@Injectable()
export class JwtService implements TokenService {
  constructor(private readonly nestJwtService: NestJwtService) {}

  signPreAuth(payload: PreAuthPayload): string {
    return this.nestJwtService.sign(payload, { expiresIn: '5m' });
  }

  sign(payload: AuthTokenPayload): string {
    // Generate unique JTI for token revocation tracking
    const jti = randomUUID();
    return this.nestJwtService.sign({ ...payload, jti }, { expiresIn: '15m' });
  }

  verifyPreAuth(token: string): PreAuthPayload | null {
    try {
      const decoded = this.nestJwtService.verify<PreAuthPayload>(token);
      return decoded.type === 'pre-auth' ? decoded : null;
    } catch {
      return null;
    }
  }

  verify(token: string): AuthTokenPayload | null {
    try {
      return this.nestJwtService.verify<AuthTokenPayload>(token);
    } catch {
      return null;
    }
  }
}
