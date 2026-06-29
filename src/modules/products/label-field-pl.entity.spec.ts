import { LabelField_PL } from './label-field-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { EntityDeletedError } from '@shared/errors/entity-state.errors'

describe('LabelField_PL', () => {
  const validProps = {
    fieldName: 'ingredients_list',
    sortOrder: 1
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = LabelField_PL.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.fieldName).toBe('ingredients_list')
      expect(entity.sortOrder).toBe(1)
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = LabelField_PL.rehydrate({
        id,
        fieldName: 'ingredients_list',
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
        systemState: SystemState.ACTIVE
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.fieldName).toBe('ingredients_list')
    })
  })

  describe('behaviors', () => {
    it('should change fieldName', () => {
      const entity = LabelField_PL.create(validProps)
      entity.changeFieldName('new_field')
      expect(entity.fieldName).toBe('new_field')
    })

    it('should change sortOrder', () => {
      const entity = LabelField_PL.create(validProps)
      entity.changeSortOrder(5)
      expect(entity.sortOrder).toBe(5)
    })

    describe('Lockable', () => {
      it('should throw on behavior when DELETED', () => {
        const entity = LabelField_PL.create(validProps)
        entity.delete()

        expect(() => entity.changeFieldName('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeSortOrder(2)).toThrow(EntityDeletedError)
      })
    })
  })
})
