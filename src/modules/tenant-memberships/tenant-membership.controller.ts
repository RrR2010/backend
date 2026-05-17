import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Patch,
  ParseUUIDPipe
} from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import {
  CreateTenantMembershipDto,
  CreateTenantMembershipResponseDto,
  TenantMembershipResponseDto,
  UpdateTenantMembershipDto
} from '@tenant-memberships/tenant-membership.dto'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
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
    @Body() dto: CreateTenantMembershipDto
  ): Promise<CreateTenantMembershipResponseDto> {
    const membership = await this.service.create(
      {
        userId: dto.userId,
        tenantId: dto.tenantId,
        isOwner: dto.isOwner,
        roles: dto.roles
      },
      null as any
    )
    return CreateTenantMembershipResponseDto.fromDomain(membership)
  }

  @Get()
  @Authorize(Action.Read, TenantMembership)
  async findAll(): Promise<TenantMembershipResponseDto[]> {
    const memberships = await this.service.findAll(undefined, null as any)
    return memberships.map(TenantMembershipResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, TenantMembership)
  async findById(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<TenantMembershipResponseDto> {
    const membership = await this.service.findById(id, null as any)
    return TenantMembershipResponseDto.fromDomain(membership)
  }

  @Patch(':id')
  @Authorize(Action.Update, TenantMembership)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTenantMembershipDto
  ): Promise<TenantMembershipResponseDto> {
    const membership = await this.service.findById(id, null as any)

    if (dto.roles) {
      membership.removeRole(TenantRole.ADMIN)
      membership.removeRole(TenantRole.USER)
      dto.roles.forEach((role) => membership.addRole(role))
    }

    if (dto.isOwner !== undefined && dto.isOwner) {
      membership.setAsOwner()
    }

    const saved = await this.service.save(membership, null as any)
    return TenantMembershipResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, TenantMembership)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.delete(id, null as any)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, TenantMembership)
  async activate(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<TenantMembershipResponseDto> {
    const membership = await this.service.activate(id, null as any)
    return TenantMembershipResponseDto.fromDomain(membership)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, TenantMembership)
  async lock(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<TenantMembershipResponseDto> {
    const membership = await this.service.lock(id, null as any)
    return TenantMembershipResponseDto.fromDomain(membership)
  }
}