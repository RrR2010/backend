import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { UserResponseDto } from '@users/user.dto'
import { AuthProviderType } from '@authentication/authentication.types'
import { TenantResponseDto } from '@tenants/tenant.dto'

export class BaseLoginDto {
  @ApiProperty({ enum: AuthProviderType })
  providerType!: AuthProviderType
}

export class EmailLoginDto extends BaseLoginDto {
  @ApiProperty({ enum: [AuthProviderType.EMAIL] })
  declare providerType: AuthProviderType.EMAIL

  @ApiProperty()
  email!: string

  @ApiProperty()
  password!: string
}

export class CpfLoginDto extends BaseLoginDto {
  @ApiProperty({ enum: [AuthProviderType.CPF] })
  declare providerType: AuthProviderType.CPF

  @ApiProperty()
  cpf!: string

  @ApiProperty()
  password!: string
}

export class LoginResponseDto {
  @ApiProperty({
    example: {
      id: '123e4567-e89b-12d3-a456-426655440000',
      name: 'João da Silva',
      email: 'JoaoDaSilva@email.com'
    },
    description: 'The logged in user.'
  })
  user!: UserResponseDto

  @ApiProperty({
    example: 'direct-login',
    description: 'Next step hint for the frontend.'
  })
  nextStepHint!: 'direct-login' | 'select-tenant'

  @ApiPropertyOptional({
    example: {
      id: '123e4567-e89b-12d3-a456-426655440000',
      name: 'My Company'
    },
    description: 'The logged in tenant.'
  })
  tenant?: TenantResponseDto

  @ApiPropertyOptional({
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426655440000',
        name: 'My Company'
      },
      {
        id: '123e4567-e89b-12d3-a456-426655440001',
        name: 'Other Company'
      }
    ],
    description: 'The tenant list available for the logged in user to select.'
  })
  tenants?: TenantResponseDto[]
}

export class AuthenticatedUserDto {
  @ApiProperty({
    type: UserResponseDto,
    description: 'The authenticated user.'
  })
  user!: UserResponseDto

  @ApiPropertyOptional({
    type: TenantResponseDto,
    description: 'The current tenant (only for TENANT scope users).'
  })
  tenant?: TenantResponseDto
}
