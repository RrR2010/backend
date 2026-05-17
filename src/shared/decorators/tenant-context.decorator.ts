import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { TenantContext as TenantContextType } from '@authentication/tenant-context.guard'

export const TenantContext = createParamDecorator(
  (data: keyof TenantContextType | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return data ? request.tenantContext?.[data] : request.tenantContext
  }
)

export type { TenantContext as TenantContextType } from '@authentication/tenant-context.guard'