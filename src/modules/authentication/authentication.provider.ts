import { IdentityRepository } from '@identities/identity.repository'
import {
  AuthProviderType,
  AuthProviderResult,
  ProviderInputMap
} from '@authentication/authentication.types'
import { PasswordHasher } from '@authentication/password.hasher.service'
import { Injectable } from '@nestjs/common'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'

export abstract class AuthenticationProvider<T extends AuthProviderType> {
  abstract readonly providerType: T
  constructor(protected readonly identityRepository: IdentityRepository) {}

  abstract authenticate(
    input: ProviderInputMap[T]
  ): Promise<AuthProviderResult | null>
}

@Injectable()
export class EmailAuthenticationProvider extends AuthenticationProvider<AuthProviderType.EMAIL> {
  readonly providerType = AuthProviderType.EMAIL
  constructor(
    protected readonly identityRepository: IdentityRepository,
    protected readonly passwordHasher: PasswordHasher
  ) {
    super(identityRepository)
  }
  async authenticate(input: ProviderInputMap[AuthProviderType.EMAIL]) {
    const ctx: RequestContext = {
      userId: '',
      scope: UserScope.PLATFORM,
      roles: []
    }
    const identities = await this.identityRepository.findAll(
      {
        authProviderType: AuthProviderType.EMAIL,
        identifier: input.email
      },
      ctx
    )

    if (identities.length === 0 || identities[0] === undefined) {
      return null
    }

    const identity = identities[0]
    if (!identity.secretHash) {
      return null
    }
    const isValidPassword = await this.passwordHasher.compare(
      input.password,
      identity.secretHash
    )
    if (!isValidPassword) {
      return null
    }

    const result: AuthProviderResult = {
      identityId: identity.id.value,
      userId: identity.userId,
      providerType: AuthProviderType.EMAIL
    }
    return result
  }
}

@Injectable()
export class CpfAuthenticationProvider extends AuthenticationProvider<AuthProviderType.CPF> {
  readonly providerType = AuthProviderType.CPF
  constructor(
    protected readonly identityRepository: IdentityRepository,
    protected readonly passwordHasher: PasswordHasher
  ) {
    super(identityRepository)
  }
  async authenticate(input: ProviderInputMap[AuthProviderType.CPF]) {
    // Normalize CPF: remove non-digits
    const normalizedCpf = input.cpf.replace(/\D/g, '')

    const ctx: RequestContext = {
      userId: '',
      scope: UserScope.PLATFORM,
      roles: []
    }
    const identities = await this.identityRepository.findAll(
      {
        authProviderType: AuthProviderType.CPF,
        identifier: normalizedCpf
      },
      ctx
    )

    if (identities.length === 0 || identities[0] === undefined) {
      return null
    }

    const identity = identities[0]
    if (!identity.secretHash) {
      return null
    }
    const isValidPassword = await this.passwordHasher.compare(
      input.password,
      identity.secretHash
    )
    if (!isValidPassword) {
      return null
    }

    const result: AuthProviderResult = {
      identityId: identity.id.value,
      userId: identity.userId,
      providerType: AuthProviderType.CPF
    }
    return result
  }
}

export const AUTH_PROVIDERS = 'AUTH_PROVIDERS'
