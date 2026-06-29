import { IngredientAllergen_TE } from './ingredient-allergen-te.entity'
import { AllergenRelationType } from '@prisma/client'

describe('IngredientAllergen_TE', () => {
  const validProps = {
    ingredientId: 'ingredient-1',
    allergenId: 'allergen-1',
    relationType: AllergenRelationType.CONTAINS
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = IngredientAllergen_TE.create({
        ...validProps,
        tenantId: 'tenant-1'
      })

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.tenantId).toBe('tenant-1')
      expect(entity.ingredientId).toBe('ingredient-1')
      expect(entity.allergenId).toBe('allergen-1')
      expect(entity.relationType).toBe(AllergenRelationType.CONTAINS)
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = IngredientAllergen_TE.rehydrate({
        id,
        tenantId: 'tenant-1',
        ingredientId: 'ingredient-1',
        allergenId: 'allergen-1',
        relationType: AllergenRelationType.CONTAINS,
        createdAt: now,
        updatedAt: now
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.tenantId).toBe('tenant-1')
      expect(entity.ingredientId).toBe('ingredient-1')
    })
  })

  describe('no Lockable', () => {
    it('should not have systemState or delete/lock/activate methods', () => {
      const entity = IngredientAllergen_TE.create({ ...validProps, tenantId: 't-1' })
      expect((entity as any).systemState).toBeUndefined()
      expect((entity as any).delete).toBeUndefined()
    })
  })
})
