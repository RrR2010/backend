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
  CreateIdentityDto,
  CreateIdentityResponseDto,
  IdentityResponseDto
} from '@identities/identity.dto'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
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
    @Body() dto: CreateIdentityDto
  ): Promise<CreateIdentityResponseDto> {
    const identity = await this.identityService.create(dto, null as any)
    return CreateIdentityResponseDto.fromDomain(identity)
  }

  @Get()
  @Authorize(Action.Read, Identity)
  async findAll(): Promise<IdentityResponseDto[]> {
    const identities = await this.identityService.findAll(
      undefined,
      null as any
    )
    return identities.map((identity) =>
      IdentityResponseDto.fromDomain(identity)
    )
  }

  @Get(':id')
  @Authorize(Action.Read, Identity)
  async findById(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<IdentityResponseDto | null> {
    const identity = await this.identityService.findById(id, null as any)
    return identity ? IdentityResponseDto.fromDomain(identity) : null
  }

  @Patch(':id')
  @Authorize(Action.Update, Identity)
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateIdentityDto
  ): Promise<IdentityResponseDto> {
    const identity = await this.identityService.save(
      Identity.create({
        userId: dto.userId,
        authProviderType: dto.provider,
        identifier: dto.identifier,
        secretHash: dto.secret || null
      }),
      null as any
    )
    return IdentityResponseDto.fromDomain(identity)
  }

  @Delete(':id')
  @Authorize(Action.Delete, Identity)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.identityService.delete(id, null as any)
  }
}
