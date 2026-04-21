import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/infra/prisma.service';
import * as crypto from 'crypto';

export interface RefreshTokenResult {
  token: string;
  expiresAt: Date;
}

export interface ValidateRefreshTokenResult {
  sessionId: string;
  userId: string;
  isValid: boolean;
  isExpired: boolean;
  isRevoked: boolean;
  wasUsed: boolean;
}

@Injectable()
export class RefreshTokenService {
  private static readonly REFRESH_TOKEN_BYTES = 32;
  private static readonly REFRESH_TOKEN_EXPIRY_DAYS = 30;
  private static readonly REFRESH_TOKEN_EXPIRY_HOURS =
    RefreshTokenService.REFRESH_TOKEN_EXPIRY_DAYS * 24;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a cryptographically secure refresh token.
   * Uses crypto.randomBytes() for secure random generation.
   */
  generateRefreshToken(): string {
    return crypto
      .randomBytes(RefreshTokenService.REFRESH_TOKEN_BYTES)
      .toString('hex');
  }

  /**
   * Saves a refresh token to the database.
   * Stores SHA-256 hash of the token, not plain text.
   */
  async saveRefreshToken(
    userId: string,
    refreshToken: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<RefreshTokenResult> {
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setHours(
      expiresAt.getHours() + RefreshTokenService.REFRESH_TOKEN_EXPIRY_HOURS,
    );

    const now = new Date();

    await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash: tokenHash,
        expiresAt,
        lastUsedAt: now,
        isRevoked: false,
        ...(deviceInfo && { deviceInfo }),
        ...(ipAddress && { ipAddress }),
      },
    });

    return {
      token: refreshToken,
      expiresAt,
    };
  }

  /**
   * Validates a refresh token.
   * Checks token validity, expiration, and revocation status.
   * Includes rotation detection - rejects if token was already used (replay attack prevention).
   */
  async validateRefreshToken(
    refreshToken: string,
  ): Promise<ValidateRefreshTokenResult | null> {
    const tokenHash = this.hashToken(refreshToken);

    const session = await this.prisma.session.findFirst({
      where: {
        refreshTokenHash: tokenHash,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!session) {
      return null;
    }

    const now = new Date();
    const isExpired = session.expiresAt < now;
    const isRevoked = session.isRevoked || session.revokedAt !== null;

    return {
      sessionId: session.id,
      userId: session.userId,
      isValid: !isExpired && !isRevoked,
      isExpired,
      isRevoked,
      wasUsed: false,
    };
  }

  /**
   * Rotates a refresh token.
   * Invalidates the old token and creates a new one.
   * This prevents replay attacks by marking the old token as used.
   */
  async rotateRefreshToken(
    refreshToken: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<RefreshTokenResult | null> {
    const validationResult = await this.validateRefreshToken(refreshToken);

    if (!validationResult || !validationResult.isValid) {
      return null;
    }

    await this.prisma.session.update({
      where: {
        id: validationResult.sessionId,
      },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        lastUsedAt: new Date(),
      },
    });

    const newToken = this.generateRefreshToken();

    return this.saveRefreshToken(
      validationResult.userId,
      newToken,
      deviceInfo,
      ipAddress,
    );
  }

  /**
   * Invalidates a refresh token (logout).
   * Marks the session as revoked.
   */
  async revokeRefreshToken(sessionId: string): Promise<void> {
    await this.prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Lists all sessions for a user, excluding revoked ones.
   * Sorted by last used (most recent first).
   */
  async listSessionsByUserId(userId: string): Promise<
    {
      id: string;
      deviceInfo: string | null;
      ipAddress: string | null;
      createdAt: Date;
      lastUsedAt: Date;
      isRevoked: boolean;
      revokedAt: Date | null;
    }[]
  > {
    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
        isRevoked: false,
        revokedAt: null,
      },
      orderBy: {
        lastUsedAt: 'desc',
      },
      select: {
        id: true,
        deviceInfo: true,
        ipAddress: true,
        createdAt: true,
        lastUsedAt: true,
        expiresAt: true,
        isRevoked: true,
        revokedAt: true,
      },
    });

    return sessions;
  }

  /**
   * Hashes a refresh token using SHA-256.
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
