import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  Inject
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserScope, TenantRole, PlatformRole } from '@users/user.types'
import { AuthenticatedRequest } from '@authentication/jwt-auth.guard'
import { TenantMembershipRepository } from '@tenant-memberships/tenant-membership.repository'
import { IS_PUBLIC_KEY } from '@shared/decorators/public.decorator'
import { RequestContext } from '@authorization/authorization.types'
import { PrismaService } from '@shared/prisma/prisma.service'

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
    private readonly tenantMembershipRepository: TenantMembershipRepository,
    private readonly prisma: PrismaService
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

    // Platform-scoped users — check impersonation
    if (authScope === UserScope.PLATFORM) {
      const impersonatedTenantId = request.header('X-Tenant-Id')

      if (impersonatedTenantId) {
        // Validate only PLATFORM ADMIN can impersonate
        const roles = request.user.roles as string[]
        if (!roles.includes(PlatformRole.ADMIN)) {
          // Clean up before rejecting
          this.clearImpersonation(request)
          throw new ForbiddenException(
            'Only platform admins can impersonate tenants'
          )
        }

        // Validate tenant exists and subscription is ACTIVE or GRACE
        const tenant = await this.prisma.tenant.findUnique({
          where: { id: impersonatedTenantId },
          include: { subscription: true }
        })

        if (!tenant) {
          this.clearImpersonation(request)
          throw new NotFoundException('Tenant not found')
        }

        if (
          !tenant.subscription ||
          !['ACTIVE', 'GRACE'].includes(tenant.subscription.status)
        ) {
          this.clearImpersonation(request)
          throw new ForbiddenException(
            'Tenant subscription is not active or in grace period'
          )
        }

        // Set impersonation on request
        request.impersonatedTenantId = impersonatedTenantId

        // Create tenant context for impersonation
        // Synthetic — authorization MUST use the ability (definePlatformAbility), not tenantContext.roles
        request.tenantContext = {
          tenantId: impersonatedTenantId,
          userId: request.userId,
          roles: [TenantRole.ADMIN],
          isAdmin: true,
          isOwner: false // The impersonator is not the owner
        }

        // Update request.context if already built
        if (
          request.context &&
          'impersonatedTenantId' in request.context
        ) {
          ;(
            request.context as Record<string, unknown>
          ).impersonatedTenantId = impersonatedTenantId
        }
      }

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
    const membership = await this.tenantMembershipRepository.findAll(
      {
        userId: request.userId,
        tenantId: tenantId
      },
      {
        userId: request.userId,
        scope: UserScope.TENANT,
        tenantId: tenantId,
        roles: jwtRoles as TenantRole[]
      }
    )

    if (!membership || membership.length === 0) {
      throw new ForbiddenException('Access denied to this tenant')
    }

    const userMembership = membership[0]!

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

  /**
   * Clean up impersonation state from request before rejecting.
   */
  private clearImpersonation(request: AuthenticatedRequest): void {
    request.impersonatedTenantId = null
    if (request.context && 'impersonatedTenantId' in request.context) {
      ;(request.context as Record<string, unknown>).impersonatedTenantId = null
    }
  }
}
