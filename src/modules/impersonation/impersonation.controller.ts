import { Controller, Get, Req, ForbiddenException } from '@nestjs/common'
import type { AuthenticatedRequest } from '@authentication/jwt-auth.guard'
import { UserScope, PlatformRole } from '@users/user.types'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { Tenant } from '@tenants/tenant.entity'
import type { ImpersonationTenantsResponseDto } from './impersonation.dto'
import { ImpersonationService } from './impersonation.service'

@Controller('impersonation')
export class ImpersonationController {
  constructor(private readonly impersonationService: ImpersonationService) {}

  @Get('tenants')
  @Authorize(Action.Read, Tenant)
  async getImpersonatableTenants(
    @Req() req: AuthenticatedRequest
  ): Promise<ImpersonationTenantsResponseDto> {
    // Only PLATFORM users can access this endpoint
    if (req.authScope !== UserScope.PLATFORM) {
      throw new ForbiddenException('Only platform users can impersonate')
    }

    // CRITICAL: Only PLATFORM ADMIN can impersonate
    const roles = req.user.roles as string[]
    if (!roles.includes(PlatformRole.ADMIN)) {
      throw new ForbiddenException('Only platform administrators can impersonate tenants')
    }

    return this.impersonationService.getImpersonatableTenants()
  }
}
