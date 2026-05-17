export enum UserScope {
  PLATFORM = 'PLATFORM',
  TENANT = 'TENANT'
}

export enum PlatformRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum TenantRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export type RolesByScope = {
  PLATFORM: PlatformRole
  TENANT: TenantRole
}
export type Role<Scope extends UserScope = UserScope> = {
  scope: Scope
  role: RolesByScope[Scope]
}
