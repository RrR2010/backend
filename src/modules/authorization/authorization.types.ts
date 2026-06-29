import { MongoQuery, MongoAbility, InferSubjects } from '@casl/ability'
import { Identity } from '@identities/identity.entity'
import { Ingredient_TE } from '@ingredients/ingredient.entity'
import { FunctionalGroup_TE } from '@ingredients/functional-group.entity'
import { Company_TE } from '@ingredients/company.entity'
import { TechnicalSource_TE } from '@ingredients/technical-source-te.entity'
import { Allergen_PL } from '@ingredients/allergen-pl.entity'
import { Nutrient_PL } from '@ingredients/nutrient-pl.entity'
import { DeclarationFlag_PL } from '@ingredients/declaration-flag-pl.entity'
import { OgmDonorSpecies_PL } from '@ingredients/ogm-donor-species-pl.entity'
import { TechnicalSourceType_PL } from '@ingredients/technical-source-type-pl.entity'
import { RegulatoryBody_PL } from '@ingredients/regulatory-body-pl.entity'
import { RegulationType_PL } from '@ingredients/regulation-type-pl.entity'
import { Regulation_PL } from '@ingredients/regulation-pl.entity'
import { ComplianceRule_PL } from '@ingredients/compliance-rule-pl.entity'
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
import { Product_TE } from '@products/product.entity'
import { Claim_TE } from '@products/claim-te.entity'
import { ProductFamily_TE } from '@products/product-family-te.entity'
import { CommercialLine_TE } from '@products/commercial-line-te.entity'
import { ProductLabelField_TE } from '@products/product-label-field-te.entity'
import { ProductPanel_TE } from '@products/product-panel-te.entity'
import { ProductNutrientOverride_TE } from '@products/product-nutrient-override-te.entity'
import { ProductClaim_TE } from '@products/product-claim-te.entity'
import { TechnicalSourceType_TE } from '@ingredients/technical-source-type-te.entity'
import { IngredientAllergen_TE } from '@ingredients/ingredient-allergen-te.entity'
import { IngredientNutrient_TE } from '@ingredients/ingredient-nutrient-te.entity'
import { IngredientFlag_TE } from '@ingredients/ingredient-flag-te.entity'
import { IngredientCost_TE } from '@ingredients/ingredient-cost-te.entity'
import { FormulationVersion_TE } from '@formulations/formulation-version.entity'
import { FormulationRevision_TE } from '@formulations/formulation-revision.entity'
import { FormulationItem_TE } from '@formulations/formulation-item.entity'
import { FormulationRegulatoryDeclaration_TE } from '@formulations/formulation-regulatory-declaration-te.entity'
import { FormulationAllergen_TE } from '@formulations/formulation-allergen-te.entity'
import { FormulationNutrition_TE } from '@formulations/formulation-nutrition-te.entity'
import { FormulationOgmDonor_TE } from '@formulations/formulation-ogm-donor-te.entity'
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
      | typeof Ingredient_TE
      | typeof FunctionalGroup_TE
      | typeof Company_TE
      | typeof TechnicalSource_TE
      | typeof Allergen_PL
      | typeof Nutrient_PL
      | typeof DeclarationFlag_PL
      | typeof OgmDonorSpecies_PL
      | typeof TechnicalSourceType_PL
      | typeof RegulatoryBody_PL
      | typeof RegulationType_PL
      | typeof Regulation_PL
      | typeof ComplianceRule_PL
      | typeof Identity
      | typeof TenantMembership
      | typeof PlatformMembership
      | typeof Address
      | typeof Phone
      | typeof TenantSite
      | typeof MemberProfile
      | typeof MemberProfileDocument
      | typeof AuditLog
      | typeof Product_TE
      | typeof LabelField_PL
      | typeof ProductCategory_PL
      | typeof ProductSubcategory_PL
      | typeof PanelGeometricFormatType_PL
      | typeof FormulationVersion_TE
      | typeof FormulationRevision_TE
      | typeof FormulationItem_TE
      | typeof UnitOfMeasure_PL
      | typeof UnitConversion_PL
      // Tenant-scoped product catalogs
      | typeof Claim_TE
      | typeof ProductFamily_TE
      | typeof CommercialLine_TE
      // Tenant-scoped product sub-entities (Wave 5)
      | typeof ProductLabelField_TE
      | typeof ProductPanel_TE
      | typeof ProductNutrientOverride_TE
      | typeof ProductClaim_TE
      // Tenant-scoped ingredient catalogs
      | typeof TechnicalSourceType_TE
      // Tenant-scoped ingredient junctions
      | typeof IngredientAllergen_TE
      | typeof IngredientNutrient_TE
      | typeof IngredientFlag_TE
      | typeof IngredientCost_TE
      // Formulation sub-entities (Wave 6)
      | typeof FormulationRegulatoryDeclaration_TE
      | typeof FormulationAllergen_TE
      | typeof FormulationNutrition_TE
      | typeof FormulationOgmDonor_TE
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
