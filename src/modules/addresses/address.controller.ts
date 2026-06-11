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
  CreateAddressDto,
  CreateAddressResponseDto,
  AddressResponseDto,
  UpdateAddressDto
} from '@addresses/address.dto'
import { AddressService } from '@addresses/address.service'
import { Authorize } from '@authorization/authorization.decorators'
import { Action } from '@authorization/authorization.types'
import { Address } from '@addresses/address.entity'

@ApiTags('Addresses')
@ApiBearerAuth('accessToken')
@Controller('addresses')
export class AddressesController {
  constructor(private readonly service: AddressService) {}

  // TODO(EP-002/Wave3): Replace null as any with @ReqContext() ctx: RequestContext
  @Post()
  @Authorize(Action.Create, Address)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateAddressDto
  ): Promise<CreateAddressResponseDto> {
    const address = await this.service.create(
      {
        ownerId: dto.ownerId,
        ownerType: dto.ownerType,
        tenantId: '', // TEMP: to be resolved from ctx in Wave 3
        type: dto.type,
        street: dto.street,
        streetType: dto.streetType ?? null,
        number: dto.number,
        complement: dto.complement ?? null,
        district: dto.district ?? null,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country,
        isDefault: dto.isDefault
      },
      null as any
    )
    return CreateAddressResponseDto.fromDomain(address)
  }

  @Get()
  @Authorize(Action.Read, Address)
  async findAll(): Promise<AddressResponseDto[]> {
    const addresses = await this.service.findAll({}, null as any)
    return addresses.map(AddressResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, Address)
  async findById(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<AddressResponseDto> {
    const address = await this.service.findById(id, null as any)
    return AddressResponseDto.fromDomain(address)
  }

  @Patch(':id')
  @Authorize(Action.Update, Address)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAddressDto
  ): Promise<AddressResponseDto> {
    const address = await this.service.findById(id, null as any)

    if (dto.street) address.changeStreet(dto.street)
    if (dto.number !== undefined) address.changeNumber(dto.number)
    if (dto.complement !== undefined) address.changeComplement(dto.complement)
    if (dto.district !== undefined) address.changeDistrict(dto.district)
    if (dto.streetType !== undefined) address.changeStreetType(dto.streetType)
    if (dto.city) address.changeCity(dto.city)
    if (dto.state) address.changeState(dto.state)
    if (dto.postalCode) address.changePostalCode(dto.postalCode)
    if (dto.country) address.changeCountry(dto.country)
    if (dto.type) address.changeType(dto.type)
    if (dto.isDefault === true) address.setAsDefault()
    else if (dto.isDefault === false) address.unsetDefault()

    const saved = await this.service.save(address, null as any)
    return AddressResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, Address)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.delete(id, null as any)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, Address)
  async activate(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<AddressResponseDto> {
    const address = await this.service.activate(id, null as any)
    return AddressResponseDto.fromDomain(address)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, Address)
  async lock(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<AddressResponseDto> {
    const address = await this.service.lock(id, null as any)
    return AddressResponseDto.fromDomain(address)
  }
}
