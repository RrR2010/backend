import { PlatformRole } from '@core/domain/platform-role.enum';
import { TenantRole } from '@core/domain/tenant-role.enum';

export interface PreAuthPayload {
  sub: string; // user ID
  type: 'pre-auth';
  iat?: number;
  exp?: number;
}

export interface AuthTokenPayload {
  sub: string; // user ID
  tenantId?: string; // undefined = platform scope
  platformRoles?: PlatformRole[]; // for platform scope
  tenantRoles?: TenantRole[]; // for tenant scope
  iat?: number;
  exp?: number;
}

export abstract class TokenService {
  abstract signPreAuth(payload: PreAuthPayload): string;
  abstract sign(payload: AuthTokenPayload): string;
  abstract verifyPreAuth(token: string): PreAuthPayload | null;
  abstract verify(token: string): AuthTokenPayload | null;
}
