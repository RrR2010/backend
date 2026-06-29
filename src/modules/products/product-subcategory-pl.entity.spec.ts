import { ProductSubcategory_PL } from './product-subcategory-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { EntityDeletedError } from '@shared/errors/entity-state.errors'

describe('ProductSubcategory_PL', () => {
  const validProps = {
    categoryId: 'category-1',
    code: 'SUB-01',
    name: 'Dairy Ice Cream',
    sequentialNumber: 1
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = ProductSubcategory_PL.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.categoryId).toBe('category-1')
      expect(entity.code).toBe('SUB-01')
      expect(entity.name).toBe('Dairy Ice Cream')
      expect(entity.sequentialNumber).toBe(1)
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = ProductSubcategory_PL.rehydrate({
        id,
        categoryId: 'category-1',
        code: 'SUB-01',
        name: 'Dairy Ice Cream',
        sequentialNumber: 1,
        createdAt: now,
        updatedAt: now,
        systemState: SystemState.ACTIVE
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.code).toBe('SUB-01')
    })
  })

  describe('behaviors', () => {
    it('should change categoryId', () => {
      const entity = ProductSubcategory_PL.create(validProps)
      entity.changeCategoryId('new-cat')
      expect(entity.categoryId).toBe('new-cat')
    })

    it('should change code', () => {
      const entity = ProductSubcategory_PL.create(validProps)
      entity.changeCode('NEW-SUB')
      expect(entity.code).toBe('NEW-SUB')
    })

    it('should change name', () => {
      const entity = ProductSubcategory_PL.create(validProps)
      entity.changeName('New Name')
      expect(entity.name).toBe('New Name')
    })

    it('should change sequentialNumber', () => {
      const entity = ProductSubcategory_PL.create(validProps)
      entity.changeSequentialNumber(5)
      expect(entity.sequentialNumber).toBe(5)
    })

    describe('Lockable', () => {
      it('should throw on behavior when DELETED', () => {
        const entity = ProductSubcategory_PL.create(validProps)
        entity.delete()

        expect(() => entity.changeCategoryId('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeCode('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeName('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeSequentialNumber(2)).toThrow(EntityDeletedError)
      })
    })
  })
})
