import { ApiProperty } from '@nestjs/swagger';

interface SessionResponse {
  id: string;
  deviceInfo?: string;
  ipAddress?: string;
  createdAt: Date;
  lastUsedAt: Date;
  isActive: boolean;
}

export class SessionResponseDto implements SessionResponse {
  @ApiProperty({
    description: 'Unique session identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Device information',
    example: 'Chrome/120.0 (Windows 11)',
    nullable: true,
  })
  deviceInfo?: string;

  @ApiProperty({
    description: 'IP address of the session',
    example: '192.168.1.100',
    nullable: true,
  })
  ipAddress?: string;

  @ApiProperty({
    description: 'When the session was created',
    example: '2026-04-20T10:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'When the session was last used (for refresh)',
    example: '2026-04-20T15:30:00.000Z',
  })
  lastUsedAt!: Date;

  @ApiProperty({
    description: 'Whether the session is currently active',
    example: true,
  })
  isActive!: boolean;

  static fromSession(session: {
    id: string;
    deviceInfo?: string | null;
    ipAddress?: string | null;
    createdAt: Date;
    lastUsedAt: Date;
    isRevoked: boolean;
    revokedAt?: Date | null;
  }): SessionResponseDto {
    const dto = new SessionResponseDto();
    dto.id = session.id;
    if (session.deviceInfo) {
      dto.deviceInfo = session.deviceInfo;
    }
    if (session.ipAddress) {
      dto.ipAddress = session.ipAddress;
    }
    dto.createdAt = session.createdAt;
    dto.lastUsedAt = session.lastUsedAt;
    dto.isActive = !session.isRevoked && session.revokedAt === null;
    return dto;
  }
}

export class ListSessionsResponseDto {
  @ApiProperty({
    description: 'List of active sessions for the user',
    type: [SessionResponseDto],
  })
  sessions!: SessionResponseDto[];
}
