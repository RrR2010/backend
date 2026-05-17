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
  CreateMemberProfileDto,
  CreateMemberProfileResponseDto,
  MemberProfileResponseDto,
  UpdateMemberProfileDto
} from '@member-profiles/member-profile.dto'
import { MemberProfileService } from '@member-profiles/member-profile.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import type { RequestContext } from '@authorization/authorization.types'
import { MemberProfile } from '@member-profiles/member-profile.entity'

@ApiTags('Member Profiles')
@ApiBearerAuth('accessToken')
@Controller('member-profiles')
export class MemberProfilesController {
  constructor(private readonly service: MemberProfileService) {}


  @Post()
  @Authorize(Action.Create, MemberProfile)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateMemberProfileDto,
    @Req() request: Request
  ): Promise<CreateMemberProfileResponseDto> {
    const profile = await this.service.create(
      {
        externalId: dto.externalId ?? null,
        fullName: dto.fullName,
        displayName: dto.displayName ?? null,
        dateOfBirth: dto.dateOfBirth ?? null,
        gender: dto.gender ?? null,
        photoUrl: dto.photoUrl ?? null,
        locale: dto.locale,
        timezone: dto.timezone,
        language: dto.language,
        platformMembershipId: dto.platformMembershipId ?? null,
        tenantMembershipId: dto.tenantMembershipId ?? null
      },
      request.context
    )
    return CreateMemberProfileResponseDto.fromDomain(profile)
  }

  @Get()
  @Authorize(Action.Read, MemberProfile)
  async findAll(@Req() request: Request): Promise<MemberProfileResponseDto[]> {
    const profiles = await this.service.findAll({}, request.context)
    return profiles.map(MemberProfileResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, MemberProfile)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<MemberProfileResponseDto> {
    const profile = await this.service.findById(id, request.context)
    return MemberProfileResponseDto.fromDomain(profile)
  }

  @Patch(':id')
  @Authorize(Action.Update, MemberProfile)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMemberProfileDto,
    @Req() request: Request
  ): Promise<MemberProfileResponseDto> {
    const profile = await this.service.findById(id, request.context)

    if (dto.fullName) profile.changeFullName(dto.fullName)
    if (dto.displayName !== undefined) profile.changeDisplayName(dto.displayName)
    if (dto.dateOfBirth !== undefined) profile.changeDateOfBirth(dto.dateOfBirth)
    if (dto.gender !== undefined) profile.changeGender(dto.gender)
    if (dto.photoUrl !== undefined) profile.changePhotoUrl(dto.photoUrl)
    if (dto.locale) profile.changeLocale(dto.locale)
    if (dto.timezone) profile.changeTimezone(dto.timezone)
    if (dto.language) profile.changeLanguage(dto.language)
    if (dto.externalId !== undefined) profile.changeExternalId(dto.externalId)

    const saved = await this.service.save(profile, request.context)
    return MemberProfileResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, MemberProfile)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, MemberProfile)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<MemberProfileResponseDto> {
    const profile = await this.service.activate(id, request.context)
    return MemberProfileResponseDto.fromDomain(profile)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, MemberProfile)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<MemberProfileResponseDto> {
    const profile = await this.service.lock(id, request.context)
    return MemberProfileResponseDto.fromDomain(profile)
  }
}
