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
  CreateClaim_TEDto,
  CreateClaim_TEDtoResponseDto,
  Claim_TEDtoResponseDto,
  UpdateClaim_TEDto
} from '@products/claim-te.dto'
import { Claim_TEService } from '@products/claim-te.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { Claim_TE } from '@products/claim-te.entity'

@ApiTags('Claims')
@ApiBearerAuth('accessToken')
@Controller('claims')
export class ClaimsController {
  constructor(private readonly service: Claim_TEService) {}

  @Post()
  @Authorize(Action.Create, Claim_TE)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateClaim_TEDto,
    @Req() request: Request
  ): Promise<CreateClaim_TEDtoResponseDto> {
    const claim = await this.service.create(
      {
        tenantId: dto.tenantId,
        code: dto.code,
        name: dto.name,
        description: dto.description ?? null
      },
      request.context
    )
    return CreateClaim_TEDtoResponseDto.fromDomain(claim)
  }

  @Get()
  @Authorize(Action.Read, Claim_TE)
  async findAll(
    @Req() request: Request
  ): Promise<Claim_TEDtoResponseDto[]> {
    const claims = await this.service.findAll({}, request.context)
    return claims.map(Claim_TEDtoResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, Claim_TE)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<Claim_TEDtoResponseDto> {
    const claim = await this.service.findById(id, request.context)
    return Claim_TEDtoResponseDto.fromDomain(claim)
  }

  @Patch(':id')
  @Authorize(Action.Update, Claim_TE)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClaim_TEDto,
    @Req() request: Request
  ): Promise<Claim_TEDtoResponseDto> {
    const claim = await this.service.findById(id, request.context)

    if (dto.code !== undefined) claim.changeCode(dto.code)
    if (dto.name) claim.changeName(dto.name)
    if (dto.description !== undefined) claim.changeDescription(dto.description)

    const saved = await this.service.save(claim, request.context)
    return Claim_TEDtoResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, Claim_TE)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, Claim_TE)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<Claim_TEDtoResponseDto> {
    const entity = await this.service.activate(id, request.context)
    return Claim_TEDtoResponseDto.fromDomain(entity)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, Claim_TE)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<Claim_TEDtoResponseDto> {
    const entity = await this.service.lock(id, request.context)
    return Claim_TEDtoResponseDto.fromDomain(entity)
  }

  @Post(':id/unlock')
  @Authorize(Action.Unlock, Claim_TE)
  async unlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<Claim_TEDtoResponseDto> {
    const entity = await this.service.unlock(id, request.context)
    return Claim_TEDtoResponseDto.fromDomain(entity)
  }
}
