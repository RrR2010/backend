import { ForbiddenException } from '@nestjs/common'
import { PrismaPhoneRepository } from './phone.repository'
import { Phone } from './phone.entity'
import { OwnerType, PhoneType } from '@shared/enums'
import { UserScope } from '@users/user.types'
import type { RequestContext } from '@authorization/authorization.types'

describe('PrismaPhoneRepository', () => {
  let repository: PrismaPhoneRepository
  let prismaService: any

  const tenantA: RequestContext = {
    userId: 'user-a',
    scope: UserScope.TENANT,
    tenantId: 'tenant-a',
    roles: ['ADMIN']
  }

  const tenantBContext: RequestContext = {
    userId: 'user-b',
    scope: UserScope.TENANT,
    tenantId: 'tenant-b',
    roles: ['ADMIN']
  }

  const mockPhone = Phone.create({
    ownerId: 'owner-1',
    ownerType: OwnerType.TENANT_SITE,
    tenantId: 'tenant-a',
    type: PhoneType.WHATSAPP,
    countryCode: '55',
    number: '11999998888',
    extension: null,
    isWhatsapp: true,
    isDefault: true
  })

  beforeEach(() => {
    prismaService = {
      phone: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        deleteMany: jest.fn()
      }
    }

    repository = new PrismaPhoneRepository(prismaService)
  })

  describe('findById', () => {
    it('should call findFirst with tenantId filter', async () => {
      prismaService.phone.findFirst.mockResolvedValue({
        id: mockPhone.id.value,
        createdAt: mockPhone.createdAt,
        updatedAt: mockPhone.updatedAt,
        systemState: 'ACTIVE',
        ownerId: 'owner-1',
        ownerType: 'TenantSite',
        tenantId: 'tenant-a',
        type: 'WHATSAPP',
        countryCode: '55',
        number: '11999998888',
        extension: null,
        isWhatsapp: true,
        isDefault: true
      })

      await repository.findById(mockPhone.id.value, tenantA)

      expect(prismaService.phone.findFirst).toHaveBeenCalledWith({
        where: { id: mockPhone.id.value, tenantId: 'tenant-a' }
      })
    })

    it('should return null when findById with wrong tenantId', async () => {
      prismaService.phone.findFirst.mockResolvedValue(null)

      const result = await repository.findById('some-id', tenantBContext)

      expect(result).toBeNull()
      expect(prismaService.phone.findFirst).toHaveBeenCalledWith({
        where: { id: 'some-id', tenantId: 'tenant-b' }
      })
    })
  })

  describe('findAll', () => {
    it('should call findMany with tenantId filter', async () => {
      prismaService.phone.findMany.mockResolvedValue([])

      await repository.findAll({}, tenantA)

      expect(prismaService.phone.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-a' }
      })
    })
  })

  describe('delete', () => {
    it('should call deleteMany with tenantId filter', async () => {
      await repository.delete('phone-1', tenantA)

      expect(prismaService.phone.deleteMany).toHaveBeenCalledWith({
        where: { id: 'phone-1', tenantId: 'tenant-a' }
      })
    })
  })

  describe('save tenant guard', () => {
    it('should throw ForbiddenException for cross-tenant upsert', async () => {
      const crossTenantPhone = Phone.create({
        ownerId: 'owner-1',
        ownerType: OwnerType.TENANT_SITE,
        tenantId: 'tenant-b',
        type: PhoneType.WHATSAPP,
        countryCode: '55',
        number: '11999998888',
        extension: null,
        isWhatsapp: true,
        isDefault: true
      })

      await expect(
        repository.save(crossTenantPhone, tenantA)
      ).rejects.toThrow(ForbiddenException)
    })
  })
})
