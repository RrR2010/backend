import { Module } from '@nestjs/common'
import { PrismaModule } from '@shared/prisma/prisma.module'

// Base catalogs
import { BaseAllergenRepository, PrismaBaseAllergenRepository } from '@ingredients/base-allergen.repository'
import { BaseAllergenService } from '@ingredients/base-allergen.service'
import { BaseAllergenController } from '@ingredients/base-allergen.controller'

import { BaseNutrientRepository, PrismaBaseNutrientRepository } from '@ingredients/base-nutrient.repository'
import { BaseNutrientService } from '@ingredients/base-nutrient.service'
import { BaseNutrientController } from '@ingredients/base-nutrient.controller'

// Tenant-scoped catalogs
import { AllergenRepository, PrismaAllergenRepository } from '@ingredients/allergen.repository'
import { AllergenService } from '@ingredients/allergen.service'
import { AllergensController } from '@ingredients/allergen.controller'

import { NutrientRepository, PrismaNutrientRepository } from '@ingredients/nutrient.repository'
import { NutrientService } from '@ingredients/nutrient.service'
import { NutrientsController } from '@ingredients/nutrient.controller'

// Additional tenant-scoped catalogs
import { FunctionalGroupRepository, PrismaFunctionalGroupRepository } from '@ingredients/functional-group.repository'
import { FunctionalGroupService } from '@ingredients/functional-group.service'
import { FunctionalGroupsController } from '@ingredients/functional-group.controller'

import { CompanyRepository, PrismaCompanyRepository } from '@ingredients/company.repository'
import { CompanyService } from '@ingredients/company.service'
import { CompaniesController } from '@ingredients/company.controller'

import { TechnicalInfoSourceRepository, PrismaTechnicalInfoSourceRepository } from '@ingredients/technical-info-source.repository'
import { TechnicalInfoSourceService } from '@ingredients/technical-info-source.service'
import { TechnicalInfoSourcesController } from '@ingredients/technical-info-source.controller'

// Ingredient core entity
import { IngredientRepository, PrismaIngredientRepository } from '@ingredients/ingredient.repository'
import { IngredientService } from '@ingredients/ingredient.service'
import { IngredientsController } from '@ingredients/ingredient.controller'

// Junction tables (no controllers — managed through Ingredient aggregate)
import { IngredientAllergenRepository, PrismaIngredientAllergenRepository } from '@ingredients/ingredient-allergen.repository'
import { IngredientAllergenService } from '@ingredients/ingredient-allergen.service'

import { IngredientNutrientRepository, PrismaIngredientNutrientRepository } from '@ingredients/ingredient-nutrient.repository'
import { IngredientNutrientService } from '@ingredients/ingredient-nutrient.service'

// Profile entities
import { IngredientRegulatoryProfileRepository, PrismaIngredientRegulatoryProfileRepository } from '@ingredients/ingredient-regulatory-profile.repository'
import { IngredientRegulatoryProfileService } from '@ingredients/ingredient-regulatory-profile.service'
import { IngredientRegulatoryProfilesController } from '@ingredients/ingredient-regulatory-profile.controller'

import { IngredientLabelingProfileRepository, PrismaIngredientLabelingProfileRepository } from '@ingredients/ingredient-labeling-profile.repository'
import { IngredientLabelingProfileService } from '@ingredients/ingredient-labeling-profile.service'
import { IngredientLabelingProfilesController } from '@ingredients/ingredient-labeling-profile.controller'

import { IngredientTechnicalProfileRepository, PrismaIngredientTechnicalProfileRepository } from '@ingredients/ingredient-technical-profile.repository'
import { IngredientTechnicalProfileService } from '@ingredients/ingredient-technical-profile.service'
import { IngredientTechnicalProfilesController } from '@ingredients/ingredient-technical-profile.controller'

@Module({
  imports: [PrismaModule],
  controllers: [
    BaseAllergenController,
    BaseNutrientController,
    AllergensController,
    NutrientsController,
    FunctionalGroupsController,
    CompaniesController,
    TechnicalInfoSourcesController,
    IngredientsController,
    IngredientRegulatoryProfilesController,
    IngredientLabelingProfilesController,
    IngredientTechnicalProfilesController
  ],
  providers: [
    // Base catalogs
    BaseAllergenService,
    PrismaBaseAllergenRepository,
    { provide: BaseAllergenRepository, useExisting: PrismaBaseAllergenRepository },
    BaseNutrientService,
    PrismaBaseNutrientRepository,
    { provide: BaseNutrientRepository, useExisting: PrismaBaseNutrientRepository },
    // Tenant-scoped catalogs
    AllergenService,
    PrismaAllergenRepository,
    { provide: AllergenRepository, useExisting: PrismaAllergenRepository },
    NutrientService,
    PrismaNutrientRepository,
    { provide: NutrientRepository, useExisting: PrismaNutrientRepository },
    // Additional tenant-scoped catalogs
    FunctionalGroupService,
    PrismaFunctionalGroupRepository,
    { provide: FunctionalGroupRepository, useExisting: PrismaFunctionalGroupRepository },
    CompanyService,
    PrismaCompanyRepository,
    { provide: CompanyRepository, useExisting: PrismaCompanyRepository },
    TechnicalInfoSourceService,
    PrismaTechnicalInfoSourceRepository,
    { provide: TechnicalInfoSourceRepository, useExisting: PrismaTechnicalInfoSourceRepository },
    // Ingredient core entity
    IngredientService,
    PrismaIngredientRepository,
    { provide: IngredientRepository, useExisting: PrismaIngredientRepository },
    // Junction tables
    IngredientAllergenService,
    PrismaIngredientAllergenRepository,
    { provide: IngredientAllergenRepository, useExisting: PrismaIngredientAllergenRepository },
    IngredientNutrientService,
    PrismaIngredientNutrientRepository,
    { provide: IngredientNutrientRepository, useExisting: PrismaIngredientNutrientRepository },
    // Profile entities
    IngredientRegulatoryProfileService,
    PrismaIngredientRegulatoryProfileRepository,
    { provide: IngredientRegulatoryProfileRepository, useExisting: PrismaIngredientRegulatoryProfileRepository },
    IngredientLabelingProfileService,
    PrismaIngredientLabelingProfileRepository,
    { provide: IngredientLabelingProfileRepository, useExisting: PrismaIngredientLabelingProfileRepository },
    IngredientTechnicalProfileService,
    PrismaIngredientTechnicalProfileRepository,
    { provide: IngredientTechnicalProfileRepository, useExisting: PrismaIngredientTechnicalProfileRepository },
  ],
  exports: [
    BaseAllergenRepository,
    BaseAllergenService,
    BaseNutrientRepository,
    BaseNutrientService,
    AllergenRepository,
    AllergenService,
    NutrientRepository,
    NutrientService,
    FunctionalGroupRepository,
    FunctionalGroupService,
    CompanyRepository,
    CompanyService,
    TechnicalInfoSourceRepository,
    TechnicalInfoSourceService,
    IngredientRepository,
    IngredientService,
    // Junction tables
    IngredientAllergenRepository,
    IngredientAllergenService,
    IngredientNutrientRepository,
    IngredientNutrientService,
    // Profile entities
    IngredientRegulatoryProfileRepository,
    IngredientRegulatoryProfileService,
    IngredientLabelingProfileRepository,
    IngredientLabelingProfileService,
    IngredientTechnicalProfileRepository,
    IngredientTechnicalProfileService,
  ],
})
export class IngredientModule {}
