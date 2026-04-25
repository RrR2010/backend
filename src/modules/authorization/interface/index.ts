/**
 * Authorization Interface Layer
 *
 * This layer contains guards and decorators for consumers.
 */
export { AuthorizationGuard } from './authorization.guard';
export type { AuthorizationGuard as IAuthorizationGuard } from './authorization.guard';

export {
  Authorize,
  Check,
  Public,
  Guest,
  AUTHORIZATION_KEY,
} from './authorization.decorator';

export type {
  AuthorizeOptions,
} from './authorization.decorator';