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

    const membership = await this.tenantMembershipRepository.findAll({
      userId: request.userId,
      tenantId: tenantId
    })

    if (!membership || membership.length === 0) {
      throw new ForbiddenException('Access denied to this tenant')
    }

    const userMembership = membership[0]
    if (!userMembership) {
      throw new ForbiddenException('Access denied to this tenant')
    }

    const roles = userMembership.roles

    // Hydrate tenant context
    const tenantContext: TenantContext = {
      tenantId: tenantId,
      userId: request.userId,
      roles: roles,
      isAdmin: roles.includes(TenantRole.ADMIN),
      isOwner: userMembership.isOwner
    }

    request.tenantContext = tenantContext

    return true
  }
}
