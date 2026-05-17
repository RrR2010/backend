import { Injectable } from '@nestjs/common'
import { User } from '@users/user.entity'
import { TenantRole, UserScope } from '@users/user.types'
import { RequestContext } from '@authorization/authorization.types'
import { Membership } from '@memberships/membership.entity'

export type UserSubject = {
  __subjectType__: typeof User
  id: string
  tenantId: string | undefined
  tenantRoles: TenantRole[] | undefined
  isSelf: boolean
  scope: UserScope
}

@Injectable()
export class AuthorizationSubjectFactory {
  createUserSubject(
    user: User,
    ctx: RequestContext,
    membership?: Membership
  ): UserSubject {
    return {
      __subjectType__: User,
      id: user.id.value,
      scope: user.scope,
      tenantId: membership?.tenantId,
      tenantRoles: membership?.tenantRoles,
      isSelf: user.id.value === ctx.userId
    }
  }
}
