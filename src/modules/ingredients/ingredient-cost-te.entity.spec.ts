import { IngredientCost_TE } from './ingredient-cost-te.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { EntityDeletedError, EntityNotLockedError } from '@shared/errors/entity-state.errors'

describe('IngredientCost_TE', () => {
  const validProps = {
    ingredientId: 'ingredient-1',
    unitPrice: 10.5,
    currencyCode: 'BRL',
    unitOfMeasureId: 'uom-1',
    effectiveDate: new Date('2024-01-01'),
    supplierId: 'supplier-1',
    notes: 'Cost notes'
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = IngredientCost_TE.create({
        ...validProps,
        tenantId: 'tenant-1'
      })

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.tenantId).toBe('tenant-1')
      expect(entity.ingredientId).toBe('ingredient-1')
      expect(entity.unitPrice).toBe(10.5)
      expect(entity.currencyCode).toBe('BRL')
      expect(entity.unitOfMeasureId).toBe('uom-1')
      expect(entity.effectiveDate).toEqual(validProps.effectiveDate)
      expect(entity.supplierId).toBe('supplier-1')
      expect(entity.notes).toBe('Cost notes')
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should create with nullable fields', () => {
      const entity = IngredientCost_TE.create({
        ingredientId: 'ingredient-1',
        unitPrice: 5.0,
        currencyCode: 'USD',
        unitOfMeasureId: 'uom-1',
        effectiveDate: new Date(),
        supplierId: null,
        notes: null,
        tenantId: 'tenant-1'
      })

      expect(entity.supplierId).toBeNull()
      expect(entity.notes).toBeNull()
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = IngredientCost_TE.rehydrate({
        id,
        tenantId: 'tenant-1',
        ingredientId: 'ingredient-1',
        unitPrice: 10.5,
        currencyCode: 'BRL',
        unitOfMeasureId: 'uom-1',
        effectiveDate: new Date('2024-01-01'),
        supplierId: null,
        notes: null,
        createdAt: now,
        updatedAt: now,
        systemState: SystemState.ACTIVE
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.unitPrice).toBe(10.5)
    })
  })

  describe('behaviors', () => {
    it('should change unitPrice', () => {
      const entity = IngredientCost_TE.create({ ...validProps, tenantId: 't-1' })
      entity.changeUnitPrice(15.0)
      expect(entity.unitPrice).toBe(15.0)
    })

    it('should change currencyCode', () => {
      const entity = IngredientCost_TE.create({ ...validProps, tenantId: 't-1' })
      entity.changeCurrencyCode('USD')
      expect(entity.currencyCode).toBe('USD')
    })

    it('should change unitOfMeasureId', () => {
      const entity = IngredientCost_TE.create({ ...validProps, tenantId: 't-1' })
      entity.changeUnitOfMeasureId('new-uom')
      expect(entity.unitOfMeasureId).toBe('new-uom')
    })

    it('should change effectiveDate', () => {
      const date = new Date('2025-01-01')
      const entity = IngredientCost_TE.create({ ...validProps, tenantId: 't-1' })
      entity.changeEffectiveDate(date)
      expect(entity.effectiveDate).toEqual(date)
    })

    it('should change supplierId', () => {
      const entity = IngredientCost_TE.create({ ...validProps, tenantId: 't-1' })
      entity.changeSupplierId('new-supplier')
      expect(entity.supplierId).toBe('new-supplier')
    })

    it('should change notes', () => {
      const entity = IngredientCost_TE.create({ ...validProps, tenantId: 't-1' })
      entity.changeNotes('Updated notes')
      expect(entity.notes).toBe('Updated notes')
    })

    describe('Lockable', () => {
      it('should throw on behavior when DELETED', () => {
        const entity = IngredientCost_TE.create({ ...validProps, tenantId: 't-1' })
        entity.delete()

        expect(() => entity.changeUnitPrice(1)).toThrow(EntityDeletedError)
        expect(() => entity.changeCurrencyCode('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeUnitOfMeasureId('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeEffectiveDate(new Date())).toThrow(EntityDeletedError)
        expect(() => entity.changeSupplierId('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeNotes('X')).toThrow(EntityDeletedError)
      })

      it('should allow unlock after lock', () => {
        const entity = IngredientCost_TE.create({ ...validProps, tenantId: 't-1' })
        entity.lock()
        expect(entity.systemState).toBe(SystemState.LOCKED)

        entity.unlock()
        expect(entity.systemState).toBe(SystemState.ACTIVE)
      })

      it('should throw on unlock when not locked', () => {
        const entity = IngredientCost_TE.create({ ...validProps, tenantId: 't-1' })
        expect(() => entity.unlock()).toThrow(EntityNotLockedError)
      })
    })
  })
})
