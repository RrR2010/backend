import { Injectable } from '@nestjs/common'
import { User } from '@users/user.entity'
import { TenantRole, UserScope } from '@users/user.types'
import { RequestContext } from '@authorization/authorization.types'
import { PlatformMembership } from '@platform-memberships/platform-membership.entity'
import { TenantMembership } from '@tenant-memberships/tenant-membership.entity'

export type UserSubject = {
  __subjectType__: typeof User
  id: string
  tenantId: string | undefined
  roles: TenantRole[] | undefined
  isSelf: boolean
  scope: UserScope
}

@Injectable()
export class AuthorizationSubjectFactory {
  createUserSubject(
    user: User,
    ctx: RequestContext,
    membership: PlatformMembership | TenantMembership
  ): UserSubject {
    const isTenantMembership = (
      m: PlatformMembership | TenantMembership
    ): m is TenantMembership => {
      return 'tenantId' in m
    }

    return {
      __subjectType__: User,
      id: user.id.value,
      scope: user.scope,
      tenantId: isTenantMembership(membership)
        ? membership.tenantId
        : undefined,
      roles: isTenantMembership(membership) ? membership.roles : undefined,
      isSelf: user.id.value === ctx.userId
    }
  }
}
