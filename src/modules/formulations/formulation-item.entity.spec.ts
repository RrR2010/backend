import { FormulationItem_TE } from './formulation-item.entity'

describe('FormulationItem_TE', () => {
  const validProps = {
    formulationRevisionId: 'revision-1',
    ingredientId: 'ingredient-1',
    quantity: 10.5,
    unitId: 'uom-1',
    tenantId: 'tenant-1'
  }

  describe('create', () => {
    it('should create with valid required props', () => {
      const entity = FormulationItem_TE.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.formulationRevisionId).toBe('revision-1')
      expect(entity.ingredientId).toBe('ingredient-1')
      expect(entity.quantity).toBe(10.5)
      expect(entity.unitId).toBe('uom-1')
      expect(entity.tenantId).toBe('tenant-1')
      expect(entity.usageCategory).toBeNull()
      expect(entity.componentGroup).toBeNull()
      expect(entity.sortOrder).toBe(0)
      expect(entity.notes).toBeNull()
    })

    it('should create with optional fields', () => {
      const entity = FormulationItem_TE.create({
        ...validProps,
        usageCategory: 'FILLING',
        componentGroup: 'BASE',
        sortOrder: 5,
        notes: 'Important ingredient'
      })

      expect(entity.usageCategory).toBe('FILLING')
      expect(entity.componentGroup).toBe('BASE')
      expect(entity.sortOrder).toBe(5)
      expect(entity.notes).toBe('Important ingredient')
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = FormulationItem_TE.rehydrate({
        id,
        formulationRevisionId: 'revision-1',
        ingredientId: 'ingredient-1',
        quantity: 10.5,
        unitId: 'uom-1',
        tenantId: 'tenant-1',
        usageCategory: null,
        componentGroup: null,
        sortOrder: 0,
        notes: null,
        createdAt: now,
        updatedAt: now
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.quantity).toBe(10.5)
    })
  })

  describe('behaviors', () => {
    it('should change quantity', () => {
      const entity = FormulationItem_TE.create(validProps)
      entity.changeQuantity(20.0)
      expect(entity.quantity).toBe(20.0)
    })

    it('should change unitId', () => {
      const entity = FormulationItem_TE.create(validProps)
      entity.changeUnitId('new-uom')
      expect(entity.unitId).toBe('new-uom')
    })

    it('should change usageCategory', () => {
      const entity = FormulationItem_TE.create(validProps)
      entity.changeUsageCategory('COATING')
      expect(entity.usageCategory).toBe('COATING')
    })

    it('should change componentGroup', () => {
      const entity = FormulationItem_TE.create(validProps)
      entity.changeComponentGroup('FLAVOR')
      expect(entity.componentGroup).toBe('FLAVOR')
    })

    it('should change sortOrder', () => {
      const entity = FormulationItem_TE.create(validProps)
      entity.changeSortOrder(10)
      expect(entity.sortOrder).toBe(10)
    })

    it('should change notes', () => {
      const entity = FormulationItem_TE.create(validProps)
      entity.changeNotes('Updated notes')
      expect(entity.notes).toBe('Updated notes')
    })
  })
})
