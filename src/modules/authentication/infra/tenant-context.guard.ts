import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthTokenPayload } from '@modules/authentication/domain/token.service';
import { MissingTenantContextError } from '@modules/authentication/domain/auth.errors';

@Injectable()
export class TenantContextGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthTokenPayload | undefined;

    // TODO: EPIC_005 - Refactor this guard for platform vs tenant scope
    // Platform users (with platformRoles) should not require tenantId
    if ((user?.platformRoles?.length ?? 0) > 0) {
      // Platform admin - skip tenant check
      return true;
    }

    if (!user?.tenantId) {
      throw new MissingTenantContextError();
    }

    return true;
  }
}
