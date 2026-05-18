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

  /**
   * Generates a random token and returns both the raw value and its SHA-256 hash.
   * Used for bootstrap handoff tokens and other single-use secrets.
   */
  static generateToken(): { raw: string; hash: string } {
    const raw = crypto.randomBytes(32).toString('hex')
    const hash = crypto.createHash('sha256').update(raw).digest('hex')
    return { raw, hash }
  }

  /**
   * Verifies a raw token against a stored SHA-256 hash.
   * Returns true if the token matches the hash.
   */
  static verifyToken(raw: string, hash: string): boolean {
    const computedHash = crypto.createHash('sha256').update(raw).digest('hex')
    const computedBuffer = Buffer.from(computedHash)
    const hashBuffer = Buffer.from(hash)
    if (computedBuffer.length !== hashBuffer.length) return false
    return crypto.timingSafeEqual(computedBuffer, hashBuffer)
  }
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
