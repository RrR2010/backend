import { FormulationVersion_TE } from './formulation-version.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { EntityDeletedError } from '@shared/errors/entity-state.errors'

describe('FormulationVersion_TE', () => {
  const validProps = {
    tenantId: 'tenant-1',
    productId: 'product-1',
    version: 1
  }

  describe('create', () => {
    it('should create with valid required props', () => {
      const entity = FormulationVersion_TE.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.tenantId).toBe('tenant-1')
      expect(entity.productId).toBe('product-1')
      expect(entity.version).toBe(1)
      expect(entity.notes).toBeNull()
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should create with optional notes', () => {
      const entity = FormulationVersion_TE.create({
        ...validProps,
        notes: 'Initial version'
      })

      expect(entity.notes).toBe('Initial version')
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = FormulationVersion_TE.rehydrate({
        id,
        tenantId: 'tenant-1',
        productId: 'product-1',
        version: 1,
        notes: null,
        createdAt: now,
        updatedAt: now,
        systemState: SystemState.ACTIVE
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.version).toBe(1)
    })
  })

  describe('behaviors', () => {
    it('should change notes', () => {
      const entity = FormulationVersion_TE.create(validProps)
      entity.changeNotes('Updated notes')
      expect(entity.notes).toBe('Updated notes')
    })

    describe('Lockable', () => {
      it('should throw on behavior when DELETED', () => {
        const entity = FormulationVersion_TE.create(validProps)
        entity.delete()

        expect(() => entity.changeNotes('X')).toThrow(EntityDeletedError)
      })
    })
  })
})
