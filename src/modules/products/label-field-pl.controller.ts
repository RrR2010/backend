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
import {
  CreateLabelField_PLDto,
  CreateLabelField_PLResponseDto,
  LabelField_PLResponseDto,
  UpdateLabelField_PLDto
} from '@products/label-field-pl.dto'
import { LabelField_PLService } from '@products/label-field-pl.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { LabelField_PL } from '@products/label-field-pl.entity'

@ApiTags('Label Fields PL')
@ApiBearerAuth('accessToken')
@Controller('label-fields-pl')
export class LabelField_PLController {
  constructor(private readonly service: LabelField_PLService) {}

  @Post()
  @Authorize(Action.Manage, LabelField_PL)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateLabelField_PLDto,
    @Req() request: Request
  ): Promise<CreateLabelField_PLResponseDto> {
    const labelField = await this.service.create(
      {
        fieldName: dto.fieldName,
        sortOrder: dto.sortOrder ?? 0
      },
      request.context
    )
    return CreateLabelField_PLResponseDto.fromDomain(labelField)
  }

  @Get()
  @Authorize(Action.Manage, LabelField_PL)
  async findAll(
    @Req() request: Request
  ): Promise<LabelField_PLResponseDto[]> {
    const fields = await this.service.findAll(request.context)
    return fields.map((f) => LabelField_PLResponseDto.fromDomain(f))
  }

  @Get(':id')
  @Authorize(Action.Manage, LabelField_PL)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<LabelField_PLResponseDto> {
    const labelField = await this.service.findById(id, request.context)
    return LabelField_PLResponseDto.fromDomain(labelField)
  }

  @Patch(':id')
  @Authorize(Action.Manage, LabelField_PL)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLabelField_PLDto,
    @Req() request: Request
  ): Promise<LabelField_PLResponseDto> {
    const labelField = await this.service.findById(id, request.context)

    if (dto.fieldName) labelField.changeFieldName(dto.fieldName)
    if (dto.sortOrder !== undefined) labelField.changeSortOrder(dto.sortOrder)

    const saved = await this.service.save(labelField, request.context)
    return LabelField_PLResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Manage, LabelField_PL)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Manage, LabelField_PL)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<LabelField_PLResponseDto> {
    const labelField = await this.service.activate(id, request.context)
    return LabelField_PLResponseDto.fromDomain(labelField)
  }

  @Post(':id/lock')
  @Authorize(Action.Manage, LabelField_PL)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<LabelField_PLResponseDto> {
    const labelField = await this.service.lock(id, request.context)
    return LabelField_PLResponseDto.fromDomain(labelField)
  }

  @Post(':id/unlock')
  @Authorize(Action.Manage, LabelField_PL)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<LabelField_PLResponseDto> {
    const labelField = await this.service.unlock(id, request.context)
    return LabelField_PLResponseDto.fromDomain(labelField)
  }
}
