import { ProductCategory_PL } from './product-category-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { EntityDeletedError } from '@shared/errors/entity-state.errors'

describe('ProductCategory_PL', () => {
  const validProps = {
    code: 'CAT-01',
    name: 'Ice Cream',
    description: 'Ice cream products',
    sequentialNumber: 1
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = ProductCategory_PL.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.code).toBe('CAT-01')
      expect(entity.name).toBe('Ice Cream')
      expect(entity.description).toBe('Ice cream products')
      expect(entity.sequentialNumber).toBe(1)
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should create with nullable description', () => {
      const entity = ProductCategory_PL.create({ ...validProps, description: null })
      expect(entity.description).toBeNull()
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = ProductCategory_PL.rehydrate({
        id,
        code: 'CAT-01',
        name: 'Ice Cream',
        description: null,
        sequentialNumber: 1,
        createdAt: now,
        updatedAt: now,
        systemState: SystemState.ACTIVE
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.code).toBe('CAT-01')
    })
  })

  describe('behaviors', () => {
    it('should change code', () => {
      const entity = ProductCategory_PL.create(validProps)
      entity.changeCode('NEW-CAT')
      expect(entity.code).toBe('NEW-CAT')
    })

    it('should change name', () => {
      const entity = ProductCategory_PL.create(validProps)
      entity.changeName('New Name')
      expect(entity.name).toBe('New Name')
    })

    it('should change description', () => {
      const entity = ProductCategory_PL.create(validProps)
      entity.changeDescription('New desc')
      expect(entity.description).toBe('New desc')
    })

    it('should change sequentialNumber', () => {
      const entity = ProductCategory_PL.create(validProps)
      entity.changeSequentialNumber(5)
      expect(entity.sequentialNumber).toBe(5)
    })

    describe('Lockable', () => {
      it('should throw on behavior when DELETED', () => {
        const entity = ProductCategory_PL.create(validProps)
        entity.delete()

        expect(() => entity.changeCode('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeName('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeDescription('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeSequentialNumber(2)).toThrow(EntityDeletedError)
      })
    })
  })
})
