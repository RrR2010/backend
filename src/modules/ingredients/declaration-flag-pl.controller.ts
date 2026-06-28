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
import { DeclarationFlagScope } from '@prisma/client'
import type { Request } from 'express'
import {
  CreateDeclarationFlag_PLDto,
  CreateDeclarationFlag_PLResponseDto,
  DeclarationFlag_PLResponseDto,
  UpdateDeclarationFlag_PLDto
} from '@ingredients/declaration-flag-pl.dto'
import { DeclarationFlag_PLService } from '@ingredients/declaration-flag-pl.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { DeclarationFlag_PL } from '@ingredients/declaration-flag-pl.entity'

@ApiTags('Declaration Flags PL')
@ApiBearerAuth('accessToken')
@Controller('declaration-flags-pl')
export class DeclarationFlag_PLController {
  constructor(private readonly service: DeclarationFlag_PLService) {}

  @Post()
  @Authorize(Action.Manage, DeclarationFlag_PL)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateDeclarationFlag_PLDto,
    @Req() request: Request
  ): Promise<CreateDeclarationFlag_PLResponseDto> {
    const flag = await this.service.create(
      {
        code: dto.code,
        name: dto.name,
        description: dto.description ?? null,
        appliesTo: dto.appliesTo ?? DeclarationFlagScope.BOTH
      },
      request.context
    )
    return CreateDeclarationFlag_PLResponseDto.fromDomain(flag)
  }

  @Get()
  @Authorize(Action.Manage, DeclarationFlag_PL)
  async findAll(
    @Req() request: Request
  ): Promise<DeclarationFlag_PLResponseDto[]> {
    const flags = await this.service.findAll(request.context)
    return flags.map((f) => DeclarationFlag_PLResponseDto.fromDomain(f))
  }

  @Get(':id')
  @Authorize(Action.Manage, DeclarationFlag_PL)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<DeclarationFlag_PLResponseDto> {
    const flag = await this.service.findById(id, request.context)
    return DeclarationFlag_PLResponseDto.fromDomain(flag)
  }

  @Patch(':id')
  @Authorize(Action.Manage, DeclarationFlag_PL)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDeclarationFlag_PLDto,
    @Req() request: Request
  ): Promise<DeclarationFlag_PLResponseDto> {
    const flag = await this.service.findById(id, request.context)

    if (dto.code) flag.changeCode(dto.code)
    if (dto.name) flag.changeName(dto.name)
    if (dto.description !== undefined)
      flag.changeDescription(dto.description)
    if (dto.appliesTo) flag.changeAppliesTo(dto.appliesTo)

    const saved = await this.service.save(flag, request.context)
    return DeclarationFlag_PLResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Manage, DeclarationFlag_PL)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Manage, DeclarationFlag_PL)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<DeclarationFlag_PLResponseDto> {
    const flag = await this.service.activate(id, request.context)
    return DeclarationFlag_PLResponseDto.fromDomain(flag)
  }

  @Post(':id/lock')
  @Authorize(Action.Manage, DeclarationFlag_PL)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<DeclarationFlag_PLResponseDto> {
    const flag = await this.service.lock(id, request.context)
    return DeclarationFlag_PLResponseDto.fromDomain(flag)
  }

  @Post(':id/unlock')
  @Authorize(Action.Manage, DeclarationFlag_PL)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<DeclarationFlag_PLResponseDto> {
    const flag = await this.service.unlock(id, request.context)
    return DeclarationFlag_PLResponseDto.fromDomain(flag)
  }
}
