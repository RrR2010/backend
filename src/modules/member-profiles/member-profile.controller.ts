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
  CreateMemberProfileDto,
  CreateMemberProfileResponseDto,
  MemberProfileResponseDto,
  UpdateMemberProfileDto
} from '@member-profiles/member-profile.dto'
import { MemberProfileService } from '@member-profiles/member-profile.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
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
    @Body() dto: CreateMemberProfileDto
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
      null as any
    )
    return CreateMemberProfileResponseDto.fromDomain(profile)
  }

  @Get()
  @Authorize(Action.Read, MemberProfile)
  async findAll(): Promise<MemberProfileResponseDto[]> {
    const profiles = await this.service.findAll(undefined, null as any)
    return profiles.map(MemberProfileResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, MemberProfile)
  async findById(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<MemberProfileResponseDto> {
    const profile = await this.service.findById(id, null as any)
    return MemberProfileResponseDto.fromDomain(profile)
  }

  @Patch(':id')
  @Authorize(Action.Update, MemberProfile)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMemberProfileDto
  ): Promise<MemberProfileResponseDto> {
    const profile = await this.service.findById(id, null as any)

    if (dto.fullName) profile.changeFullName(dto.fullName)
    if (dto.displayName !== undefined) profile.changeDisplayName(dto.displayName)
    if (dto.dateOfBirth !== undefined) profile.changeDateOfBirth(dto.dateOfBirth)
    if (dto.gender !== undefined) profile.changeGender(dto.gender)
    if (dto.photoUrl !== undefined) profile.changePhotoUrl(dto.photoUrl)
    if (dto.locale) profile.changeLocale(dto.locale)
    if (dto.timezone) profile.changeTimezone(dto.timezone)
    if (dto.language) profile.changeLanguage(dto.language)
    if (dto.externalId !== undefined) profile.changeExternalId(dto.externalId)

    const saved = await this.service.save(profile, null as any)
    return MemberProfileResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, MemberProfile)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.delete(id, null as any)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, MemberProfile)
  async activate(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<MemberProfileResponseDto> {
    const profile = await this.service.activate(id, null as any)
    return MemberProfileResponseDto.fromDomain(profile)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, MemberProfile)
  async lock(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<MemberProfileResponseDto> {
    const profile = await this.service.lock(id, null as any)
    return MemberProfileResponseDto.fromDomain(profile)
  }
}