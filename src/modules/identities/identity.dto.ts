import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Identity } from '@identities/identity.entity'
import { AuthProviderType } from '@authentication/authentication.types'

export class CreateIdentityResponseDto {
  @ApiProperty()
  userId!: string

  @ApiProperty({ enum: AuthProviderType })
  provider!: AuthProviderType

  @ApiProperty()
  identifier!: string

  static fromDomain(identity: Identity): CreateIdentityResponseDto {
    return {
      userId: identity.userId,
      provider: identity.authProviderType,
      identifier: identity.identifier
    }
  }
}

export class CreateIdentityDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User ID that owns this identity.'
  })
  userId!: string

  @ApiProperty({
    enum: AuthProviderType,
    example: AuthProviderType.EMAIL,
    description: 'Authentication provider type: EMAIL or CPF.'
  })
  provider!: AuthProviderType

  @ApiProperty({
    example: 'user@example.com',
    description: 'The identity identifier (email, CPF, etc.).'
  })
  identifier!: string

  @ApiPropertyOptional({
    example: 'imJoao123*',
    description: 'Password for the identity if it is a user with a password.'
  })
  secret!: string | null
}

export class IdentityResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  userId!: string

  @ApiProperty({ enum: AuthProviderType })
  provider!: AuthProviderType

  @ApiProperty()
  identifier!: string

  static fromDomain(identity: Identity): IdentityResponseDto {
    return {
      id: identity.id.value,
      userId: identity.userId,
      provider: identity.authProviderType,
      identifier: identity.identifier
    }
  }
}
