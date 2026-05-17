import {
  Injectable,
  CanActivate,
  ExecutionContext
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserScope, PlatformRole, TenantRole } from '@users/user.types'
import { IS_PUBLIC_KEY } from '@shared/decorators/public.decorator'
import { AUTHORIZE_KEY, AuthorizeMetadata } from './authorization.decorators'
import { definePlatformAbility } from './platform.policy'
import { defineTenantAbility } from './tenant.policy'
import { AppAbility, Action } from './authorization.types'
import {
  AuthorizationNotDefinedError,
  InsufficientPermissionError
} from './authorization.errors'
import { AuthenticatedRequest } from '@authentication/jwt-auth.guard'



@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Check if route has @Public() → allow
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler()
    )

    if (isPublic) {
      return true
    }

    // 2. Get @Authorize metadata → if none, throw AuthorizationNotDefinedError
    const authorizeMetadata = this.reflector.get<AuthorizeMetadata>(
      AUTHORIZE_KEY,
      context.getHandler()
    )

    if (!authorizeMetadata) {
      throw new AuthorizationNotDefinedError()
    }

    const { action, subject } = authorizeMetadata

    // 3. Get user from request.user
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const user = request.user

    if (!user) {
      throw new InsufficientPermissionError(action, String(subject))
    }

    // 4. Build ability based on scope
    let ability: AppAbility

    if (user.scope === UserScope.PLATFORM) {
      // PLATFORM scope: use platform policy
      ability = definePlatformAbility({
        userId: user.userId,
        scope: UserScope.PLATFORM,
        roles: user.roles as PlatformRole[]
      })
    } else if (user.scope === UserScope.TENANT) {
      // TENANT scope: use tenant policy
      // Validate tenantId exists for TENANT scope
      if (!user.tenantId) {
        throw new InsufficientPermissionError(action, String(subject))
      }

      // Validate tenantContext exists (required for TENANT scope)
      if (!request.tenantContext) {
        throw new InsufficientPermissionError(action, String(subject))
      }

      // Build tenant ability - function creates its own AbilityBuilder
      ability = defineTenantAbility({
        userId: user.userId,
        scope: UserScope.TENANT,
        roles: user.roles as TenantRole[],
        tenantId: user.tenantId,
        isOwner: request.tenantContext?.isOwner ?? false
      })
    } else {
      throw new InsufficientPermissionError(action, String(subject))
    }

    // 5. Check ability.can(action, subject)
    // Note: conditions are already defined in the ability at build time
    const canAccess = ability.can(action, subject)

    // 6. If !can → throw InsufficientPermissionError
    if (!canAccess) {
      throw new InsufficientPermissionError(action, String(subject))
    }

    // 7. Attach ability to request.ability for service-layer use
    request.ability = ability

    // 8. Return true
    return true
  }
}