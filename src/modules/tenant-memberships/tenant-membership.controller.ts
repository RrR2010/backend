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
  CreateTenantMembershipDto,
  CreateTenantMembershipResponseDto,
  TenantMembershipResponseDto,
  UpdateTenantMembershipDto
} from '@tenant-memberships/tenant-membership.dto'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import type { RequestContext } from '@authorization/authorization.types'
import { TenantMembership } from '@tenant-memberships/tenant-membership.entity'
import { TenantMembershipService } from '@tenant-memberships/tenant-membership.service'
import { TenantRole } from '@users/user.types'

@ApiTags('Tenant Memberships')
@ApiBearerAuth('accessToken')
@Controller('tenant-memberships')
export class TenantMembershipsController {
  constructor(private readonly service: TenantMembershipService) {}


  @Post()
  @Authorize(Action.Create, TenantMembership)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateTenantMembershipDto,
    @Req() request: Request
  ): Promise<CreateTenantMembershipResponseDto> {
    const membership = await this.service.create(
      {
        userId: dto.userId,
        tenantId: dto.tenantId,
        isOwner: dto.isOwner,
        roles: dto.roles
      },
      request.context
    )
    return CreateTenantMembershipResponseDto.fromDomain(membership)
  }

  @Get()
  @Authorize(Action.Read, TenantMembership)
  async findAll(@Req() request: Request): Promise<TenantMembershipResponseDto[]> {
    const memberships = await this.service.findAll({}, request.context)
    return memberships.map(TenantMembershipResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, TenantMembership)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TenantMembershipResponseDto> {
    const membership = await this.service.findById(id, request.context)
    return TenantMembershipResponseDto.fromDomain(membership)
  }

  @Patch(':id')
  @Authorize(Action.Update, TenantMembership)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTenantMembershipDto,
    @Req() request: Request
  ): Promise<TenantMembershipResponseDto> {
    const membership = await this.service.findById(id, request.context)

    if (dto.roles) {
      membership.removeRole(TenantRole.ADMIN)
      membership.removeRole(TenantRole.USER)
      dto.roles.forEach((role) => membership.addRole(role))
    }

    if (dto.isOwner !== undefined && dto.isOwner) {
      membership.setAsOwner()
    }

    const saved = await this.service.save(membership, request.context)
    return TenantMembershipResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, TenantMembership)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, TenantMembership)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TenantMembershipResponseDto> {
    const membership = await this.service.activate(id, request.context)
    return TenantMembershipResponseDto.fromDomain(membership)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, TenantMembership)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<TenantMembershipResponseDto> {
    const membership = await this.service.lock(id, request.context)
    return TenantMembershipResponseDto.fromDomain(membership)
  }
}
