import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Patch,
  ParseUUIDPipe,
  Query,
  Req
} from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import {
  CreateFunctionalGroup_TEDto,
  CreateFunctionalGroup_TE_ResponseDto,
  FunctionalGroup_TE_ResponseDto,
  UpdateFunctionalGroup_TEDto
} from '@ingredients/functional-group.dto'
import { FunctionalGroupService } from '@ingredients/functional-group.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { FunctionalGroup_TE } from '@ingredients/functional-group.entity'

@ApiTags('FunctionalGroups')
@ApiBearerAuth('accessToken')
@Controller('functional-groups')
export class FunctionalGroupsController {
  constructor(private readonly service: FunctionalGroupService) {}

  @Post()
  @Authorize(Action.Create, FunctionalGroup_TE)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateFunctionalGroup_TEDto,
    @Req() request: Request
  ): Promise<CreateFunctionalGroup_TE_ResponseDto> {
    const group = await this.service.create(
      {
        name: dto.name,
        code: dto.code ?? null,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true
      },
      request.context
    )
    return CreateFunctionalGroup_TE_ResponseDto.fromDomain(group)
  }

  @Get()
  @Authorize(Action.Read, FunctionalGroup_TE)
  async findAll(
    @Req() request: Request,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ): Promise<FunctionalGroup_TE_ResponseDto[]> {
    const groups = await this.service.findAll(
      { skip: Number(offset) || 0, take: Number(limit) || 50 },
      request.context
    )
    return groups.map(FunctionalGroup_TE_ResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, FunctionalGroup_TE)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<FunctionalGroup_TE_ResponseDto> {
    const group = await this.service.findById(id, request.context)
    return FunctionalGroup_TE_ResponseDto.fromDomain(group)
  }

  @Patch(':id')
  @Authorize(Action.Update, FunctionalGroup_TE)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFunctionalGroup_TEDto,
    @Req() request: Request
  ): Promise<FunctionalGroup_TE_ResponseDto> {
    const group = await this.service.findById(id, request.context)

    if (dto.name) group.changeName(dto.name)
    if (dto.code !== undefined) group.changeCode(dto.code)
    if (dto.sortOrder !== undefined) group.changeSortOrder(dto.sortOrder)
    if (dto.isActive !== undefined) {
      dto.isActive ? group.setActive() : group.setInactive()
    }

    const saved = await this.service.save(group, request.context)
    return FunctionalGroup_TE_ResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, FunctionalGroup_TE)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, FunctionalGroup_TE)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<FunctionalGroup_TE_ResponseDto> {
    const group = await this.service.activate(id, request.context)
    return FunctionalGroup_TE_ResponseDto.fromDomain(group)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, FunctionalGroup_TE)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<FunctionalGroup_TE_ResponseDto> {
    const group = await this.service.lock(id, request.context)
    return FunctionalGroup_TE_ResponseDto.fromDomain(group)
  }

  @Post(':id/unlock')
  @Authorize(Action.Unlock, FunctionalGroup_TE)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<FunctionalGroup_TE_ResponseDto> {
    const group = await this.service.unlock(id, request.context)
    return FunctionalGroup_TE_ResponseDto.fromDomain(group)
  }
}
