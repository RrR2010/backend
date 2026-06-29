import { Module } from '@nestjs/common'
import { PrismaModule } from '@shared/prisma/prisma.module'
import { AuditLogModule } from '@audit-logs/audit-log.module'
import { FormulationsController } from './formulation.controller'
import { FormulationService } from './formulation.service'
import {
  PrismaFormulationVersion_TE_Repository, FormulationVersion_TE_Repository,
  PrismaFormulationRevision_TE_Repository, FormulationRevision_TE_Repository,
  PrismaFormulationItem_TE_Repository, FormulationItem_TE_Repository,
} from './formulation.repository'

// Platform-scoped catalogs (PL)
import {
  UnitOfMeasure_PLRepository,
  PrismaUnitOfMeasure_PLRepository
} from './unit-of-measure-pl.repository'
import { UnitOfMeasure_PLService } from './unit-of-measure-pl.service'
import { UnitOfMeasure_PLController } from './unit-of-measure-pl.controller'

import {
  UnitConversion_PLRepository,
  PrismaUnitConversion_PLRepository
} from './unit-conversion-pl.repository'
import { UnitConversion_PLService } from './unit-conversion-pl.service'
import { UnitConversion_PLController } from './unit-conversion-pl.controller'

// Formulation sub-entities (Wave 6)
import {
  FormulationRegulatoryDeclaration_TE_Repository,
  PrismaFormulationRegulatoryDeclaration_TE_Repository
} from './formulation-regulatory-declaration-te.repository'
import { FormulationRegulatoryDeclaration_TEService } from './formulation-regulatory-declaration-te.service'
import { FormulationRegulatoryDeclaration_TEController } from './formulation-regulatory-declaration-te.controller'

import {
  FormulationAllergen_TE_Repository,
  PrismaFormulationAllergen_TE_Repository
} from './formulation-allergen-te.repository'
import { FormulationAllergen_TEService } from './formulation-allergen-te.service'
import { FormulationAllergen_TEController } from './formulation-allergen-te.controller'

import {
  FormulationNutrition_TE_Repository,
  PrismaFormulationNutrition_TE_Repository
} from './formulation-nutrition-te.repository'
import { FormulationNutrition_TEService } from './formulation-nutrition-te.service'
import { FormulationNutrition_TEController } from './formulation-nutrition-te.controller'

import {
  FormulationOgmDonor_TE_Repository,
  PrismaFormulationOgmDonor_TE_Repository
} from './formulation-ogm-donor-te.repository'
import { FormulationOgmDonor_TEService } from './formulation-ogm-donor-te.service'
import { FormulationOgmDonor_TEController } from './formulation-ogm-donor-te.controller'

@Module({
  imports: [PrismaModule, AuditLogModule],
  controllers: [
    FormulationsController,
    UnitOfMeasure_PLController,
    UnitConversion_PLController,
    FormulationRegulatoryDeclaration_TEController,
    FormulationAllergen_TEController,
    FormulationNutrition_TEController,
    FormulationOgmDonor_TEController
  ],
  providers: [
    FormulationService,
    PrismaFormulationVersion_TE_Repository,
    { provide: FormulationVersion_TE_Repository, useExisting: PrismaFormulationVersion_TE_Repository },
    PrismaFormulationRevision_TE_Repository,
    { provide: FormulationRevision_TE_Repository, useExisting: PrismaFormulationRevision_TE_Repository },
    PrismaFormulationItem_TE_Repository,
    { provide: FormulationItem_TE_Repository, useExisting: PrismaFormulationItem_TE_Repository },
    // Platform-scoped catalogs (PL)
    UnitOfMeasure_PLService,
    PrismaUnitOfMeasure_PLRepository,
    { provide: UnitOfMeasure_PLRepository, useExisting: PrismaUnitOfMeasure_PLRepository },
    UnitConversion_PLService,
    PrismaUnitConversion_PLRepository,
    { provide: UnitConversion_PLRepository, useExisting: PrismaUnitConversion_PLRepository },
    // Formulation sub-entities (Wave 6)
    FormulationRegulatoryDeclaration_TEService,
    PrismaFormulationRegulatoryDeclaration_TE_Repository,
    { provide: FormulationRegulatoryDeclaration_TE_Repository, useExisting: PrismaFormulationRegulatoryDeclaration_TE_Repository },
    FormulationAllergen_TEService,
    PrismaFormulationAllergen_TE_Repository,
    { provide: FormulationAllergen_TE_Repository, useExisting: PrismaFormulationAllergen_TE_Repository },
    FormulationNutrition_TEService,
    PrismaFormulationNutrition_TE_Repository,
    { provide: FormulationNutrition_TE_Repository, useExisting: PrismaFormulationNutrition_TE_Repository },
    FormulationOgmDonor_TEService,
    PrismaFormulationOgmDonor_TE_Repository,
    { provide: FormulationOgmDonor_TE_Repository, useExisting: PrismaFormulationOgmDonor_TE_Repository },
  ],
  exports: [
    FormulationVersion_TE_Repository, FormulationRevision_TE_Repository, FormulationItem_TE_Repository,
    FormulationService,
    // Platform-scoped catalogs (PL)
    UnitOfMeasure_PLRepository,
    UnitOfMeasure_PLService,
    UnitConversion_PLRepository,
    UnitConversion_PLService,
    // Formulation sub-entities (Wave 6)
    FormulationRegulatoryDeclaration_TE_Repository,
    FormulationRegulatoryDeclaration_TEService,
    FormulationAllergen_TE_Repository,
    FormulationAllergen_TEService,
    FormulationNutrition_TE_Repository,
    FormulationNutrition_TEService,
    FormulationOgmDonor_TE_Repository,
    FormulationOgmDonor_TEService,
  ],
})
export class FormulationsModule {}
