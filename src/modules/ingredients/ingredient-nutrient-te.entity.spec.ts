import { IngredientNutrient_TE } from './ingredient-nutrient-te.entity'

describe('IngredientNutrient_TE', () => {
  const validProps = {
    ingredientId: 'ingredient-1',
    nutrientId: 'nutrient-1',
    value: 10.5,
    sourceId: 'source-1'
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = IngredientNutrient_TE.create({
        ...validProps,
        tenantId: 'tenant-1'
      })

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.tenantId).toBe('tenant-1')
      expect(entity.ingredientId).toBe('ingredient-1')
      expect(entity.nutrientId).toBe('nutrient-1')
      expect(entity.value).toBe(10.5)
      expect(entity.sourceId).toBe('source-1')
    })

    it('should create with nullable value and sourceId', () => {
      const entity = IngredientNutrient_TE.create({
        ingredientId: 'ingredient-1',
        nutrientId: 'nutrient-1',
        value: null,
        sourceId: null,
        tenantId: 'tenant-1'
      })

      expect(entity.value).toBeNull()
      expect(entity.sourceId).toBeNull()
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = IngredientNutrient_TE.rehydrate({
        id,
        tenantId: 'tenant-1',
        ingredientId: 'ingredient-1',
        nutrientId: 'nutrient-1',
        value: null,
        sourceId: null,
        createdAt: now,
        updatedAt: now
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.value).toBeNull()
    })
  })

  describe('behaviors', () => {
    it('should change value', () => {
      const entity = IngredientNutrient_TE.create({ ...validProps, tenantId: 't-1' })
      entity.changeValue(20.0)
      expect(entity.value).toBe(20.0)
    })

    it('should change sourceId', () => {
      const entity = IngredientNutrient_TE.create({ ...validProps, tenantId: 't-1' })
      entity.changeSourceId('new-source')
      expect(entity.sourceId).toBe('new-source')
    })
  })
})
