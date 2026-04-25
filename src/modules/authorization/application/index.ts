/**
 * Authorization Application Layer
 *
 * This layer contains the orchestration service for authorization.
 */
export { AuthorizationService } from './authorization.service';

export type {
  CreateContextOptions,
  PermissionCheckResult,
} from './authorization.service';