import { AddressesController } from './address.controller'
import { Address } from './address.entity'
import { OwnerType, AddressType } from '@shared/enums'
import { UserScope } from '@users/user.types'
import type { RequestContext } from '@authorization/authorization.types'
import { Action } from '@authorization/authorization.types'
import { AUTHORIZE_KEY } from '@authorization/authorization.decorators'

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

  describe('update', () => {
    it('should call service.findById and service.save with request.context', async () => {
      service.findById.mockResolvedValue(mockAddress)
      service.save.mockResolvedValue(mockAddress)

      const dto = { street: 'Rua B' }
      const request = { context: mockContext } as any
      const result = await controller.update('address-1', dto as any, request)

      expect(service.findById).toHaveBeenCalledWith('address-1', mockContext)
      expect(service.save).toHaveBeenCalledWith(expect.any(Address), mockContext)
      expect(result).toBeDefined()
    })
  })

  describe('delete', () => {
    it('should call service.delete with request.context', async () => {
      const request = { context: mockContext } as any
      await controller.delete('address-1', request)

      expect(service.delete).toHaveBeenCalledWith('address-1', mockContext)
    })
  })

  describe('activate', () => {
    it('should call service.activate with request.context', async () => {
      service.activate.mockResolvedValue(mockAddress)

      const request = { context: mockContext } as any
      const result = await controller.activate('address-1', request)

      expect(service.activate).toHaveBeenCalledWith('address-1', mockContext)
      expect(result).toBeDefined()
    })
  })

  describe('lock', () => {
    it('should call service.lock with request.context', async () => {
      service.lock.mockResolvedValue(mockAddress)

      const request = { context: mockContext } as any
      const result = await controller.lock('address-1', request)

      expect(service.lock).toHaveBeenCalledWith('address-1', mockContext)
      expect(result).toBeDefined()
    })
  })

  describe('@Authorize decorators', () => {
    it('should have @Authorize(Action.Create, Address) on create', () => {
      const metadata = Reflect.getMetadata(AUTHORIZE_KEY, AddressesController.prototype.create)
      expect(metadata).toBeDefined()
      expect(metadata.action).toBe(Action.Create)
    })

    it('should have @Authorize(Action.Read, Address) on findAll', () => {
      const metadata = Reflect.getMetadata(AUTHORIZE_KEY, AddressesController.prototype.findAll)
      expect(metadata).toBeDefined()
      expect(metadata.action).toBe(Action.Read)
    })

    it('should have @Authorize(Action.Read, Address) on findById', () => {
      const metadata = Reflect.getMetadata(AUTHORIZE_KEY, AddressesController.prototype.findById)
      expect(metadata).toBeDefined()
      expect(metadata.action).toBe(Action.Read)
    })

    it('should have @Authorize(Action.Update, Address) on update', () => {
      const metadata = Reflect.getMetadata(AUTHORIZE_KEY, AddressesController.prototype.update)
      expect(metadata).toBeDefined()
      expect(metadata.action).toBe(Action.Update)
    })

    it('should have @Authorize(Action.Delete, Address) on delete', () => {
      const metadata = Reflect.getMetadata(AUTHORIZE_KEY, AddressesController.prototype.delete)
      expect(metadata).toBeDefined()
      expect(metadata.action).toBe(Action.Delete)
    })

    it('should have @Authorize(Action.Update, Address) on activate', () => {
      const metadata = Reflect.getMetadata(AUTHORIZE_KEY, AddressesController.prototype.activate)
      expect(metadata).toBeDefined()
      expect(metadata.action).toBe(Action.Update)
    })

    it('should have @Authorize(Action.Update, Address) on lock', () => {
      const metadata = Reflect.getMetadata(AUTHORIZE_KEY, AddressesController.prototype.lock)
      expect(metadata).toBeDefined()
      expect(metadata.action).toBe(Action.Update)
    })
  })
})
