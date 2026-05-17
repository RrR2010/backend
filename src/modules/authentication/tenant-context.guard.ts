import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserScope, TenantRole } from '@users/user.types'
import { AuthenticatedRequest } from '@authentication/jwt-auth.guard'
import { TenantMembershipRepository } from '@tenant-memberships/tenant-membership.repository'
import { IS_PUBLIC_KEY } from '@shared/decorators/public.decorator'
import { RequestContext } from '@authorization/authorization.types'

export type TenantContext = {
  tenantId: string
  userId: string
  roles: string[]
  isAdmin: boolean
  isOwner: boolean
}

@Injectable()
export class TenantContextGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(TenantMembershipRepository)
    private readonly tenantMembershipRepository: TenantMembershipRepository
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route has @Public() → allow
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler()
    )

    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()

    // If no user attached (shouldn't happen if JwtAuthGuard runs first)
    if (!request.user) {
      throw new ForbiddenException('Authentication required')
    }

    const authScope = request.authScope

    // Platform-scoped users can access everything
    if (authScope === UserScope.PLATFORM) {
      return true
    }

    // For tenant-scoped users, verify membership
    const tenantId = request.tenantId

    if (!tenantId) {
      throw new ForbiddenException('Tenant context required')
    }

    // Use roles from JWT token payload as primary source
    const jwtRoles = request.user.roles as string[]

    // DB lookup only to verify membership existence and isOwner status
    const membership = await this.tenantMembershipRepository.findAll({
      userId: request.userId,
      tenantId: tenantId
    }, {
      userId: request.userId,
      scope: UserScope.TENANT,
      tenantId: tenantId,
      roles: jwtRoles as TenantRole[]
    })

    if (!membership || membership.length === 0) {
      throw new ForbiddenException('Access denied to this tenant')
    }

    const userMembership = membership[0]
    if (!userMembership) {
      throw new ForbiddenException('Access denied to this tenant')
    }

    // Hydrate tenant context using JWT roles as primary source
    const tenantContext: TenantContext = {
      tenantId: tenantId,
      userId: request.userId,
      roles: jwtRoles,
      isAdmin: jwtRoles.includes(TenantRole.ADMIN),
      isOwner: userMembership.isOwner
    }

    request.tenantContext = tenantContext

    return true
  }
}
