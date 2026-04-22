/**
 * Authentication scope discriminator.
 * Used to determine whether the current session is platform-wide or tenant-scoped.
 */
export enum AuthScope {
  Platform = 'platform',
  Tenant = 'tenant',
}

/**
 * Pre-authentication token payload.
 * Used temporarily while user selects a tenant.
 */
export interface PreAuthPayload {
  sub: string; // user ID
  type: 'pre-auth';
  iat?: number;
  exp?: number;
}

/**
 * Main authentication token payload.
 *
 * Contract:
 * - `scope`: explicit context discriminator (platform vs tenant)
 * - `tenantId`: only present when scope === 'tenant'
 * - `platformRoles`: only present when scope === 'platform'
 * - `jti`: unique token ID for revocation tracking
 *
 * @example Platform user:
 *   { sub: 'user-123', scope: 'platform', platformRoles: ['admin'], jti: 'uuid' }
 *
 * @example Tenant user:
 *   { sub: 'user-123', scope: 'tenant', tenantId: 'tenant-456', jti: 'uuid' }
 */
export interface AuthTokenPayload {
  sub: string; // user ID
  scope: AuthScope; // explicit context discriminator
  tenantId?: string; // only for tenant scope
  platformRoles?: string[]; // only for platform scope
  jti?: string; // JWT ID for token revocation
  iat?: number;
  exp?: number;
}

export abstract class TokenService {
  abstract signPreAuth(payload: PreAuthPayload): string;
  abstract sign(payload: AuthTokenPayload): string;
  abstract verifyPreAuth(token: string): PreAuthPayload | null;
  abstract verify(token: string): AuthTokenPayload | null;
}
