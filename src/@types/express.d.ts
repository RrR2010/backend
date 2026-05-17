import { RequestContext } from '@authorization/authorization.types'

/**
 * Application-specific cookies interface
 * Extends the default cookie-parser cookies with typed accessToken
 */
export interface AppCookies {
  accessToken?: string
  preAuthToken?: string
  refreshToken?: string
}

declare module 'express-serve-static-core' {
  interface Request {
    /** Application request context (authorization) */
    context: RequestContext
    /** Typed cookies for the application */
    cookies: AppCookies & { [key: string]: string | undefined }
  }
}
