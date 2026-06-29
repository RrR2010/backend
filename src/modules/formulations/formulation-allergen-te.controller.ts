import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Patch,
  ParseUUIDPipe,
  Req
} from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { InternalServerErrorException } from '@nestjs/common'
import { getEffectiveTenantId } from '@shared/helpers/tenant-context.helper'
import {
  CreateFormulationAllergen_TEDto,
  CreateFormulationAllergen_TE_ResponseDto,
  FormulationAllergen_TE_ResponseDto,
  UpdateFormulationAllergen_TEDto
} from './formulation-allergen-te.dto'
import { FormulationAllergen_TEService } from './formulation-allergen-te.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { FormulationAllergen_TE } from './formulation-allergen-te.entity'

@ApiTags('Formulation Allergens (TE)')
@ApiBearerAuth('accessToken')
@Controller('formulation-allergens')
export class FormulationAllergen_TEController {
  constructor(private readonly service: FormulationAllergen_TEService) {}

  @Post()
  @Authorize(Action.Manage, FormulationAllergen_TE)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateFormulationAllergen_TEDto,
    @Req() request: Request
  ): Promise<CreateFormulationAllergen_TE_ResponseDto> {
    const tenantId = getEffectiveTenantId(request.context)
    if (!tenantId) throw new InternalServerErrorException('tenantId is required')
    const entry = await this.service.create(
      {
        tenantId,
        formulationRevisionId: dto.formulationRevisionId,
        allergenDeclaration: dto.allergenDeclaration ?? null,
        allergenMayContain: dto.allergenMayContain ?? null
      },
      request.context
    )
    return CreateFormulationAllergen_TE_ResponseDto.fromDomain(entry)
  }

  @Get(':id')
  @Authorize(Action.Read, FormulationAllergen_TE)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<FormulationAllergen_TE_ResponseDto> {
    const entry = await this.service.findById(id, request.context)
    return FormulationAllergen_TE_ResponseDto.fromDomain(entry)
  }

  @Get('by-revision/:revisionId')
  @Authorize(Action.Read, FormulationAllergen_TE)
  async findByRevision(
    @Param('revisionId', ParseUUIDPipe) revisionId: string,
    @Req() request: Request
  ): Promise<FormulationAllergen_TE_ResponseDto | null> {
    const entry = await this.service.findByRevisionId(
      revisionId,
      request.context
    )
    if (!entry) return null
    return FormulationAllergen_TE_ResponseDto.fromDomain(entry)
  }

  @Patch(':id')
  @Authorize(Action.Manage, FormulationAllergen_TE)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFormulationAllergen_TEDto,
    @Req() request: Request
  ): Promise<FormulationAllergen_TE_ResponseDto> {
    const entry = await this.service.findById(id, request.context)

    if (dto.allergenDeclaration !== undefined)
      entry.changeAllergenDeclaration(dto.allergenDeclaration)
    if (dto.allergenMayContain !== undefined)
      entry.changeAllergenMayContain(dto.allergenMayContain)

    const saved = await this.service.save(entry, request.context)
    return FormulationAllergen_TE_ResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Manage, FormulationAllergen_TE)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }
}
