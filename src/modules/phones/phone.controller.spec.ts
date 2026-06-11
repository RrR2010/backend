import { PhonesController } from './phone.controller'
import { Phone } from './phone.entity'
import { OwnerType, PhoneType } from '@shared/enums'
import { UserScope } from '@users/user.types'
import type { RequestContext } from '@authorization/authorization.types'

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
})
