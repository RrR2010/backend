import { ProductNutrientOverride_TE } from './product-nutrient-override-te.entity'

describe('ProductNutrientOverride_TE', () => {
  const validProps = {
    tenantId: 'tenant-1',
    productId: 'product-1',
    nutrientId: 'nutrient-1',
    overriddenValue: 10.5,
    notes: 'Overridden for recipe adjustment'
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = ProductNutrientOverride_TE.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.tenantId).toBe('tenant-1')
      expect(entity.productId).toBe('product-1')
      expect(entity.nutrientId).toBe('nutrient-1')
      expect(entity.overriddenValue).toBe(10.5)
      expect(entity.notes).toBe('Overridden for recipe adjustment')
    })

    it('should create with nullable notes', () => {
      const entity = ProductNutrientOverride_TE.create({
        ...validProps,
        notes: null
      })

      expect(entity.notes).toBeNull()
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = ProductNutrientOverride_TE.rehydrate({
        id,
        tenantId: 'tenant-1',
        productId: 'product-1',
        nutrientId: 'nutrient-1',
        overriddenValue: 10.5,
        notes: null,
        createdAt: now,
        updatedAt: now
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.overriddenValue).toBe(10.5)
    })
  })

  describe('behaviors', () => {
    it('should change overriddenValue', () => {
      const entity = ProductNutrientOverride_TE.create(validProps)
      entity.changeOverriddenValue(20.0)
      expect(entity.overriddenValue).toBe(20.0)
    })

    it('should change notes', () => {
      const entity = ProductNutrientOverride_TE.create(validProps)
      entity.changeNotes('Updated notes')
      expect(entity.notes).toBe('Updated notes')
    })
  })
})
