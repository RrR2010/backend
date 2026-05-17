import {
  BaseTokenPayload,
  RefreshTokenPayload
} from '@authentication/authentication.types'
import { Injectable } from '@nestjs/common'
import { JwtService as NestJwtService } from '@nestjs/jwt'
import { StringValue } from 'ms'
import crypto from 'crypto'

export abstract class TokenService {
  abstract sign<T extends BaseTokenPayload>(
    payload: T,
    expiresIn: number | StringValue
  ): string
  abstract signRefreshToken(
    payload: RefreshTokenPayload,
    expiresIn: number | StringValue
  ): string
  abstract verify<T extends BaseTokenPayload>(token: string): T | null
  abstract verifyRefreshToken(token: string): RefreshTokenPayload | null
}

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(private readonly jwt: NestJwtService) {}

  sign<T extends BaseTokenPayload>(
    payload: T,
    expiresIn: number | StringValue
  ): string {
    const uuid = crypto.randomUUID()
    const token = this.jwt.sign<T>(payload, {
      subject: payload.userId,
      jwtid: uuid,
      secret: process.env.JWT_SECRET || 'secret',
      expiresIn
    })
    return token
  }

  signRefreshToken(
    payload: RefreshTokenPayload,
    expiresIn: number | StringValue
  ): string {
    const uuid = crypto.randomUUID()
    const token = this.jwt.sign<RefreshTokenPayload>(payload, {
      subject: payload.userId,
      jwtid: uuid,
      secret:
        process.env.JWT_REFRESH_SECRET ||
        process.env.JWT_SECRET ||
        'refresh-secret',
      expiresIn
    })
    return token
  }

  verify<T extends BaseTokenPayload>(token: string): T | null {
    try {
      return this.jwt.verify<T>(token, {
        secret: process.env.JWT_SECRET || 'secret'
      })
    } catch {
      return null
    }
  }

  verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      return this.jwt.verify<RefreshTokenPayload>(token, {
        secret:
          process.env.JWT_REFRESH_SECRET ||
          process.env.JWT_SECRET ||
          'refresh-secret'
      })
    } catch {
      return null
    }
  }
}
