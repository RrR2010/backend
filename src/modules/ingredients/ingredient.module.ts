import { Module } from '@nestjs/common'
import { PrismaModule } from '@shared/prisma/prisma.module'
import { AuditLogModule } from '@audit-logs/audit-log.module'

// Base catalogs
import {
  BaseAllergenRepository,
  PrismaBaseAllergenRepository
} from '@ingredients/base-allergen.repository'
import { BaseAllergenService } from '@ingredients/base-allergen.service'
import { BaseAllergenController } from '@ingredients/base-allergen.controller'

import {
  BaseNutrientRepository,
  PrismaBaseNutrientRepository
} from '@ingredients/base-nutrient.repository'
import { BaseNutrientService } from '@ingredients/base-nutrient.service'
import { BaseNutrientController } from '@ingredients/base-nutrient.controller'

// Platform-scoped catalogs (PL)
import {
  Allergen_PLRepository,
  PrismaAllergen_PLRepository
} from '@ingredients/allergen-pl.repository'
import { Allergen_PLService } from '@ingredients/allergen-pl.service'
import { Allergen_PLController } from '@ingredients/allergen-pl.controller'

import {
  Nutrient_PLRepository,
  PrismaNutrient_PLRepository
} from '@ingredients/nutrient-pl.repository'
import { Nutrient_PLService } from '@ingredients/nutrient-pl.service'
import { Nutrient_PLController } from '@ingredients/nutrient-pl.controller'

import {
  DeclarationFlag_PLRepository,
  PrismaDeclarationFlag_PLRepository
} from '@ingredients/declaration-flag-pl.repository'
import { DeclarationFlag_PLService } from '@ingredients/declaration-flag-pl.service'
import { DeclarationFlag_PLController } from '@ingredients/declaration-flag-pl.controller'

import {
  OgmDonorSpecies_PLRepository,
  PrismaOgmDonorSpecies_PLRepository
} from '@ingredients/ogm-donor-species-pl.repository'
import { OgmDonorSpecies_PLService } from '@ingredients/ogm-donor-species-pl.service'
import { OgmDonorSpecies_PLController } from '@ingredients/ogm-donor-species-pl.controller'

import {
  TechnicalSourceType_PLRepository,
  PrismaTechnicalSourceType_PLRepository
} from '@ingredients/technical-source-type-pl.repository'
import { TechnicalSourceType_PLService } from '@ingredients/technical-source-type-pl.service'
import { TechnicalSourceType_PLController } from '@ingredients/technical-source-type-pl.controller'

import {
  RegulatoryBody_PLRepository,
  PrismaRegulatoryBody_PLRepository
} from '@ingredients/regulatory-body-pl.repository'
import { RegulatoryBody_PLService } from '@ingredients/regulatory-body-pl.service'
import { RegulatoryBody_PLController } from '@ingredients/regulatory-body-pl.controller'

import {
  RegulationType_PLRepository,
  PrismaRegulationType_PLRepository
} from '@ingredients/regulation-type-pl.repository'
import { RegulationType_PLService } from '@ingredients/regulation-type-pl.service'
import { RegulationType_PLController } from '@ingredients/regulation-type-pl.controller'

import {
  Regulation_PLRepository,
  PrismaRegulation_PLRepository
} from '@ingredients/regulation-pl.repository'
import { Regulation_PLService } from '@ingredients/regulation-pl.service'
import { Regulation_PLController } from '@ingredients/regulation-pl.controller'

import {
  ComplianceRule_PLRepository,
  PrismaComplianceRule_PLRepository
} from '@ingredients/compliance-rule-pl.repository'
import { ComplianceRule_PLService } from '@ingredients/compliance-rule-pl.service'
import { ComplianceRule_PLController } from '@ingredients/compliance-rule-pl.controller'

// Tenant-scoped catalogs
import {
  TenantAllergenRepository,
  PrismaTenantAllergenRepository
} from '@ingredients/tenant-allergen.repository'
import { TenantAllergenService } from '@ingredients/tenant-allergen.service'
import { TenantAllergensController } from '@ingredients/tenant-allergen.controller'

import {
  TenantNutrientRepository,
  PrismaTenantNutrientRepository
} from '@ingredients/tenant-nutrient.repository'
import { TenantNutrientService } from '@ingredients/tenant-nutrient.service'
import { TenantNutrientsController } from '@ingredients/tenant-nutrient.controller'

// Additional tenant-scoped catalogs
import {
  FunctionalGroupRepository,
  PrismaFunctionalGroupRepository
} from '@ingredients/functional-group.repository'
import { FunctionalGroupService } from '@ingredients/functional-group.service'
import { FunctionalGroupsController } from '@ingredients/functional-group.controller'

import {
  TechnicalSourceType_TE_Repository,
  PrismaTechnicalSourceType_TE_Repository
} from '@ingredients/technical-source-type-te.repository'
import { TechnicalSourceType_TEService } from '@ingredients/technical-source-type-te.service'
import { TechnicalSourceTypesController } from '@ingredients/technical-source-type-te.controller'

import {
  CompanyRepository,
  PrismaCompanyRepository
} from '@ingredients/company.repository'
import { CompanyService } from '@ingredients/company.service'
import { CompaniesController } from '@ingredients/company.controller'

import {
  TechnicalInfoSourceRepository,
  PrismaTechnicalInfoSourceRepository
} from '@ingredients/technical-info-source.repository'
import { TechnicalInfoSourceService } from '@ingredients/technical-info-source.service'
import { TechnicalInfoSourcesController } from '@ingredients/technical-info-source.controller'

// Ingredient core entity
import {
  IngredientRepository,
  PrismaIngredientRepository
} from '@ingredients/ingredient.repository'
import { IngredientService } from '@ingredients/ingredient.service'
import { IngredientsController } from '@ingredients/ingredient.controller'

// Junction tables
import {
  IngredientTenantAllergenRepository,
  PrismaIngredientTenantAllergenRepository
} from '@ingredients/ingredient-tenant-allergen.repository'
import { IngredientTenantAllergenService } from '@ingredients/ingredient-tenant-allergen.service'
import { IngredientTenantAllergensController } from '@ingredients/ingredient-tenant-allergen.controller'

import {
  IngredientTenantNutrientRepository,
  PrismaIngredientTenantNutrientRepository
} from '@ingredients/ingredient-tenant-nutrient.repository'
import { IngredientTenantNutrientService } from '@ingredients/ingredient-tenant-nutrient.service'
import { IngredientTenantNutrientsController } from '@ingredients/ingredient-tenant-nutrient.controller'

// Base junction tables
import {
  IngredientBaseAllergenRepository,
  PrismaIngredientBaseAllergenRepository
} from '@ingredients/ingredient-base-allergen.repository'
import { IngredientBaseAllergenService } from '@ingredients/ingredient-base-allergen.service'
import { IngredientBaseAllergensController } from '@ingredients/ingredient-base-allergen.controller'

import {
  IngredientBaseNutrientRepository,
  PrismaIngredientBaseNutrientRepository
} from '@ingredients/ingredient-base-nutrient.repository'
import { IngredientBaseNutrientService } from '@ingredients/ingredient-base-nutrient.service'
import { IngredientBaseNutrientsController } from '@ingredients/ingredient-base-nutrient.controller'

// Profile entities
import {
  IngredientRegulatoryProfileRepository,
  PrismaIngredientRegulatoryProfileRepository
} from '@ingredients/ingredient-regulatory-profile.repository'
import { IngredientRegulatoryProfileService } from '@ingredients/ingredient-regulatory-profile.service'
import { IngredientRegulatoryProfilesController } from '@ingredients/ingredient-regulatory-profile.controller'

import {
  IngredientLabelingProfileRepository,
  PrismaIngredientLabelingProfileRepository
} from '@ingredients/ingredient-labeling-profile.repository'
import { IngredientLabelingProfileService } from '@ingredients/ingredient-labeling-profile.service'
import { IngredientLabelingProfilesController } from '@ingredients/ingredient-labeling-profile.controller'

import {
  IngredientTechnicalProfileRepository,
  PrismaIngredientTechnicalProfileRepository
} from '@ingredients/ingredient-technical-profile.repository'
import { IngredientTechnicalProfileService } from '@ingredients/ingredient-technical-profile.service'
import { IngredientTechnicalProfilesController } from '@ingredients/ingredient-technical-profile.controller'

@Module({
  imports: [PrismaModule, AuditLogModule],
  controllers: [
    BaseAllergenController,
    BaseNutrientController,
    TenantAllergensController,
    TenantNutrientsController,
    FunctionalGroupsController,
    CompaniesController,
    TechnicalInfoSourcesController,
    TechnicalSourceTypesController,
    IngredientsController,
    IngredientTenantAllergensController,
    IngredientTenantNutrientsController,
    IngredientBaseAllergensController,
    IngredientBaseNutrientsController,
    IngredientRegulatoryProfilesController,
    IngredientLabelingProfilesController,
    IngredientTechnicalProfilesController,
    // Platform-scoped catalogs (PL)
    Allergen_PLController,
    Nutrient_PLController,
    DeclarationFlag_PLController,
    OgmDonorSpecies_PLController,
    TechnicalSourceType_PLController,
    RegulatoryBody_PLController,
    RegulationType_PLController,
    Regulation_PLController,
    ComplianceRule_PLController
  ],
  providers: [
    // Base catalogs
    BaseAllergenService,
    PrismaBaseAllergenRepository,
    {
      provide: BaseAllergenRepository,
      useExisting: PrismaBaseAllergenRepository
    },
    BaseNutrientService,
    PrismaBaseNutrientRepository,
    {
      provide: BaseNutrientRepository,
      useExisting: PrismaBaseNutrientRepository
    },
    // Tenant-scoped catalogs
    TenantAllergenService,
    PrismaTenantAllergenRepository,
    {
      provide: TenantAllergenRepository,
      useExisting: PrismaTenantAllergenRepository
    },
    TenantNutrientService,
    PrismaTenantNutrientRepository,
    {
      provide: TenantNutrientRepository,
      useExisting: PrismaTenantNutrientRepository
    },
    // Additional tenant-scoped catalogs
    FunctionalGroupService,
    PrismaFunctionalGroupRepository,
    {
      provide: FunctionalGroupRepository,
      useExisting: PrismaFunctionalGroupRepository
    },
    TechnicalSourceType_TEService,
    PrismaTechnicalSourceType_TE_Repository,
    {
      provide: TechnicalSourceType_TE_Repository,
      useExisting: PrismaTechnicalSourceType_TE_Repository
    },
    CompanyService,
    PrismaCompanyRepository,
    { provide: CompanyRepository, useExisting: PrismaCompanyRepository },
    TechnicalInfoSourceService,
    PrismaTechnicalInfoSourceRepository,
    {
      provide: TechnicalInfoSourceRepository,
      useExisting: PrismaTechnicalInfoSourceRepository
    },
    // Ingredient core entity
    IngredientService,
    PrismaIngredientRepository,
    { provide: IngredientRepository, useExisting: PrismaIngredientRepository },
    // Junction tables
    IngredientTenantAllergenService,
    PrismaIngredientTenantAllergenRepository,
    {
      provide: IngredientTenantAllergenRepository,
      useExisting: PrismaIngredientTenantAllergenRepository
    },
    IngredientTenantNutrientService,
    PrismaIngredientTenantNutrientRepository,
    {
      provide: IngredientTenantNutrientRepository,
      useExisting: PrismaIngredientTenantNutrientRepository
    },
    // Base junction tables
    IngredientBaseAllergenService,
    PrismaIngredientBaseAllergenRepository,
    {
      provide: IngredientBaseAllergenRepository,
      useExisting: PrismaIngredientBaseAllergenRepository
    },
    IngredientBaseNutrientService,
    PrismaIngredientBaseNutrientRepository,
    {
      provide: IngredientBaseNutrientRepository,
      useExisting: PrismaIngredientBaseNutrientRepository
    },
    // Profile entities
    IngredientRegulatoryProfileService,
    PrismaIngredientRegulatoryProfileRepository,
    {
      provide: IngredientRegulatoryProfileRepository,
      useExisting: PrismaIngredientRegulatoryProfileRepository
    },
    IngredientLabelingProfileService,
    PrismaIngredientLabelingProfileRepository,
    {
      provide: IngredientLabelingProfileRepository,
      useExisting: PrismaIngredientLabelingProfileRepository
    },
    IngredientTechnicalProfileService,
    PrismaIngredientTechnicalProfileRepository,
    {
      provide: IngredientTechnicalProfileRepository,
      useExisting: PrismaIngredientTechnicalProfileRepository
    },
    // Platform-scoped catalogs (PL)
    Allergen_PLService,
    PrismaAllergen_PLRepository,
    {
      provide: Allergen_PLRepository,
      useExisting: PrismaAllergen_PLRepository
    },
    Nutrient_PLService,
    PrismaNutrient_PLRepository,
    {
      provide: Nutrient_PLRepository,
      useExisting: PrismaNutrient_PLRepository
    },
    DeclarationFlag_PLService,
    PrismaDeclarationFlag_PLRepository,
    {
      provide: DeclarationFlag_PLRepository,
      useExisting: PrismaDeclarationFlag_PLRepository
    },
    OgmDonorSpecies_PLService,
    PrismaOgmDonorSpecies_PLRepository,
    {
      provide: OgmDonorSpecies_PLRepository,
      useExisting: PrismaOgmDonorSpecies_PLRepository
    },
    TechnicalSourceType_PLService,
    PrismaTechnicalSourceType_PLRepository,
    {
      provide: TechnicalSourceType_PLRepository,
      useExisting: PrismaTechnicalSourceType_PLRepository
    },

    // Regulatory platform-scoped catalogs (PL)
    RegulatoryBody_PLService,
    PrismaRegulatoryBody_PLRepository,
    {
      provide: RegulatoryBody_PLRepository,
      useExisting: PrismaRegulatoryBody_PLRepository
    },
    RegulationType_PLService,
    PrismaRegulationType_PLRepository,
    {
      provide: RegulationType_PLRepository,
      useExisting: PrismaRegulationType_PLRepository
    },
    Regulation_PLService,
    PrismaRegulation_PLRepository,
    {
      provide: Regulation_PLRepository,
      useExisting: PrismaRegulation_PLRepository
    },
    ComplianceRule_PLService,
    PrismaComplianceRule_PLRepository,
    {
      provide: ComplianceRule_PLRepository,
      useExisting: PrismaComplianceRule_PLRepository
    }
  ],
  exports: [
    BaseAllergenRepository,
    BaseAllergenService,
    BaseNutrientRepository,
    BaseNutrientService,
    TenantAllergenRepository,
    TenantAllergenService,
    TenantNutrientRepository,
    TenantNutrientService,
    FunctionalGroupRepository,
    FunctionalGroupService,
    TechnicalSourceType_TE_Repository,
    TechnicalSourceType_TEService,
    CompanyRepository,
    CompanyService,
    TechnicalInfoSourceRepository,
    TechnicalInfoSourceService,
    IngredientRepository,
    IngredientService,
    // Junction tables
    IngredientTenantAllergenRepository,
    IngredientTenantAllergenService,
    IngredientTenantNutrientRepository,
    IngredientTenantNutrientService,
    // Base junction tables
    IngredientBaseAllergenRepository,
    IngredientBaseAllergenService,
    IngredientBaseNutrientRepository,
    IngredientBaseNutrientService,
    // Profile entities
    IngredientRegulatoryProfileRepository,
    IngredientRegulatoryProfileService,
    IngredientLabelingProfileRepository,
    IngredientLabelingProfileService,
    IngredientTechnicalProfileRepository,
    IngredientTechnicalProfileService,
    // Platform-scoped catalogs (PL)
    Allergen_PLRepository,
    Allergen_PLService,
    Nutrient_PLRepository,
    Nutrient_PLService,
    DeclarationFlag_PLRepository,
    DeclarationFlag_PLService,
    OgmDonorSpecies_PLRepository,
    OgmDonorSpecies_PLService,
    TechnicalSourceType_PLRepository,
    TechnicalSourceType_PLService,

    // Regulatory platform-scoped catalogs (PL)
    RegulatoryBody_PLRepository,
    RegulatoryBody_PLService,
    RegulationType_PLRepository,
    RegulationType_PLService,
    Regulation_PLRepository,
    Regulation_PLService,
    ComplianceRule_PLRepository,
    ComplianceRule_PLService
  ]
})
export class IngredientModule {}
