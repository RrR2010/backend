import { ForbiddenException } from '@nestjs/common'
import { AddressService } from './address.service'
import { Address, CreateAddressProps } from './address.entity'
import { AddressNotFoundError } from './address.errors'
import { OwnerType, AddressType } from '@shared/enums'
import { UserScope } from '@users/user.types'
import type { RequestContext } from '@authorization/authorization.types'
import * as tenantContextHelper from '@shared/helpers/tenant-context.helper'

describe('AddressService', () => {
  let service: AddressService
  let repository: any

  const tenantCtx: RequestContext = {
    userId: 'user-1',
    scope: UserScope.TENANT,
    tenantId: 'tenant-1',
    roles: ['ADMIN']
  }

  const platformCtx: RequestContext = {
    userId: 'admin',
    scope: UserScope.PLATFORM,
    roles: ['ADMIN'],
    impersonatedTenantId: null
  }

  const mockAddress = Address.create({
    ownerId: 'owner-1',
    ownerType: OwnerType.TENANT_SITE,
    tenantId: 'tenant-1',
    type: AddressType.BILLING,
    street: 'Rua A',
    streetType: null,
    number: '123',
    complement: null,
    district: null,
    city: 'São Paulo',
    state: 'SP',
    postalCode: '01310-000',
    country: 'BR',
    isDefault: true
  })

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    }

    service = new AddressService(repository)
  })

  describe('create', () => {
    it('should resolve tenantId from ctx, create address, and save', async () => {
      repository.save.mockResolvedValue(mockAddress)

      const result = await service.create(
        {
          ownerId: 'owner-1',
          ownerType: OwnerType.TENANT_SITE,
          type: AddressType.BILLING,
          street: 'Rua A',
          streetType: null,
          number: '123',
          complement: null,
          district: null,
          city: 'São Paulo',
          state: 'SP',
          postalCode: '01310-000',
          country: 'BR',
          isDefault: true
        },
        tenantCtx
      )

      expect(result.tenantId).toBe('tenant-1')
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ _props: expect.objectContaining({ tenantId: 'tenant-1' }) }),
        tenantCtx
      )
    })

    it('should throw ForbiddenException when ctx has no tenantId', async () => {
      await expect(
        service.create(
          {
            ownerId: 'owner-1',
            ownerType: OwnerType.TENANT_SITE,
            type: AddressType.BILLING,
            street: 'Rua A',
            streetType: null,
            number: '123',
            complement: null,
            district: null,
            city: 'São Paulo',
            state: 'SP',
            postalCode: '01310-000',
            country: 'BR',
            isDefault: true
          },
          platformCtx
        )
      ).rejects.toThrow(ForbiddenException)
    })
  })

  describe('findById', () => {
    it('should call repository.findById with ctx', async () => {
      repository.findById.mockResolvedValue(mockAddress)

      const result = await service.findById('address-1', tenantCtx)

      expect(repository.findById).toHaveBeenCalledWith('address-1', tenantCtx)
      expect(result).toBe(mockAddress)
    })

    it('should throw AddressNotFoundError when address not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.findById('nonexistent', tenantCtx)).rejects.toThrow(
        AddressNotFoundError
      )
    })
  })

  describe('findAll', () => {
    it('should call repository.findAll with ctx', async () => {
      repository.findAll.mockResolvedValue([mockAddress])

      const filter = { ownerId: 'owner-1' }
      const result = await service.findAll(filter, tenantCtx)

      expect(repository.findAll).toHaveBeenCalledWith(filter, tenantCtx)
      expect(result).toHaveLength(1)
    })
  })

  describe('delete', () => {
    it('should find address, mark deleted, and save', async () => {
      repository.findById.mockResolvedValue(mockAddress)
      repository.save.mockResolvedValue(mockAddress)

      await service.delete('address-1', tenantCtx)

      expect(repository.findById).toHaveBeenCalledWith('address-1', tenantCtx)
      expect(repository.save).toHaveBeenCalled()
    })
  })
})
