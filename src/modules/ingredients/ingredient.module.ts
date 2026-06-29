import { Module } from '@nestjs/common'
import { PrismaModule } from '@shared/prisma/prisma.module'
import { AuditLogModule } from '@audit-logs/audit-log.module'

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

// Additional tenant-scoped catalogs
import {
  FunctionalGroupRepository,
  PrismaFunctionalGroup_TERepository
} from '@ingredients/functional-group.repository'
import { FunctionalGroupService } from '@ingredients/functional-group.service'
import { FunctionalGroupsController } from '@ingredients/functional-group.controller'

import {
  TechnicalSourceType_TE_Repository,
  PrismaTechnicalSourceType_TE_Repository
} from '@ingredients/technical-source-type-te.repository'
import { TechnicalSourceType_TEService } from '@ingredients/technical-source-type-te.service'
import { TechnicalSourceType_TEController } from '@ingredients/technical-source-type-te.controller'

import {
  CompanyRepository,
  PrismaCompany_TERepository
} from '@ingredients/company.repository'
import { CompanyService } from '@ingredients/company.service'
import { CompaniesController } from '@ingredients/company.controller'

import {
  TechnicalSource_TE_Repository,
  PrismaTechnicalSource_TE_Repository
} from '@ingredients/technical-source-te.repository'
import { TechnicalSource_TEService } from '@ingredients/technical-source-te.service'
import { TechnicalSource_TEController } from '@ingredients/technical-source-te.controller'

// Ingredient core entity
import {
  IngredientRepository,
  PrismaIngredient_TERepository
} from '@ingredients/ingredient.repository'
import { IngredientService } from '@ingredients/ingredient.service'
import { IngredientsController } from '@ingredients/ingredient.controller'

// Ingredient junction entities (_TE)
import {
  IngredientAllergen_TE_Repository,
  PrismaIngredientAllergen_TE_Repository
} from '@ingredients/ingredient-allergen-te.repository'
import { IngredientAllergen_TEService } from '@ingredients/ingredient-allergen-te.service'
import { IngredientAllergen_TEController } from '@ingredients/ingredient-allergen-te.controller'

import {
  IngredientNutrient_TE_Repository,
  PrismaIngredientNutrient_TE_Repository
} from '@ingredients/ingredient-nutrient-te.repository'
import { IngredientNutrient_TEService } from '@ingredients/ingredient-nutrient-te.service'
import { IngredientNutrient_TEController } from '@ingredients/ingredient-nutrient-te.controller'

import {
  IngredientFlag_TE_Repository,
  PrismaIngredientFlag_TE_Repository
} from '@ingredients/ingredient-flag-te.repository'
import { IngredientFlag_TEService } from '@ingredients/ingredient-flag-te.service'
import { IngredientFlag_TEController } from '@ingredients/ingredient-flag-te.controller'

import {
  IngredientCost_TE_Repository,
  PrismaIngredientCost_TE_Repository
} from '@ingredients/ingredient-cost-te.repository'
import { IngredientCost_TEService } from '@ingredients/ingredient-cost-te.service'
import { IngredientCost_TEController } from '@ingredients/ingredient-cost-te.controller'

@Module({
  imports: [PrismaModule, AuditLogModule],
  controllers: [
    FunctionalGroupsController,
    CompaniesController,
    TechnicalSource_TEController,
    TechnicalSourceType_TEController,
    IngredientsController,
    IngredientAllergen_TEController,
    IngredientNutrient_TEController,
    IngredientFlag_TEController,
    IngredientCost_TEController,
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
    // Additional tenant-scoped catalogs
    FunctionalGroupService,
    PrismaFunctionalGroup_TERepository,
    {
      provide: FunctionalGroupRepository,
      useExisting: PrismaFunctionalGroup_TERepository
    },
    TechnicalSourceType_TEService,
    PrismaTechnicalSourceType_TE_Repository,
    {
      provide: TechnicalSourceType_TE_Repository,
      useExisting: PrismaTechnicalSourceType_TE_Repository
    },
    CompanyService,
    PrismaCompany_TERepository,
    { provide: CompanyRepository, useExisting: PrismaCompany_TERepository },
    TechnicalSource_TEService,
    PrismaTechnicalSource_TE_Repository,
    {
      provide: TechnicalSource_TE_Repository,
      useExisting: PrismaTechnicalSource_TE_Repository
    },
    // Ingredient core entity
    IngredientService,
    PrismaIngredient_TERepository,
    { provide: IngredientRepository, useExisting: PrismaIngredient_TERepository },
    // Ingredient junction entities (_TE)
    IngredientAllergen_TEService,
    PrismaIngredientAllergen_TE_Repository,
    {
      provide: IngredientAllergen_TE_Repository,
      useExisting: PrismaIngredientAllergen_TE_Repository
    },
    IngredientNutrient_TEService,
    PrismaIngredientNutrient_TE_Repository,
    {
      provide: IngredientNutrient_TE_Repository,
      useExisting: PrismaIngredientNutrient_TE_Repository
    },
    IngredientFlag_TEService,
    PrismaIngredientFlag_TE_Repository,
    {
      provide: IngredientFlag_TE_Repository,
      useExisting: PrismaIngredientFlag_TE_Repository
    },
    IngredientCost_TEService,
    PrismaIngredientCost_TE_Repository,
    {
      provide: IngredientCost_TE_Repository,
      useExisting: PrismaIngredientCost_TE_Repository
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
    FunctionalGroupRepository,
    FunctionalGroupService,
    TechnicalSourceType_TE_Repository,
    TechnicalSourceType_TEService,
    CompanyRepository,
    CompanyService,
    TechnicalSource_TE_Repository,
    TechnicalSource_TEService,
    IngredientRepository,
    IngredientService,
    // Ingredient junction entities (_TE)
    IngredientAllergen_TE_Repository,
    IngredientAllergen_TEService,
    IngredientNutrient_TE_Repository,
    IngredientNutrient_TEService,
    IngredientFlag_TE_Repository,
    IngredientFlag_TEService,
    IngredientCost_TE_Repository,
    IngredientCost_TEService,
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
