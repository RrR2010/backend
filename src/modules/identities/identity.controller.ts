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
import type { Request } from 'express'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import {
  CreateIdentityDto,
  CreateIdentityResponseDto,
  IdentityResponseDto
} from '@identities/identity.dto'
import { Authorize } from '@authorization/authorization.decorators'
import { Action, RequestContext } from '@authorization/authorization.types'
import { Identity } from '@identities/identity.entity'
import { IdentityService } from '@identities/identity.service'

@ApiTags('Identities')
@ApiBearerAuth('accessToken')
@Controller('identities')
export class IdentitiesController {
  constructor(private readonly identityService: IdentityService) {}



  @Post()
  @Authorize(Action.Create, Identity)
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  async create(
    @Body() dto: CreateIdentityDto,
    @Req() request: Request
  ): Promise<CreateIdentityResponseDto> {
    const identity = await this.identityService.create(dto, request.context)
    return CreateIdentityResponseDto.fromDomain(identity)
  }

  @Get()
  @Authorize(Action.Read, Identity)
  async findAll(@Req() request: Request): Promise<IdentityResponseDto[]> {
    const identities = await this.identityService.findAll(
      {},
      request.context
    )
    return identities.map((identity) =>
      IdentityResponseDto.fromDomain(identity)
    )
  }

  @Get(':id')
  @Authorize(Action.Read, Identity)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<IdentityResponseDto | null> {
    const identity = await this.identityService.findById(id, request.context)
    return identity ? IdentityResponseDto.fromDomain(identity) : null
  }

  @Patch(':id')
  @Authorize(Action.Update, Identity)
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateIdentityDto,
    @Req() request: Request
  ): Promise<IdentityResponseDto> {
    const identity = await this.identityService.save(
      Identity.create({
        userId: dto.userId,
        authProviderType: dto.provider,
        identifier: dto.identifier,
        secretHash: dto.secret || null
      }),
      request.context
    )
    return IdentityResponseDto.fromDomain(identity)
  }

  @Delete(':id')
  @Authorize(Action.Delete, Identity)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.identityService.delete(id, request.context)
  }
}
