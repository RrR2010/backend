import { AddressesController } from './address.controller'
import { Address } from './address.entity'
import { OwnerType, AddressType } from '@shared/enums'
import { UserScope } from '@users/user.types'
import type { RequestContext } from '@authorization/authorization.types'

describe('AddressesController', () => {
  let controller: AddressesController
  let service: any

  const mockContext: RequestContext = {
    userId: 'user-1',
    scope: UserScope.TENANT,
    tenantId: 'tenant-1',
    roles: ['ADMIN']
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
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      activate: jest.fn(),
      lock: jest.fn()
    }

    controller = new AddressesController(service)
  })

  describe('create', () => {
    it('should call service.create with request.context', async () => {
      service.create.mockResolvedValue(mockAddress)

      const dto = {
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
      }

      const request = { context: mockContext } as any
      await controller.create(dto as any, request)

      expect(service.create).toHaveBeenCalledWith(
        expect.objectContaining({ ownerId: 'owner-1' }),
        mockContext
      )
    })
  })

  describe('findAll', () => {
    it('should call service.findAll with request.context', async () => {
      service.findAll.mockResolvedValue([mockAddress])

      const request = { context: mockContext } as any
      await controller.findAll(request)

      expect(service.findAll).toHaveBeenCalledWith({}, mockContext)
    })
  })

  describe('findById', () => {
    it('should call service.findById with request.context', async () => {
      service.findById.mockResolvedValue(mockAddress)

      const request = { context: mockContext } as any
      await controller.findById('address-1', request)

      expect(service.findById).toHaveBeenCalledWith('address-1', mockContext)
    })
  })
})
