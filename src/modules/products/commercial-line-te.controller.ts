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
  CreateCommercialLine_TEDto,
  CreateCommercialLine_TEDtoResponseDto,
  CommercialLine_TEDtoResponseDto,
  UpdateCommercialLine_TEDto
} from '@products/commercial-line-te.dto'
import { CommercialLine_TEService } from '@products/commercial-line-te.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { CommercialLine_TE } from '@products/commercial-line-te.entity'

@ApiTags('CommercialLines')
@ApiBearerAuth('accessToken')
@Controller('commercial-lines')
export class CommercialLinesController {
  constructor(private readonly service: CommercialLine_TEService) {}

  @Post()
  @Authorize(Action.Create, CommercialLine_TE)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateCommercialLine_TEDto,
    @Req() request: Request
  ): Promise<CreateCommercialLine_TEDtoResponseDto> {
    const line = await this.service.create(
      {
        name: dto.name,
        description: dto.description ?? null
      },
      request.context
    )
    return CreateCommercialLine_TEDtoResponseDto.fromDomain(line)
  }

  @Get()
  @Authorize(Action.Read, CommercialLine_TE)
  async findAll(
    @Req() request: Request
  ): Promise<CommercialLine_TEDtoResponseDto[]> {
    const lines = await this.service.findAll({}, request.context)
    return lines.map(CommercialLine_TEDtoResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, CommercialLine_TE)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<CommercialLine_TEDtoResponseDto> {
    const line = await this.service.findById(id, request.context)
    return CommercialLine_TEDtoResponseDto.fromDomain(line)
  }

  @Patch(':id')
  @Authorize(Action.Update, CommercialLine_TE)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCommercialLine_TEDto,
    @Req() request: Request
  ): Promise<CommercialLine_TEDtoResponseDto> {
    const line = await this.service.findById(id, request.context)

    if (dto.name !== undefined) line.changeName(dto.name)
    if (dto.description !== undefined) line.changeDescription(dto.description)

    const saved = await this.service.save(line, request.context)
    return CommercialLine_TEDtoResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, CommercialLine_TE)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, CommercialLine_TE)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<CommercialLine_TEDtoResponseDto> {
    const entity = await this.service.activate(id, request.context)
    return CommercialLine_TEDtoResponseDto.fromDomain(entity)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, CommercialLine_TE)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<CommercialLine_TEDtoResponseDto> {
    const entity = await this.service.lock(id, request.context)
    return CommercialLine_TEDtoResponseDto.fromDomain(entity)
  }

  @Post(':id/unlock')
  @Authorize(Action.Unlock, CommercialLine_TE)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<CommercialLine_TEDtoResponseDto> {
    const entity = await this.service.unlock(id, request.context)
    return CommercialLine_TEDtoResponseDto.fromDomain(entity)
  }
}
