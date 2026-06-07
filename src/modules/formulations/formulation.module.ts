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

@Module({
  imports: [PrismaModule, AuditLogModule],
  controllers: [FormulationsController],
  providers: [
    FormulationService,
    PrismaFormulationVersionRepository,
    { provide: FormulationVersionRepository, useExisting: PrismaFormulationVersionRepository },
    PrismaFormulationRevisionRepository,
    { provide: FormulationRevisionRepository, useExisting: PrismaFormulationRevisionRepository },
    PrismaFormulationItemRepository,
    { provide: FormulationItemRepository, useExisting: PrismaFormulationItemRepository },
  ],
  exports: [
    FormulationVersionRepository, FormulationRevisionRepository, FormulationItemRepository,
    FormulationService,
  ],
})
export class FormulationsModule {}
