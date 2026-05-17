import { SetMetadata } from '@nestjs/common'
import { Action, Subjects } from './authorization.types'

export const AUTHORIZE_KEY = 'viversorvete:authorize'

export interface AuthorizeMetadata {
  action: Action
  subject: Subjects
  conditions?: Record<string, unknown>
}

export const Authorize = (
  action: Action,
  subject: Subjects,
  conditions?: Record<string, unknown>,
): void => SetMetadata(AUTHORIZE_KEY, { action, subject, conditions })