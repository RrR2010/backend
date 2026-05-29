import { MongoQuery, MongoAbility, InferSubjects } from '@casl/ability'
import { Identity } from '@identities/identity.entity'
import { Ingredient } from '@ingredients/ingredient.entity'
import { TenantAllergen } from '@ingredients/tenant-allergen.entity'
import { TenantNutrient } from '@ingredients/tenant-nutrient.entity'
import { FunctionalGroup } from '@ingredients/functional-group.entity'
import { Company } from '@ingredients/company.entity'
import { TechnicalInfoSource } from '@ingredients/technical-info-source.entity'
import { IngredientRegulatoryProfile } from '@ingredients/ingredient-regulatory-profile.entity'
import { IngredientLabelingProfile } from '@ingredients/ingredient-labeling-profile.entity'
import { IngredientTechnicalProfile } from '@ingredients/ingredient-technical-profile.entity'
import { BaseAllergen } from '@ingredients/base-allergen.entity'
import { BaseNutrient } from '@ingredients/base-nutrient.entity'
import { IngredientBaseAllergen } from '@ingredients/ingredient-base-allergen.entity'
import { IngredientBaseNutrient } from '@ingredients/ingredient-base-nutrient.entity'
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
import { UserScope, PlatformRole, TenantRole } from '@users/user.types'

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  Approve = 'approve',
  Unlock = 'unlock'
}

type AnyClass = new (...args: any[]) => any

export type Subjects =
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  | InferSubjects<
      | typeof User
      | typeof Tenant
      | typeof Ingredient
      | typeof TenantAllergen
      | typeof TenantNutrient
      | typeof FunctionalGroup
      | typeof Company
      | typeof TechnicalInfoSource
      | typeof IngredientRegulatoryProfile
      | typeof IngredientLabelingProfile
      | typeof IngredientTechnicalProfile
      | typeof BaseAllergen
      | typeof BaseNutrient
      | typeof IngredientBaseAllergen
      | typeof IngredientBaseNutrient
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

export type AppConditions = MongoQuery<any>

export type AppAbility = MongoAbility<[Action, Subjects], AppConditions>

// ============== REQUEST CONTEXT ==============

export type RequestContext =
  | {
      userId: string
      scope: UserScope.PLATFORM
      roles: PlatformRole[]
    }
  | {
      userId: string
      scope: UserScope.TENANT
      tenantId: string
      roles: TenantRole[]
    }
