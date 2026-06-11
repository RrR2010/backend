import { PrismaAddressRepository } from './address.repository'
import { Address } from './address.entity'
import { OwnerType, AddressType } from '@shared/enums'
import { UserScope } from '@users/user.types'
import type { RequestContext } from '@authorization/authorization.types'

describe('PrismaAddressRepository', () => {
  let repository: PrismaAddressRepository
  let prismaService: any

  const tenantA: RequestContext = {
    userId: 'user-a',
    scope: UserScope.TENANT,
    tenantId: 'tenant-a',
    roles: ['ADMIN']
  }

  const mockAddress = Address.create({
    ownerId: 'owner-1',
    ownerType: OwnerType.TENANT_SITE,
    tenantId: 'tenant-a',
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
    prismaService = {
      address: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        deleteMany: jest.fn()
      }
    }

    repository = new PrismaAddressRepository(prismaService)
  })

  describe('findById', () => {
    it('should call findFirst with tenantId filter', async () => {
      prismaService.address.findFirst.mockResolvedValue({
        id: mockAddress.id.value,
        createdAt: mockAddress.createdAt,
        updatedAt: mockAddress.updatedAt,
        systemState: 'ACTIVE',
        ownerId: 'owner-1',
        ownerType: 'TenantSite',
        tenantId: 'tenant-a',
        type: 'BILLING',
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

      await repository.findById(mockAddress.id.value, tenantA)

      expect(prismaService.address.findFirst).toHaveBeenCalledWith({
        where: { id: mockAddress.id.value, tenantId: 'tenant-a' }
      })
    })
  })

  describe('findAll', () => {
    it('should call findMany with tenantId filter', async () => {
      prismaService.address.findMany.mockResolvedValue([])

      await repository.findAll({}, tenantA)

      expect(prismaService.address.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-a' }
      })
    })
  })

  describe('delete', () => {
    it('should call deleteMany with tenantId filter', async () => {
      await repository.delete('address-1', tenantA)

      expect(prismaService.address.deleteMany).toHaveBeenCalledWith({
        where: { id: 'address-1', tenantId: 'tenant-a' }
      })
    })
  })

  describe('save tenant guard', () => {
    it('should throw ForbiddenException for cross-tenant upsert', async () => {
      jest.spyOn(require('@shared/helpers/tenant-context.helper'), 'getEffectiveTenantId')
        .mockReturnValue('tenant-b')

      const crossTenantAddress = Address.create({
        ownerId: 'owner-1',
        ownerType: OwnerType.TENANT_SITE,
        tenantId: 'tenant-b',
        type: AddressType.BILLING,
        street: 'Rua B',
        streetType: null,
        number: '456',
        complement: null,
        district: null,
        city: 'Rio',
        state: 'RJ',
        postalCode: '20000-000',
        country: 'BR',
        isDefault: true
      })

      await expect(
        repository.save(crossTenantAddress, tenantA)
      ).rejects.toThrow()
    })
  })
})
