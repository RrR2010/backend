import { Company_TE } from './company.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { EntityDeletedError } from '@shared/errors/entity-state.errors'

describe('Company_TE', () => {
  const validProps = {
    tenantId: 'tenant-1',
    name: 'Supplier Ltda',
    type: 'MANUFACTURER',
    contactInfo: 'contact@supplier.com',
    taxId: '12.345.678/0001-90'
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = Company_TE.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.tenantId).toBe('tenant-1')
      expect(entity.name).toBe('Supplier Ltda')
      expect(entity.type).toBe('MANUFACTURER')
      expect(entity.contactInfo).toBe('contact@supplier.com')
      expect(entity.taxId).toBe('12.345.678/0001-90')
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should create with nullable fields', () => {
      const entity = Company_TE.create({
        ...validProps,
        contactInfo: null,
        taxId: null
      })

      expect(entity.contactInfo).toBeNull()
      expect(entity.taxId).toBeNull()
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = Company_TE.rehydrate({
        id,
        tenantId: 'tenant-1',
        name: 'Supplier Ltda',
        type: 'MANUFACTURER',
        contactInfo: null,
        taxId: null,
        createdAt: now,
        updatedAt: now,
        systemState: SystemState.ACTIVE
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.name).toBe('Supplier Ltda')
    })
  })

  describe('behaviors', () => {
    it('should change name', () => {
      const entity = Company_TE.create(validProps)
      entity.changeName('New Name')
      expect(entity.name).toBe('New Name')
    })

    it('should change type', () => {
      const entity = Company_TE.create(validProps)
      entity.changeType('SUPPLIER')
      expect(entity.type).toBe('SUPPLIER')
    })

    it('should change contactInfo', () => {
      const entity = Company_TE.create(validProps)
      entity.changeContactInfo('new@contact.com')
      expect(entity.contactInfo).toBe('new@contact.com')
    })

    it('should change contactInfo to null', () => {
      const entity = Company_TE.create(validProps)
      entity.changeContactInfo(null)
      expect(entity.contactInfo).toBeNull()
    })

    it('should change taxId', () => {
      const entity = Company_TE.create(validProps)
      entity.changeTaxId('NEW-TAX-ID')
      expect(entity.taxId).toBe('NEW-TAX-ID')
    })

    it('should change taxId to null', () => {
      const entity = Company_TE.create(validProps)
      entity.changeTaxId(null)
      expect(entity.taxId).toBeNull()
    })

    describe('Lockable', () => {
      it('should throw on behavior when DELETED', () => {
        const entity = Company_TE.create(validProps)
        entity.delete()

        expect(() => entity.changeName('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeType('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeContactInfo('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeTaxId('X')).toThrow(EntityDeletedError)
      })
    })
  })
})
