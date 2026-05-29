import { SetMetadata } from '@nestjs/common'
import { Action, Subjects } from './authorization.types'

export const AUTHORIZE_KEY = 'viversorvete:authorize'

export interface AuthorizeMetadata {
  action: Action
  subject: Subjects
}

export const Authorize =
  (action: Action, subject: Subjects) =>
  (target: object, key: string | symbol, descriptor: PropertyDescriptor) => {
    SetMetadata(AUTHORIZE_KEY, { action, subject })(target, key, descriptor)
  }
