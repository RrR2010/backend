export interface PreAuthPayload {
  sub: string; // user ID
  type: 'pre-auth';
  iat?: number;
  exp?: number;
}

export interface AuthTokenPayload {
  sub: string; // user ID
  tenantId?: string; // tenant ID (optional for platform scope)
  iat?: number;
  exp?: number;
}

export abstract class TokenService {
  abstract signPreAuth(payload: PreAuthPayload): string;
  abstract sign(payload: AuthTokenPayload): string;
  abstract verifyPreAuth(token: string): PreAuthPayload | null;
  abstract verify(token: string): AuthTokenPayload | null;
}
