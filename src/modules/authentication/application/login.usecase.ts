import { Injectable } from '@nestjs/common';
import { UserRepository } from '@modules/users/domain/user.repository';
import { PasswordHasher } from '@modules/authentication/domain/password-hasher';
import { MembershipRepository } from '@modules/memberships/domain/membership.repository';
import { TenantRepository } from '@modules/tenants/domain/tenant.repository';
import { UserResponseDto } from '@modules/users/interface/user-response.dto';
import { TenantResponseDto } from '@modules/tenants/interface/tenant-response.dto';
import { InvalidCredentialsError } from '@modules/authentication/domain/auth.errors';
import type {
  LoginResponseDto as LoginResponseDtoType,
  AuthScope,
  NextStepHint,
  AvailableContextsDto,
} from '@modules/authentication/interface/login-response.dto';

/**
 * Login use case input.
 */
export interface LoginUseCaseInput {
  email: string;
  password: string;
  deviceInfo?: string;
  ipAddress?: string;
}

/**
 * Login use case result.
 * Returns a unified result with explicit scope, available contexts, and next step hint.
 */
export interface LoginUseCaseResult {
  user: UserResponseDto;
  scope: AuthScope;
  availableContexts: AvailableContextsDto;
  nextStepHint: NextStepHint;
}

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly membershipRepository: MembershipRepository,
    private readonly tenantRepository: TenantRepository,
  ) {}

  /**
   * Execute the login use case.
   *
   * Returns a unified result:
   * - Platform users: scope=platform, empty tenants, nextStepHint=direct-login
   * - Tenant users: scope=tenant, tenants array, nextStepHint=select-tenant OR direct-login (if single tenant)
   *
   * The controller is responsible for token issuance logic.
   * Token issuance logic is NOT handled here - it stays in the controller.
   */
  async execute(input: LoginUseCaseInput): Promise<LoginUseCaseResult> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) throw new InvalidCredentialsError();

    const isValidPassword = await this.passwordHasher.compare(
      input.password,
      user.passwordHash,
    );
    if (!isValidPassword) throw new InvalidCredentialsError();

    // Determine if platform user (has platformRoles)
    const hasPlatformRoles =
      user.platformRoles && user.platformRoles.length > 0;

    // Build available contexts based on user type
    const availableContexts: AvailableContextsDto = { tenants: [] };

    if (hasPlatformRoles) {
      // Platform user - no tenant lookup needed
      return {
        user: UserResponseDto.fromDomain(user),
        scope: 'platform' as AuthScope,
        availableContexts,
        nextStepHint: 'direct-login' as NextStepHint,
      };
    }

    // Tenant user - lookup memberships and tenant details
    const memberships = await this.membershipRepository.findByUserId(
      user.id.value,
    );

    const tenantList: { tenantId: string; tenantName: string }[] = [];
    if (memberships) {
      for (const membership of memberships) {
        const tenant = await this.tenantRepository.findById(membership.tenantId);
        if (!tenant) continue;
        tenantList.push({
          tenantId: tenant.id.value,
          tenantName: tenant.name,
        });
      }
    }

    availableContexts.tenants = tenantList;

    // Determine next step hint based on tenant count
    // If only one tenant and auto-login is desired, hint is direct-login
    // Otherwise, user must select a tenant
    const nextStepHint: NextStepHint =
      tenantList.length <= 1 ? 'direct-login' : 'select-tenant';

    return {
      user: UserResponseDto.fromDomain(user),
      scope: 'tenant' as AuthScope,
      availableContexts,
      nextStepHint,
    };
  }
}

/**
 * @deprecated Use LoginUseCaseResult instead.
 * Kept for backward compatibility with existing tests during migration.
 */
export type LoginResponseResult = {
  user: UserResponseDto;
  tenants: TenantResponseDto[];
};