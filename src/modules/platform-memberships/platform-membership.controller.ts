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
  CreatePlatformMembershipDto,
  CreatePlatformMembershipResponseDto,
  PlatformMembershipResponseDto,
  UpdatePlatformMembershipDto
} from '@platform-memberships/platform-membership.dto'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
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
    @Body() dto: CreatePlatformMembershipDto
  ): Promise<CreatePlatformMembershipResponseDto> {
    const membership = await this.service.create(
      { userId: dto.userId, roles: dto.roles },
      null as any
    )
    return CreatePlatformMembershipResponseDto.fromDomain(membership)
  }

  @Get()
  @Authorize(Action.Read, PlatformMembership)
  async findAll(): Promise<PlatformMembershipResponseDto[]> {
    const memberships = await this.service.findAll(undefined, null as any)
    return memberships.map(PlatformMembershipResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, PlatformMembership)
  async findById(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<PlatformMembershipResponseDto> {
    const membership = await this.service.findById(id, null as any)
    return PlatformMembershipResponseDto.fromDomain(membership)
  }

  @Patch(':id')
  @Authorize(Action.Update, PlatformMembership)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlatformMembershipDto
  ): Promise<PlatformMembershipResponseDto> {
    const membership = await this.service.findById(id, null as any)

    if (dto.roles) {
      // Replace all roles
      membership.removeRole(PlatformRole.ADMIN)
      membership.removeRole(PlatformRole.USER)
      dto.roles.forEach((role) => membership.addRole(role))
    }

    const saved = await this.service.save(membership, null as any)
    return PlatformMembershipResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, PlatformMembership)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.delete(id, null as any)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, PlatformMembership)
  async activate(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<PlatformMembershipResponseDto> {
    const membership = await this.service.activate(id, null as any)
    return PlatformMembershipResponseDto.fromDomain(membership)
  }

  @Post(':id/lock')
  async lock(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<PlatformMembershipResponseDto> {
    const membership = await this.service.lock(id, null as any)
    return PlatformMembershipResponseDto.fromDomain(membership)
  }
}