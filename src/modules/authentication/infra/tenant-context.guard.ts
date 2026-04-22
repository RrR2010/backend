import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import {
  AuthTokenPayload,
  AuthScope,
} from '@modules/authentication/domain/token.service';
import { MissingTenantContextError } from '@modules/authentication/domain/auth.errors';

@Injectable()
export class TenantContextGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthTokenPayload | undefined;

    // Platform users have explicit scope - skip tenant check
    if (user?.scope === AuthScope.Platform) {
      return true;
    }

    // Tenant-scoped users must have tenantId
    if (!user?.tenantId) {
      throw new MissingTenantContextError();
    }

    return true;
  }
}
