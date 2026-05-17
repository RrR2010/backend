import { MongoQuery, MongoAbility, InferSubjects } from '@casl/ability'
import { Identity } from '@identities/identity.entity'
import { Ingredient } from '@ingredients/ingredient.entity'
import { Tenant } from '@tenants/tenant.entity'
import { User } from '@users/user.entity'
import { TenantMembership } from '@tenant-memberships/tenant-membership.entity'
import { PlatformMembership } from '@platform-memberships/platform-membership.entity'
import { Address } from '@addresses/address.entity'
import { Phone } from '@phones/phone.entity'
import { TenantSite } from '@tenant-sites/tenant-site.entity'
import { MemberProfile } from '@member-profiles/member-profile.entity'
import { MemberProfileDocument } from '@member-profile-documents/member-profile-document.entity'
import { AuditLog } from '@audit-logs/audit-log.entity'

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  Approve = 'approve'
}

type AnyClass = new (...args: any[]) => any

export type Subjects =
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  | InferSubjects<
      | typeof User
      | typeof Tenant
      | typeof Ingredient
      | typeof Identity
      | typeof TenantMembership
      | typeof PlatformMembership
      | typeof Address
      | typeof Phone
      | typeof TenantSite
      | typeof MemberProfile
      | typeof MemberProfileDocument
      | typeof AuditLog
      | AnyClass
    >
  | 'all'

export type AppConditions = MongoQuery

export type AppAbility = MongoAbility<[Action, Subjects], AppConditions>

export interface RequestContext {
  userId: string
  tenantId?: string
  platformRoles: string[]
  tenantRoles: string[]
  isOwner?: boolean
}
