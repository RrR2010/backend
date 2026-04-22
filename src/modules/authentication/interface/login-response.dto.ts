import { UserResponseDto } from '@modules/users/interface/user-response.dto';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Authentication scope discriminator.
 * Explicitly indicates whether the user is in platform or tenant scope.
 */
export type AuthScope = 'platform' | 'tenant';

/**
 * Next step hint for the frontend.
 * - 'direct-login': tokens can be issued immediately
 * - 'select-tenant': user must select a tenant before tokens are issued
 */
export type NextStepHint = 'direct-login' | 'select-tenant';

/**
 * Available contexts for multi-tenant support.
 */
export class AvailableContextsDto {
  @ApiProperty({
    example: [
      { tenantId: '123e4567-e89b-12d3-a456-426655440000', tenantName: 'My Company' },
    ],
    description: 'List of tenants user has access to. Empty for platform-only users.',
    required: false,
  })
  tenants?: { tenantId: string; tenantName: string }[];
}

/**
 * Unified login response.
 * Returns explicit context information so the controller doesn't need to branch on roles.
 */
export class LoginResponseDto {
  @ApiProperty({
    example: {
      id: '123e4567-e89b-12d3-a456-426655440000',
      name: 'João da Silva',
      email: 'JoaoDaSilva@email.com',
    },
    description: 'The logged in user.',
  })
  user!: UserResponseDto;

  @ApiProperty({
    example: 'platform',
    description: 'Authentication scope: platform or tenant.',
  })
  scope!: AuthScope;

  @ApiProperty({
    example: { tenants: [] },
    description: 'Available contexts based on user type.',
  })
  availableContexts!: AvailableContextsDto;

  @ApiProperty({
    example: 'direct-login',
    description: 'Next step hint for the frontend.',
  })
  nextStepHint!: NextStepHint;
}