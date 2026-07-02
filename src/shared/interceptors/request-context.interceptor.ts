import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { RequestContext } from '@authorization/authorization.types'
import { AuthenticatedRequest } from '@authentication/jwt-auth.guard'
import { PlatformRole, TenantRole, UserScope } from '@users/user.types'
import { ClsContextService } from '@shared/cls/cls-context.service'

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  constructor(private readonly clsContextService: ClsContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()

    // Only process if user is authenticated and not a public route
    // Public routes might not have request.user, so skip context building for them
    if (request.user) {
      const user = request.user as Record<string, unknown> | undefined
      if (!user || typeof user !== 'object') {
        throw new BadRequestException(
          'Request context missing: no user attached'
        )
      }
      if (typeof user.userId !== 'string') {
        throw new BadRequestException(
          'Request context missing: userId is required'
        )
      }
      if (typeof user.scope !== 'string') {
        throw new BadRequestException(
          'Request context missing: scope is required'
        )
      }
      if (!('roles' in user) || !Array.isArray(user.roles)) {
        throw new BadRequestException(
          'Request context missing: roles is required'
        )
      }

      let requestContext: RequestContext
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      if (user.scope === UserScope.TENANT) {
        if (typeof user.tenantId !== 'string') {
          throw new BadRequestException(
            'Request context missing: tenantId is required for TENANT scope'
          )
        }
        requestContext = {
          userId: user.userId,
          scope: UserScope.TENANT,
          tenantId: user.tenantId,
          roles: user.roles as TenantRole[]
        }
      } else {
        // PLATFORM scope: read impersonation header
        const impersonatedTenantIdHeader = request.header('X-Tenant-Id')

        requestContext = {
          userId: user.userId,
          scope: user.scope as UserScope.PLATFORM,
          roles: user.roles as PlatformRole[],
          impersonatedTenantId: impersonatedTenantIdHeader ?? null
        }
      }
      request.context = requestContext
      this.clsContextService.setRequestContext(requestContext)
    }

    return next.handle()
  }
}
