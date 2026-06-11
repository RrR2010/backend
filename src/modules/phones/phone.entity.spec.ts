import { Phone, CreatePhoneProps } from './phone.entity'
import { OwnerType, PhoneType } from '@shared/enums'

function makeProps(overrides: Partial<CreatePhoneProps> = {}): CreatePhoneProps {
  return {
    ownerId: 'owner-1',
    ownerType: OwnerType.TENANT_SITE,
    tenantId: 'tenant-1',
    type: PhoneType.WHATSAPP,
    countryCode: '55',
    number: '11999998888',
    extension: null,
    isWhatsapp: true,
    isDefault: true,
    ...overrides
  }
}

describe('Phone Entity', () => {
  describe('tenantId', () => {
    it('should set and get tenantId on create', () => {
      const phone = Phone.create(makeProps({ tenantId: 'tenant-xyz' }))
      expect(phone.tenantId).toBe('tenant-xyz')
    })
  })

  describe('extension', () => {
    it('should return null when created without extension', () => {
      const phone = Phone.create(makeProps({ extension: null }))
      expect(phone.extension).toBeNull()
    })

    it('should return the value when created with extension', () => {
      const phone = Phone.create(makeProps({ extension: '200' }))
      expect(phone.extension).toBe('200')
    })

    it('should reflect change after changeExtension', () => {
      const phone = Phone.create(makeProps())
      phone.changeExtension('300')
      expect(phone.extension).toBe('300')
    })

    it('should return null after changeExtension(null)', () => {
      const phone = Phone.create(makeProps({ extension: '200' }))
      phone.changeExtension(null)
      expect(phone.extension).toBeNull()
    })
  })

  describe('rehydrate', () => {
    it('should set and get tenantId on rehydrate', () => {
      const now = new Date()
      const rehydrated = Phone.rehydrate({
        id: expect.any(Object) as any,
        createdAt: now,
        updatedAt: now,
        systemState: 'ACTIVE' as any,
        ownerId: 'owner-1',
        ownerType: OwnerType.TENANT_SITE,
        tenantId: 'rehydrate-tenant-789',
        type: PhoneType.WHATSAPP,
        countryCode: '55',
        number: '11999998888',
        extension: null,
        isWhatsapp: true,
        isDefault: true
      } as any)
      expect(rehydrated.tenantId).toBe('rehydrate-tenant-789')
    })
  })

  describe('fullNumber', () => {
    it('should include ramal when extension is set', () => {
      const phone = Phone.create(makeProps({
        countryCode: '55',
        number: '11999998888',
        extension: '200'
      }))
      expect(phone.fullNumber).toContain('+55 11999998888')
      expect(phone.fullNumber).toContain('ramal 200')
    })

    it('should not include ramal when extension is null', () => {
      const phone = Phone.create(makeProps({
        countryCode: '55',
        number: '11999998888',
        extension: null
      }))
      expect(phone.fullNumber).toBe('+55 11999998888')
      expect(phone.fullNumber).not.toContain('ramal')
    })
  })
})
