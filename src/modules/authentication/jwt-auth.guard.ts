import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'
import { TokenService } from '@authentication/token.service'
import { AuthTokenPayload } from '@authentication/authentication.types'
import { UserScope } from '@users/user.types'
import { IS_PUBLIC_KEY } from '@shared/decorators/public.decorator'
import { TenantContext } from '@authentication/tenant-context.guard'
import { AppAbility, RequestContext } from '@authorization/authorization.types'

export interface AuthenticatedRequest extends Request {
  user: AuthTokenPayload
  userId: string
  authScope: UserScope
  tenantId: string | null
  impersonatedTenantId: string | null
  tenantContext?: TenantContext
  ability?: AppAbility
  context: RequestContext
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(TokenService)
    private readonly tokenService: TokenService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler()
    )

    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const token = this.extractTokenFromCookie(request)

    if (!token) {
      throw new UnauthorizedException('Access token not provided')
    }

    const payload = this.tokenService.verify<AuthTokenPayload>(token)

    if (!payload) {
      throw new UnauthorizedException('Invalid or expired token')
    }

    // Attach user data to request
    request.user = payload
    request.userId = payload.userId
    request.authScope = payload.scope
    request.impersonatedTenantId = null
    request.tenantId = null

    // Attach tenantId for tenant-scoped tokens
    if (payload.scope === UserScope.TENANT) {
      const tenantPayload = payload
      request.tenantId = tenantPayload.tenantId
    }

    return true
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    return request.cookies?.accessToken as string
  }
}
