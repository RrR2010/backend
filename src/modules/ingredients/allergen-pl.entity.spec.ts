import { Allergen_PL } from './allergen-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { EntityDeletedError } from '@shared/errors/entity-state.errors'

describe('Allergen_PL', () => {
  const validProps = {
    name: 'Gluten',
    category: 'Cereal',
    regulatoryRef: 'EU 1169/2011',
    sortOrder: 1
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = Allergen_PL.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.name).toBe('Gluten')
      expect(entity.category).toBe('Cereal')
      expect(entity.regulatoryRef).toBe('EU 1169/2011')
      expect(entity.sortOrder).toBe(1)
      expect(entity.createdBy).toBeNull()
      expect(entity.updatedBy).toBeNull()
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should create with nullable fields as null', () => {
      const entity = Allergen_PL.create({
        name: 'Test',
        category: null,
        regulatoryRef: null,
        sortOrder: 0
      })

      expect(entity.category).toBeNull()
      expect(entity.regulatoryRef).toBeNull()
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = Allergen_PL.rehydrate({
        id,
        name: 'Gluten',
        category: 'Cereal',
        regulatoryRef: 'EU 1169/2011',
        sortOrder: 1,
        createdBy: 'user-1',
        updatedBy: 'user-1',
        createdAt: now,
        updatedAt: now,
        systemState: SystemState.ACTIVE
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.name).toBe('Gluten')
      expect(entity.createdBy).toBe('user-1')
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })
  })

  describe('behaviors', () => {
    it('should change name', () => {
      const entity = Allergen_PL.create(validProps)
      entity.changeName('New Name')
      expect(entity.name).toBe('New Name')
    })

    it('should change category', () => {
      const entity = Allergen_PL.create(validProps)
      entity.changeCategory('New Category')
      expect(entity.category).toBe('New Category')
    })

    it('should change category to null', () => {
      const entity = Allergen_PL.create(validProps)
      entity.changeCategory(null)
      expect(entity.category).toBeNull()
    })

    it('should change regulatoryRef', () => {
      const entity = Allergen_PL.create(validProps)
      entity.changeRegulatoryRef('New Ref')
      expect(entity.regulatoryRef).toBe('New Ref')
    })

    it('should change regulatoryRef to null', () => {
      const entity = Allergen_PL.create(validProps)
      entity.changeRegulatoryRef(null)
      expect(entity.regulatoryRef).toBeNull()
    })

    it('should change sortOrder', () => {
      const entity = Allergen_PL.create(validProps)
      entity.changeSortOrder(5)
      expect(entity.sortOrder).toBe(5)
    })

    describe('Lockable', () => {
      it('should throw on behavior when DELETED', () => {
        const entity = Allergen_PL.create(validProps)
        entity.delete()

        expect(() => entity.changeName('New')).toThrow(EntityDeletedError)
        expect(() => entity.changeCategory('New')).toThrow(EntityDeletedError)
        expect(() => entity.changeRegulatoryRef('New')).toThrow(EntityDeletedError)
        expect(() => entity.changeSortOrder(5)).toThrow(EntityDeletedError)
      })
    })
  })
})
