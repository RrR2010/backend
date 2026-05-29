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
  CreatePhoneDto,
  CreatePhoneResponseDto,
  PhoneResponseDto,
  UpdatePhoneDto
} from '@phones/phone.dto'
import { PhoneService } from '@phones/phone.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { Phone } from '@phones/phone.entity'

@ApiTags('Phones')
@ApiBearerAuth('accessToken')
@Controller('phones')
export class PhonesController {
  constructor(private readonly service: PhoneService) {}

  @Post()
  @Authorize(Action.Create, Phone)
  @ApiConsumes('application/json')
  async create(@Body() dto: CreatePhoneDto): Promise<CreatePhoneResponseDto> {
    const phone = await this.service.create(
      {
        ownerId: dto.ownerId,
        ownerType: dto.ownerType,
        type: dto.type,
        countryCode: dto.countryCode,
        number: dto.number,
        isWhatsapp: dto.isWhatsapp,
        isDefault: dto.isDefault
      },
      null as any
    )
    return CreatePhoneResponseDto.fromDomain(phone)
  }

  @Get()
  @Authorize(Action.Read, Phone)
  async findAll(): Promise<PhoneResponseDto[]> {
    const phones = await this.service.findAll({}, null as any)
    return phones.map(PhoneResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, Phone)
  async findById(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<PhoneResponseDto> {
    const phone = await this.service.findById(id, null as any)
    return PhoneResponseDto.fromDomain(phone)
  }

  @Patch(':id')
  @Authorize(Action.Update, Phone)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePhoneDto
  ): Promise<PhoneResponseDto> {
    const phone = await this.service.findById(id, null as any)

    if (dto.type) phone.changeType(dto.type)
    if (dto.countryCode) phone.changeCountryCode(dto.countryCode)
    if (dto.number) phone.changeNumber(dto.number)
    if (dto.isWhatsapp === true) phone.setAsWhatsapp()
    else if (dto.isWhatsapp === false) phone.unsetWhatsapp()
    if (dto.isDefault === true) phone.setAsDefault()
    else if (dto.isDefault === false) phone.unsetDefault()

    const saved = await this.service.save(phone, null as any)
    return PhoneResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, Phone)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.delete(id, null as any)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, Phone)
  async activate(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<PhoneResponseDto> {
    const phone = await this.service.activate(id, null as any)
    return PhoneResponseDto.fromDomain(phone)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, Phone)
  async lock(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<PhoneResponseDto> {
    const phone = await this.service.lock(id, null as any)
    return PhoneResponseDto.fromDomain(phone)
  }
}
