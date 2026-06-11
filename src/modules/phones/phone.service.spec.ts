import { ForbiddenException } from '@nestjs/common'
import { PhoneService } from './phone.service'
import { Phone } from './phone.entity'
import { PhoneNotFoundError } from './phone.errors'
import { OwnerType, PhoneType } from '@shared/enums'
import { UserScope } from '@users/user.types'
import type { RequestContext } from '@authorization/authorization.types'

describe('PhoneService', () => {
  let service: PhoneService
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
    repository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    }

    service = new PhoneService(repository)
  })

  describe('create', () => {
    it('should resolve tenantId from ctx, create phone, and save', async () => {
      repository.save.mockResolvedValue(mockPhone)

      const result = await service.create(
        {
          ownerId: 'owner-1',
          ownerType: OwnerType.TENANT_SITE,
          type: PhoneType.WHATSAPP,
          countryCode: '55',
          number: '11999998888',
          extension: null,
          isWhatsapp: true,
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
            type: PhoneType.WHATSAPP,
            countryCode: '55',
            number: '11999998888',
            extension: null,
            isWhatsapp: true,
            isDefault: true
          },
          platformCtx
        )
      ).rejects.toThrow(ForbiddenException)
    })
  })

  describe('findById', () => {
    it('should call repository.findById with ctx', async () => {
      repository.findById.mockResolvedValue(mockPhone)

      const result = await service.findById('phone-1', tenantCtx)

      expect(repository.findById).toHaveBeenCalledWith('phone-1', tenantCtx)
      expect(result).toBe(mockPhone)
    })

    it('should throw PhoneNotFoundError when phone not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.findById('nonexistent', tenantCtx)).rejects.toThrow(
        PhoneNotFoundError
      )
    })
  })

  describe('findAll', () => {
    it('should call repository.findAll with ctx', async () => {
      repository.findAll.mockResolvedValue([mockPhone])

      const filter = { ownerId: 'owner-1' }
      const result = await service.findAll(filter, tenantCtx)

      expect(repository.findAll).toHaveBeenCalledWith(filter, tenantCtx)
      expect(result).toHaveLength(1)
    })
  })

  describe('delete', () => {
    it('should find phone, mark deleted, and save', async () => {
      repository.findById.mockResolvedValue(mockPhone)
      repository.save.mockResolvedValue(mockPhone)

      await service.delete('phone-1', tenantCtx)

      expect(repository.findById).toHaveBeenCalledWith('phone-1', tenantCtx)
      expect(repository.save).toHaveBeenCalled()
    })
  })
})
