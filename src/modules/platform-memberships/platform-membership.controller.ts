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
  CreatePlatformMembershipDto,
  CreatePlatformMembershipResponseDto,
  PlatformMembershipResponseDto,
  UpdatePlatformMembershipDto
} from '@platform-memberships/platform-membership.dto'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import type { RequestContext } from '@authorization/authorization.types'
import { PlatformMembership } from '@platform-memberships/platform-membership.entity'
import { PlatformMembershipService } from '@platform-memberships/platform-membership.service'
import { PlatformRole } from '@users/user.types'

@ApiTags('Platform Memberships')
@ApiBearerAuth('accessToken')
@Controller('platform-memberships')
export class PlatformMembershipsController {
  constructor(private readonly service: PlatformMembershipService) {}


  @Post()
  @Authorize(Action.Create, PlatformMembership)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreatePlatformMembershipDto,
    @Req() request: Request
  ): Promise<CreatePlatformMembershipResponseDto> {
    const membership = await this.service.create(
      { userId: dto.userId, roles: dto.roles },
      request.context
    )
    return CreatePlatformMembershipResponseDto.fromDomain(membership)
  }

  @Get()
  @Authorize(Action.Read, PlatformMembership)
  async findAll(@Req() request: Request): Promise<PlatformMembershipResponseDto[]> {
    const memberships = await this.service.findAll({}, request.context)
    return memberships.map(PlatformMembershipResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, PlatformMembership)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<PlatformMembershipResponseDto> {
    const membership = await this.service.findById(id, request.context)
    return PlatformMembershipResponseDto.fromDomain(membership)
  }

  @Patch(':id')
  @Authorize(Action.Update, PlatformMembership)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlatformMembershipDto,
    @Req() request: Request
  ): Promise<PlatformMembershipResponseDto> {
    const membership = await this.service.findById(id, request.context)

    if (dto.roles) {
      // Replace all roles
      membership.removeRole(PlatformRole.ADMIN)
      membership.removeRole(PlatformRole.USER)
      dto.roles.forEach((role) => membership.addRole(role))
    }

    const saved = await this.service.save(membership, request.context)
    return PlatformMembershipResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, PlatformMembership)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, PlatformMembership)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<PlatformMembershipResponseDto> {
    const membership = await this.service.activate(id, request.context)
    return PlatformMembershipResponseDto.fromDomain(membership)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, PlatformMembership)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<PlatformMembershipResponseDto> {
    const membership = await this.service.lock(id, request.context)
    return PlatformMembershipResponseDto.fromDomain(membership)
  }
}