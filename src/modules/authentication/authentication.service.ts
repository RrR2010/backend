import { UserRepository } from '@users/user.repository'
import {
  InvalidCredentialsError,
  InvalidScopeError,
  TenantNotFoundError,
  UserNotFoundAfterAuthenticationError
} from '@authentication/authentication.errors'
import {
  AuthProviderType,
  AuthTokenPayload,
  LoginInput,
  LoginResult,
  PlatformTokenPayload,
  PreAuthTokenPayload,
  SelectTenantInput,
  SelectTenantResult,
  TenantTokenPayload
} from '@authentication/authentication.types'
import { Inject, Injectable } from '@nestjs/common'
import {
  AUTH_PROVIDERS,
  AuthenticationProvider
} from '@authentication/authentication.provider'
import { UserScope } from '@users/user.types'
import { TenantRepository } from '@tenants/tenant.repository'
import { UserResponseDto } from '@users/user.dto'
import { TenantResponseDto } from '@tenants/tenant.dto'
import { PlatformMembershipRepository } from '@platform-memberships/platform-membership.repository'
import { TenantMembershipRepository } from '@tenant-memberships/tenant-membership.repository'

@Injectable()
export class AuthenticationService {
  constructor(
    @Inject(AUTH_PROVIDERS)
    private readonly providers: AuthenticationProvider<AuthProviderType>[],
    private readonly userRepository: UserRepository,
    private readonly platformMembershipRepository: PlatformMembershipRepository,
    private readonly tenantMembershipRepository: TenantMembershipRepository,
    private readonly tenantRepository: TenantRepository
  ) {}
  async login(loginInput: LoginInput): Promise<LoginResult> {
    const provider = this.providers.find(
      (provider) => provider.providerType === loginInput.providerType
    )

    if (!provider) {
      throw new InvalidCredentialsError()
    }

    const result = await provider.authenticate(loginInput)

    if (!result) {
      throw new InvalidCredentialsError()
    }

    const user = await this.userRepository.findById(result.userId)
    if (!user) {
      throw new UserNotFoundAfterAuthenticationError()
    }

    if (user.scope === UserScope.PLATFORM) {
      // Get platform roles from PlatformMembership
      const platformMembership =
        await this.platformMembershipRepository.findAll({
          userId: user.id.value
        })
      if (platformMembership.length === 0 || !platformMembership[0]) {
        throw new InvalidCredentialsError()
      }
      const platformRoles = platformMembership[0].roles

      const tokenPayload: PlatformTokenPayload = {
        type: 'auth',
        userId: user.id.value,
        scope: user.scope,
        roles: platformRoles,
        tenantId: null
      }

      return {
        tokenPayload,
        user: UserResponseDto.fromDomain(user),
        nextStepHint: 'direct-login'
      }
    }

    if (user.scope === UserScope.TENANT) {
      const memberships = await this.tenantMembershipRepository
        .findAll({
          userId: user.id.value
        })
        .then((memberships) => memberships.filter((membership) => !!membership))

      if (memberships.length === 0) throw new InvalidCredentialsError()

      const tenants = await Promise.all(
        memberships.map((membership) =>
          this.tenantRepository.findById(membership.tenantId)
        )
      ).then((tenants) => tenants.filter((tenant) => !!tenant))

      if (tenants.length === 0) throw new InvalidCredentialsError()

      if (tenants.length === 1) {
        const tokenPayload: TenantTokenPayload = {
          type: 'auth',
          userId: user.id.value,
          scope: user.scope,
          tenantId: tenants[0]!.id.value,
          roles: memberships[0]!.roles
        }
        return {
          tokenPayload,
          user: UserResponseDto.fromDomain(user),
          nextStepHint: 'direct-login',
          tenant: TenantResponseDto.fromDomain(tenants[0]!)
        }
      } else {
        const tokenPayload: PreAuthTokenPayload = {
          type: 'pre-auth',
          userId: user.id.value,
          identityId: result.identityId
        }
        return {
          tokenPayload,
          user: UserResponseDto.fromDomain(user),
          nextStepHint: 'select-tenant',
          tenants: tenants.map((tenant) => TenantResponseDto.fromDomain(tenant))
        }
      }
    }

    throw new InvalidCredentialsError()
  }

  async selectTenant(
    selectTenantInput: SelectTenantInput
  ): Promise<SelectTenantResult> {
    const user = await this.userRepository.findById(selectTenantInput.userId)
    if (!user) {
      throw new InvalidCredentialsError()
    }

    if (user.scope !== UserScope.TENANT) {
      throw new InvalidScopeError()
    }

    const memberships = await this.tenantMembershipRepository.findAll({
      userId: user.id.value,
      tenantId: selectTenantInput.tenantId
    })

    if (memberships.length === 0 || !memberships[0]) {
      throw new TenantNotFoundError()
    }

    const membership = memberships[0]
    const tenant = await this.tenantRepository.findById(membership.tenantId)
    if (!tenant) {
      throw new TenantNotFoundError()
    }

    const tokenPayload: AuthTokenPayload = {
      type: 'auth',
      userId: user.id.value,
      scope: user.scope,
      tenantId: membership.tenantId,
      roles: membership.roles
    }
    return {
      tokenPayload,
      user: UserResponseDto.fromDomain(user),
      tenant: TenantResponseDto.fromDomain(tenant)
    }
  }
}
