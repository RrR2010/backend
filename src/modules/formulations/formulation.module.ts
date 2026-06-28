import { Module } from '@nestjs/common'
import { PrismaModule } from '@shared/prisma/prisma.module'
import { AuditLogModule } from '@audit-logs/audit-log.module'
import { FormulationsController } from './formulation.controller'
import { FormulationService } from './formulation.service'
import {
  PrismaFormulationVersionRepository, FormulationVersionRepository,
  PrismaFormulationRevisionRepository, FormulationRevisionRepository,
  PrismaFormulationItemRepository, FormulationItemRepository,
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

@Module({
  imports: [PrismaModule, AuditLogModule],
  controllers: [
    FormulationsController,
    UnitOfMeasure_PLController,
    UnitConversion_PLController
  ],
  providers: [
    FormulationService,
    PrismaFormulationVersionRepository,
    { provide: FormulationVersionRepository, useExisting: PrismaFormulationVersionRepository },
    PrismaFormulationRevisionRepository,
    { provide: FormulationRevisionRepository, useExisting: PrismaFormulationRevisionRepository },
    PrismaFormulationItemRepository,
    { provide: FormulationItemRepository, useExisting: PrismaFormulationItemRepository },
    // Platform-scoped catalogs (PL)
    UnitOfMeasure_PLService,
    PrismaUnitOfMeasure_PLRepository,
    { provide: UnitOfMeasure_PLRepository, useExisting: PrismaUnitOfMeasure_PLRepository },
    UnitConversion_PLService,
    PrismaUnitConversion_PLRepository,
    { provide: UnitConversion_PLRepository, useExisting: PrismaUnitConversion_PLRepository },
  ],
  exports: [
    FormulationVersionRepository, FormulationRevisionRepository, FormulationItemRepository,
    FormulationService,
    // Platform-scoped catalogs (PL)
    UnitOfMeasure_PLRepository,
    UnitOfMeasure_PLService,
    UnitConversion_PLRepository,
    UnitConversion_PLService,
  ],
})
export class FormulationsModule {}
