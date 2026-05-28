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
  CreateFunctionalGroupDto,
  CreateFunctionalGroupResponseDto,
  FunctionalGroupResponseDto,
  UpdateFunctionalGroupDto
} from '@ingredients/functional-group.dto'
import { FunctionalGroupService } from '@ingredients/functional-group.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { FunctionalGroup } from '@ingredients/functional-group.entity'

@ApiTags('FunctionalGroups')
@ApiBearerAuth('accessToken')
@Controller('functional-groups')
export class FunctionalGroupsController {
  constructor(private readonly service: FunctionalGroupService) {}

  @Post()
  @Authorize(Action.Create, FunctionalGroup)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateFunctionalGroupDto,
    @Req() request: Request
  ): Promise<CreateFunctionalGroupResponseDto> {
    const group = await this.service.create(
      {
        tenantId: dto.tenantId,
        name: dto.name,
        code: dto.code ?? null,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true
      },
      request.context
    )
    return CreateFunctionalGroupResponseDto.fromDomain(group)
  }

  @Get()
  @Authorize(Action.Read, FunctionalGroup)
  async findAll(@Req() request: Request): Promise<FunctionalGroupResponseDto[]> {
    const groups = await this.service.findAll({}, request.context)
    return groups.map(FunctionalGroupResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, FunctionalGroup)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<FunctionalGroupResponseDto> {
    const group = await this.service.findById(id, request.context)
    return FunctionalGroupResponseDto.fromDomain(group)
  }

  @Patch(':id')
  @Authorize(Action.Update, FunctionalGroup)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFunctionalGroupDto,
    @Req() request: Request
  ): Promise<FunctionalGroupResponseDto> {
    const group = await this.service.findById(id, request.context)

    if (dto.name) group.changeName(dto.name)
    if (dto.code !== undefined) group.changeCode(dto.code)
    if (dto.sortOrder !== undefined) group.changeSortOrder(dto.sortOrder)
    if (dto.isActive !== undefined) {
      dto.isActive ? group.setActive() : group.setInactive()
    }

    const saved = await this.service.save(group, request.context)
    return FunctionalGroupResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, FunctionalGroup)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, FunctionalGroup)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<FunctionalGroupResponseDto> {
    const group = await this.service.activate(id, request.context)
    return FunctionalGroupResponseDto.fromDomain(group)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, FunctionalGroup)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<FunctionalGroupResponseDto> {
    const group = await this.service.lock(id, request.context)
    return FunctionalGroupResponseDto.fromDomain(group)
  }

  @Post(':id/unlock')
  @Authorize(Action.Unlock, FunctionalGroup)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<FunctionalGroupResponseDto> {
    const group = await this.service.unlock(id, request.context)
    return FunctionalGroupResponseDto.fromDomain(group)
  }
}
