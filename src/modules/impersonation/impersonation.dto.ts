export type ImpersonationTenantDto = {
  id: string
  name: string
  slug: string | null
  subscriptionStatus: string | null
}

export type ImpersonationTenantsResponseDto = {
  tenants: ImpersonationTenantDto[]
}
