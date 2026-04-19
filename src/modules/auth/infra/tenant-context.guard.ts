import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthTokenPayload } from '@modules/auth/domain/token.service';
import { MissingTenantContextError } from '@modules/auth/domain/auth.errors';

@Injectable()
export class TenantContextGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthTokenPayload | undefined;

    if (!user?.tenantId) {
      throw new MissingTenantContextError();
    }

    return true;
  }
}
