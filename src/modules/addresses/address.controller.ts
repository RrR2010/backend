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

  @Post()
  @Authorize(Action.Create, Address)
  @ApiConsumes('application/json')
  async create(
    @Body() dto: CreateAddressDto,
    @Req() request: Request
  ): Promise<CreateAddressResponseDto> {
    const address = await this.service.create(
      {
        ownerId: dto.ownerId,
        ownerType: dto.ownerType,
        type: dto.type,
        street: dto.street,
        streetType: dto.streetType,
        number: dto.number,
        complement: dto.complement,
        district: dto.district,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country,
        isDefault: dto.isDefault
      },
      request.context
    )
    return CreateAddressResponseDto.fromDomain(address)
  }

  @Get()
  @Authorize(Action.Read, Address)
  async findAll(@Req() request: Request): Promise<AddressResponseDto[]> {
    const addresses = await this.service.findAll({}, request.context)
    return addresses.map(AddressResponseDto.fromDomain)
  }

  @Get(':id')
  @Authorize(Action.Read, Address)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<AddressResponseDto> {
    const address = await this.service.findById(id, request.context)
    return AddressResponseDto.fromDomain(address)
  }

  @Patch(':id')
  @Authorize(Action.Update, Address)
  @ApiConsumes('application/json')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAddressDto,
    @Req() request: Request
  ): Promise<AddressResponseDto> {
    const address = await this.service.findById(id, request.context)

    if (dto.street !== undefined) address.changeStreet(dto.street)
    if (dto.number !== undefined) address.changeNumber(dto.number)
    if (dto.complement !== undefined) address.changeComplement(dto.complement)
    if (dto.district !== undefined) address.changeDistrict(dto.district)
    if (dto.streetType !== undefined) address.changeStreetType(dto.streetType)
    if (dto.city !== undefined) address.changeCity(dto.city)
    if (dto.state !== undefined) address.changeState(dto.state)
    if (dto.postalCode !== undefined) address.changePostalCode(dto.postalCode)
    if (dto.country !== undefined) address.changeCountry(dto.country)
    if (dto.type !== undefined) address.changeType(dto.type)
    if (dto.isDefault === true) address.setAsDefault()
    else if (dto.isDefault === false) address.unsetDefault()

    const saved = await this.service.save(address, request.context)
    return AddressResponseDto.fromDomain(saved)
  }

  @Delete(':id')
  @Authorize(Action.Delete, Address)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<void> {
    await this.service.delete(id, request.context)
  }

  @Post(':id/activate')
  @Authorize(Action.Update, Address)
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<AddressResponseDto> {
    const address = await this.service.activate(id, request.context)
    return AddressResponseDto.fromDomain(address)
  }

  @Post(':id/lock')
  @Authorize(Action.Update, Address)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request
  ): Promise<AddressResponseDto> {
    const address = await this.service.lock(id, request.context)
    return AddressResponseDto.fromDomain(address)
  }
}
