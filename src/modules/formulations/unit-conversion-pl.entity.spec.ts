import { UnitConversion_PL } from './unit-conversion-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { EntityDeletedError } from '@shared/errors/entity-state.errors'

describe('UnitConversion_PL', () => {
  const validProps = {
    fromUnitId: 'kg-id',
    toUnitId: 'g-id',
    factor: 1000
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = UnitConversion_PL.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.fromUnitId).toBe('kg-id')
      expect(entity.toUnitId).toBe('g-id')
      expect(entity.factor).toBe(1000)
      expect(entity.createdBy).toBeNull()
      expect(entity.updatedBy).toBeNull()
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = UnitConversion_PL.rehydrate({
        id,
        fromUnitId: 'kg-id',
        toUnitId: 'g-id',
        factor: 1000,
        createdBy: 'user-1',
        updatedBy: null,
        createdAt: now,
        updatedAt: now,
        systemState: SystemState.ACTIVE
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.fromUnitId).toBe('kg-id')
    })
  })

  describe('behaviors', () => {
    it('should change factor', () => {
      const entity = UnitConversion_PL.create(validProps)
      entity.changeFactor(0.001)
      expect(entity.factor).toBe(0.001)
    })

    describe('Lockable', () => {
      it('should throw on behavior when DELETED', () => {
        const entity = UnitConversion_PL.create(validProps)
        entity.delete()

        expect(() => entity.changeFactor(2)).toThrow(EntityDeletedError)
      })
    })
  })
})
