import { PhonesController } from './phone.controller'
import { Phone } from './phone.entity'
import { OwnerType, PhoneType } from '@shared/enums'
import { UserScope } from '@users/user.types'
import type { RequestContext } from '@authorization/authorization.types'
import { Action } from '@authorization/authorization.types'
import { AUTHORIZE_KEY } from '@authorization/authorization.decorators'

describe('PhonesController', () => {
  let controller: PhonesController
  let service: any

  const mockContext: RequestContext = {
    userId: 'user-1',
    scope: UserScope.TENANT,
    tenantId: 'tenant-1',
    roles: ['ADMIN']
  }

  const mockPhone = Phone.create({
    ownerId: 'owner-1',
    ownerType: OwnerType.TENANT_SITE,
    tenantId: 'tenant-1',
    type: PhoneType.WHATSAPP,
    countryCode: '55',
    number: '11999998888',
    extension: null,
    isWhatsapp: true,
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

    controller = new PhonesController(service)
  })

  describe('create', () => {
    it('should call service.create with request.context', async () => {
      service.create.mockResolvedValue(mockPhone)

      const dto = {
        ownerId: 'owner-1',
        ownerType: OwnerType.TENANT_SITE,
        type: PhoneType.WHATSAPP,
        countryCode: '55',
        number: '11999998888',
        extension: null,
        isWhatsapp: true,
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
      service.findAll.mockResolvedValue([mockPhone])

      const request = { context: mockContext } as any
      await controller.findAll(request)

      expect(service.findAll).toHaveBeenCalledWith({}, mockContext)
    })
  })

  describe('findById', () => {
    it('should call service.findById with request.context', async () => {
      service.findById.mockResolvedValue(mockPhone)

      const request = { context: mockContext } as any
      await controller.findById('phone-1', request)

      expect(service.findById).toHaveBeenCalledWith('phone-1', mockContext)
    })
  })

  describe('update', () => {
    it('should call service.findById and service.save with request.context', async () => {
      service.findById.mockResolvedValue(mockPhone)
      service.save.mockResolvedValue(mockPhone)

      const dto = { number: '11999990000' }
      const request = { context: mockContext } as any
      const result = await controller.update('phone-1', dto as any, request)

      expect(service.findById).toHaveBeenCalledWith('phone-1', mockContext)
      expect(service.save).toHaveBeenCalledWith(expect.any(Phone), mockContext)
      expect(result).toBeDefined()
    })
  })

  describe('delete', () => {
    it('should call service.delete with request.context', async () => {
      const request = { context: mockContext } as any
      await controller.delete('phone-1', request)

      expect(service.delete).toHaveBeenCalledWith('phone-1', mockContext)
    })
  })

  describe('activate', () => {
    it('should call service.activate with request.context', async () => {
      service.activate.mockResolvedValue(mockPhone)

      const request = { context: mockContext } as any
      const result = await controller.activate('phone-1', request)

      expect(service.activate).toHaveBeenCalledWith('phone-1', mockContext)
      expect(result).toBeDefined()
    })
  })

  describe('lock', () => {
    it('should call service.lock with request.context', async () => {
      service.lock.mockResolvedValue(mockPhone)

      const request = { context: mockContext } as any
      const result = await controller.lock('phone-1', request)

      expect(service.lock).toHaveBeenCalledWith('phone-1', mockContext)
      expect(result).toBeDefined()
    })
  })

  describe('@Authorize decorators', () => {
    it('should have @Authorize(Action.Create, Phone) on create', () => {
      const metadata = Reflect.getMetadata(AUTHORIZE_KEY, PhonesController.prototype.create)
      expect(metadata).toBeDefined()
      expect(metadata.action).toBe(Action.Create)
    })

    it('should have @Authorize(Action.Read, Phone) on findAll', () => {
      const metadata = Reflect.getMetadata(AUTHORIZE_KEY, PhonesController.prototype.findAll)
      expect(metadata).toBeDefined()
      expect(metadata.action).toBe(Action.Read)
    })

    it('should have @Authorize(Action.Read, Phone) on findById', () => {
      const metadata = Reflect.getMetadata(AUTHORIZE_KEY, PhonesController.prototype.findById)
      expect(metadata).toBeDefined()
      expect(metadata.action).toBe(Action.Read)
    })

    it('should have @Authorize(Action.Update, Phone) on update', () => {
      const metadata = Reflect.getMetadata(AUTHORIZE_KEY, PhonesController.prototype.update)
      expect(metadata).toBeDefined()
      expect(metadata.action).toBe(Action.Update)
    })

    it('should have @Authorize(Action.Delete, Phone) on delete', () => {
      const metadata = Reflect.getMetadata(AUTHORIZE_KEY, PhonesController.prototype.delete)
      expect(metadata).toBeDefined()
      expect(metadata.action).toBe(Action.Delete)
    })

    it('should have @Authorize(Action.Update, Phone) on activate', () => {
      const metadata = Reflect.getMetadata(AUTHORIZE_KEY, PhonesController.prototype.activate)
      expect(metadata).toBeDefined()
      expect(metadata.action).toBe(Action.Update)
    })

    it('should have @Authorize(Action.Update, Phone) on lock', () => {
      const metadata = Reflect.getMetadata(AUTHORIZE_KEY, PhonesController.prototype.lock)
      expect(metadata).toBeDefined()
      expect(metadata.action).toBe(Action.Update)
    })
  })
})
