import { Nutrient_PL } from './nutrient-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { EntityDeletedError } from '@shared/errors/entity-state.errors'
import { NutrientUnit, NutrientCategory } from '@prisma/client'

describe('Nutrient_PL', () => {
  const validProps = {
    name: 'Energy',
    unit: NutrientUnit.KCAL,
    category: NutrientCategory.MACRONUTRIENT,
    parentId: null,
    level: 1,
    sortOrder: 1,
    regulatoryRef: null
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = Nutrient_PL.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.name).toBe('Energy')
      expect(entity.unit).toBe(NutrientUnit.KCAL)
      expect(entity.category).toBe(NutrientCategory.MACRONUTRIENT)
      expect(entity.parentId).toBeNull()
      expect(entity.level).toBe(1)
      expect(entity.sortOrder).toBe(1)
      expect(entity.regulatoryRef).toBeNull()
      expect(entity.createdBy).toBeNull()
      expect(entity.updatedBy).toBeNull()
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should create with hierarchy fields', () => {
      const entity = Nutrient_PL.create({
        name: 'Saturated Fat',
        unit: NutrientUnit.G,
        category: NutrientCategory.MACRONUTRIENT,
        parentId: 'parent-id',
        level: 2,
        sortOrder: 2,
        regulatoryRef: 'Reg 1169/2011'
      })

      expect(entity.parentId).toBe('parent-id')
      expect(entity.level).toBe(2)
      expect(entity.regulatoryRef).toBe('Reg 1169/2011')
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = Nutrient_PL.rehydrate({
        id,
        name: 'Energy',
        unit: NutrientUnit.KCAL,
        category: NutrientCategory.MACRONUTRIENT,
        parentId: null,
        level: 1,
        sortOrder: 1,
        regulatoryRef: null,
        createdBy: 'user-1',
        updatedBy: 'user-1',
        createdAt: now,
        updatedAt: now,
        systemState: SystemState.ACTIVE
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.name).toBe('Energy')
    })
  })

  describe('behaviors', () => {
    it('should change name', () => {
      const entity = Nutrient_PL.create(validProps)
      entity.changeName('New Energy')
      expect(entity.name).toBe('New Energy')
    })

    it('should change unit', () => {
      const entity = Nutrient_PL.create(validProps)
      entity.changeUnit(NutrientUnit.KJ)
      expect(entity.unit).toBe(NutrientUnit.KJ)
    })

    it('should change category', () => {
      const entity = Nutrient_PL.create(validProps)
      entity.changeCategory(NutrientCategory.MINERAL)
      expect(entity.category).toBe(NutrientCategory.MINERAL)
    })

    it('should change parentId', () => {
      const entity = Nutrient_PL.create(validProps)
      entity.changeParentId('new-parent-id')
      expect(entity.parentId).toBe('new-parent-id')
    })

    it('should change parentId to null', () => {
      const entity = Nutrient_PL.create({ ...validProps, parentId: 'some-id' })
      entity.changeParentId(null)
      expect(entity.parentId).toBeNull()
    })

    it('should change level', () => {
      const entity = Nutrient_PL.create(validProps)
      entity.changeLevel(3)
      expect(entity.level).toBe(3)
    })

    it('should change sortOrder', () => {
      const entity = Nutrient_PL.create(validProps)
      entity.changeSortOrder(10)
      expect(entity.sortOrder).toBe(10)
    })

    it('should change regulatoryRef', () => {
      const entity = Nutrient_PL.create(validProps)
      entity.changeRegulatoryRef('New Reg')
      expect(entity.regulatoryRef).toBe('New Reg')
    })

    describe('Lockable', () => {
      it('should throw on behavior when DELETED', () => {
        const entity = Nutrient_PL.create(validProps)
        entity.delete()

        expect(() => entity.changeName('New')).toThrow(EntityDeletedError)
        expect(() => entity.changeUnit(NutrientUnit.G)).toThrow(EntityDeletedError)
        expect(() => entity.changeCategory(NutrientCategory.MINERAL)).toThrow(EntityDeletedError)
        expect(() => entity.changeParentId('new')).toThrow(EntityDeletedError)
        expect(() => entity.changeLevel(2)).toThrow(EntityDeletedError)
        expect(() => entity.changeSortOrder(2)).toThrow(EntityDeletedError)
        expect(() => entity.changeRegulatoryRef('new')).toThrow(EntityDeletedError)
      })
    })
  })
})
