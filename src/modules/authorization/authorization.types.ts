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
import { Allergen_PL } from '@ingredients/allergen-pl.entity'
import { Nutrient_PL } from '@ingredients/nutrient-pl.entity'
import { DeclarationFlag_PL } from '@ingredients/declaration-flag-pl.entity'
import { OgmDonorSpecies_PL } from '@ingredients/ogm-donor-species-pl.entity'
import { TechnicalSourceType_PL } from '@ingredients/technical-source-type-pl.entity'
import { RegulatoryBody_PL } from '@ingredients/regulatory-body-pl.entity'
import { RegulationType_PL } from '@ingredients/regulation-type-pl.entity'
import { Regulation_PL } from '@ingredients/regulation-pl.entity'
import { ComplianceRule_PL } from '@ingredients/compliance-rule-pl.entity'
import { IngredientBaseAllergen } from '@ingredients/ingredient-base-allergen.entity'
import { IngredientBaseNutrient } from '@ingredients/ingredient-base-nutrient.entity'
import { LabelField_PL } from '@products/label-field-pl.entity'
import { ProductCategory_PL } from '@products/product-category-pl.entity'
import { ProductSubcategory_PL } from '@products/product-subcategory-pl.entity'
import { PanelGeometricFormatType_PL } from '@products/panel-geometric-format-type-pl.entity'
import { Tenant } from '@tenants/tenant.entity'
import { User } from '@users/user.entity'
import { TenantMembership } from '@tenant-memberships/tenant-membership.entity'
import { PlatformMembership } from '@platform-memberships/platform-membership.entity'
import { Address } from '@addresses/address.entity'
import { Phone } from '@phones/phone.entity'
import { TenantSite } from '@tenant-sites/tenant-site.entity'
import { MemberProfile } from '@member-profiles/member-profile.entity'
import { MemberProfileDocument } from '@member-profile-documents/member-profile-document.entity'
import { Product } from '@products/product.entity'
import { ProductNutritionalInfo } from '@products/product-nutritional-info.entity'
import { LabelProfile } from '@products/label-profile.entity'
import { Claim_TE } from '@products/claim-te.entity'
import { ProductFamily_TE } from '@products/product-family-te.entity'
import { CommercialLine_TE } from '@products/commercial-line-te.entity'
import { TechnicalSourceType_TE } from '@ingredients/technical-source-type-te.entity'
import { FormulationVersion } from '@formulations/formulation-version.entity'
import { FormulationRevision } from '@formulations/formulation-revision.entity'
import { FormulationItem } from '@formulations/formulation-item.entity'
import { AuditLog } from '@audit-logs/audit-log.entity'
import { UnitOfMeasure_PL } from '@formulations/unit-of-measure-pl.entity'
import { UnitConversion_PL } from '@formulations/unit-conversion-pl.entity'
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
      | typeof Allergen_PL
      | typeof Nutrient_PL
      | typeof DeclarationFlag_PL
      | typeof OgmDonorSpecies_PL
      | typeof TechnicalSourceType_PL
      | typeof RegulatoryBody_PL
      | typeof RegulationType_PL
      | typeof Regulation_PL
      | typeof ComplianceRule_PL
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
      | typeof Product
      | typeof ProductNutritionalInfo
      | typeof LabelProfile
      | typeof LabelField_PL
      | typeof ProductCategory_PL
      | typeof ProductSubcategory_PL
      | typeof PanelGeometricFormatType_PL
      | typeof FormulationVersion
      | typeof FormulationRevision
      | typeof FormulationItem
      | typeof UnitOfMeasure_PL
      | typeof UnitConversion_PL
      // Tenant-scoped product catalogs
      | typeof Claim_TE
      | typeof ProductFamily_TE
      | typeof CommercialLine_TE
      // Tenant-scoped ingredient catalogs
      | typeof TechnicalSourceType_TE
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
      impersonatedTenantId: string | null
    }
  | {
      userId: string
      scope: UserScope.TENANT
      tenantId: string
      roles: TenantRole[]
    }
