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
    IngredientsController,
    IngredientTenantAllergensController,
    IngredientTenantNutrientsController,
    IngredientRegulatoryProfilesController,
    IngredientLabelingProfilesController,
    IngredientTechnicalProfilesController
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
    // Profile entities
    IngredientRegulatoryProfileRepository,
    IngredientRegulatoryProfileService,
    IngredientLabelingProfileRepository,
    IngredientLabelingProfileService,
    IngredientTechnicalProfileRepository,
    IngredientTechnicalProfileService
  ]
})
export class IngredientModule {}
