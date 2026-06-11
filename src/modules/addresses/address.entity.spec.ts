import { Address, CreateAddressProps } from './address.entity'
import { OwnerType, AddressType } from '@shared/enums'

function makeProps(overrides: Partial<CreateAddressProps> = {}): CreateAddressProps {
  return {
    ownerId: 'owner-1',
    ownerType: OwnerType.TENANT_SITE,
    tenantId: 'tenant-1',
    type: AddressType.BILLING,
    street: 'Nove de Julho',
    streetType: null,
    number: '123',
    complement: null,
    district: null,
    city: 'São Paulo',
    state: 'SP',
    postalCode: '01310-000',
    country: 'BR',
    isDefault: true,
    ...overrides
  }
}

describe('Address Entity', () => {
  describe('tenantId', () => {
    it('should set and get tenantId on create', () => {
      const address = Address.create(makeProps({ tenantId: 'tenant-abc' }))
      expect(address.tenantId).toBe('tenant-abc')
    })
  })

  describe('streetType', () => {
    it('should return null when created without streetType', () => {
      const address = Address.create(makeProps({ streetType: null }))
      expect(address.streetType).toBeNull()
    })

    it('should return the value when created with streetType', () => {
      const address = Address.create(makeProps({ streetType: 'Rua' }))
      expect(address.streetType).toBe('Rua')
    })

    it('should reflect change after changeStreetType', () => {
      const address = Address.create(makeProps())
      address.changeStreetType('Av')
      expect(address.streetType).toBe('Av')
    })

    it('should return null after changeStreetType(null)', () => {
      const address = Address.create(makeProps({ streetType: 'Rua' }))
      address.changeStreetType(null)
      expect(address.streetType).toBeNull()
    })
  })

  describe('formattedAddress', () => {
    it('should include streetType prefix when streetType is set', () => {
      const address = Address.create(makeProps({
        streetType: 'Rua',
        street: 'Nove de Julho',
        number: '123',
        city: 'São Paulo',
        state: 'SP',
        postalCode: '01310-000',
        country: 'BR'
      }))
      expect(address.formattedAddress).toContain('Rua Nove de Julho')
      expect(address.formattedAddress).toContain('123')
      expect(address.formattedAddress).toContain('São Paulo/SP')
    })

    it('should not include streetType prefix when streetType is null', () => {
      const address = Address.create(makeProps({
        streetType: null,
        street: 'Nove de Julho',
        number: '123',
        city: 'São Paulo',
        state: 'SP',
        postalCode: '01310-000',
        country: 'BR'
      }))
      expect(address.formattedAddress).toContain('Nove de Julho')
      expect(address.formattedAddress).not.toContain('null')
    })

    it('should return exact formatted address string with streetType', () => {
      const address = Address.create(makeProps({
        streetType: 'Rua',
        street: 'Nove de Julho',
        number: '123',
        complement: null,
        district: null,
        city: 'São Paulo',
        state: 'SP',
        postalCode: '01310-000',
        country: 'BR'
      }))
      expect(address.formattedAddress).toBe('Rua Nove de Julho, 123, São Paulo/SP, 01310-000, BR')
    })
  })

  describe('rehydrate', () => {
    it('should set and get tenantId on rehydrate', () => {
      const now = new Date()
      const rehydrated = Address.rehydrate({
        id: expect.any(Object) as any,
        createdAt: now,
        updatedAt: now,
        systemState: 'ACTIVE' as any,
        ownerId: 'owner-1',
        ownerType: OwnerType.TENANT_SITE,
        tenantId: 'rehydrate-tenant-456',
        type: AddressType.BILLING,
        street: 'Nove de Julho',
        streetType: null,
        number: '123',
        complement: null,
        district: null,
        city: 'São Paulo',
        state: 'SP',
        postalCode: '01310-000',
        country: 'BR',
        isDefault: true
      } as any)
      expect(rehydrated.tenantId).toBe('rehydrate-tenant-456')
    })
  })
})
