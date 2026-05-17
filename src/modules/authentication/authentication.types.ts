import { TenantResponseDto } from '@tenants/tenant.dto'
import { UserResponseDto } from '@users/user.dto'
import { PlatformRole, TenantRole, UserScope } from '@users/user.types'

export type BaseTokenPayload = {
  type: 'pre-auth' | 'auth' | 'refresh'
  userId: string
}

export type PreAuthTokenPayload = BaseTokenPayload & {
  type: 'pre-auth'
  identityId: string
}

export type RefreshTokenPayload = BaseTokenPayload & {
  type: 'refresh'
  sessionId: string
  tenantId: string | null
}

export type PlatformTokenPayload = BaseTokenPayload & {
  type: 'auth'
  scope: UserScope.PLATFORM
  roles: PlatformRole[]
  tenantId: null
}

export type TenantTokenPayload = BaseTokenPayload & {
  type: 'auth'
  scope: UserScope.TENANT
  tenantId: string
  roles: TenantRole[]
}

export type AuthTokenPayload = PlatformTokenPayload | TenantTokenPayload

export type TokenPayload =
  | PreAuthTokenPayload
  | PlatformTokenPayload
  | TenantTokenPayload
  | RefreshTokenPayload

export type AuthPayload = PlatformTokenPayload | TenantTokenPayload

export enum AuthProviderType {
  EMAIL = 'EMAIL',
  CPF = 'CPF'
}

export type ProviderInputMap = {
  [AuthProviderType.EMAIL]: {
    providerType: AuthProviderType.EMAIL
    email: string
    password: string
  }

  [AuthProviderType.CPF]: {
    providerType: AuthProviderType.CPF
    cpf: string
    password: string
  }
}

export type AuthProviderResult = {
  providerType: AuthProviderType
  userId: string
  identityId: string
}

export type LoginInput = ProviderInputMap[keyof ProviderInputMap]

export type LoginResult = {
  tokenPayload: TokenPayload
  user: UserResponseDto
} & (
  | {
      nextStepHint: 'direct-login'
      tenant?: TenantResponseDto
    }
  | {
      nextStepHint: 'select-tenant'
      tenants: TenantResponseDto[]
    }
)

export type SelectTenantInput = {
  userId: string
  tenantId: string
}

export type SelectTenantResult = {
  tokenPayload: TokenPayload
  user: UserResponseDto
  tenant: TenantResponseDto
}
