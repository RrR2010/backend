import { IngredientFlag_TE } from './ingredient-flag-te.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { EntityDeletedError, EntityNotLockedError } from '@shared/errors/entity-state.errors'

describe('IngredientFlag_TE', () => {
  const validProps = {
    ingredientId: 'ingredient-1',
    flagId: 'flag-1',
    flagValue: true,
    notes: 'Some notes'
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = IngredientFlag_TE.create({
        ...validProps,
        tenantId: 'tenant-1'
      })

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.tenantId).toBe('tenant-1')
      expect(entity.ingredientId).toBe('ingredient-1')
      expect(entity.flagId).toBe('flag-1')
      expect(entity.flagValue).toBe(true)
      expect(entity.notes).toBe('Some notes')
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should create with nullable notes', () => {
      const entity = IngredientFlag_TE.create({
        ...validProps,
        notes: null,
        tenantId: 'tenant-1'
      })

      expect(entity.notes).toBeNull()
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = IngredientFlag_TE.rehydrate({
        id,
        tenantId: 'tenant-1',
        ingredientId: 'ingredient-1',
        flagId: 'flag-1',
        flagValue: false,
        notes: null,
        createdAt: now,
        updatedAt: now,
        systemState: SystemState.ACTIVE
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.flagValue).toBe(false)
    })
  })

  describe('behaviors', () => {
    it('should change flagValue', () => {
      const entity = IngredientFlag_TE.create({ ...validProps, tenantId: 't-1' })
      entity.changeFlagValue(false)
      expect(entity.flagValue).toBe(false)
    })

    it('should change notes', () => {
      const entity = IngredientFlag_TE.create({ ...validProps, tenantId: 't-1' })
      entity.changeNotes('Updated notes')
      expect(entity.notes).toBe('Updated notes')
    })

    it('should change notes to null', () => {
      const entity = IngredientFlag_TE.create({ ...validProps, tenantId: 't-1' })
      entity.changeNotes(null)
      expect(entity.notes).toBeNull()
    })

    describe('Lockable', () => {
      it('should throw on behavior when DELETED', () => {
        const entity = IngredientFlag_TE.create({ ...validProps, tenantId: 't-1' })
        entity.delete()

        expect(() => entity.changeFlagValue(false)).toThrow(EntityDeletedError)
        expect(() => entity.changeNotes('X')).toThrow(EntityDeletedError)
      })

      it('should allow unlock after lock', () => {
        const entity = IngredientFlag_TE.create({ ...validProps, tenantId: 't-1' })
        entity.lock()
        expect(entity.systemState).toBe(SystemState.LOCKED)

        entity.unlock()
        expect(entity.systemState).toBe(SystemState.ACTIVE)
      })

      it('should throw on unlock when not locked', () => {
        const entity = IngredientFlag_TE.create({ ...validProps, tenantId: 't-1' })
        expect(() => entity.unlock()).toThrow(EntityNotLockedError)
      })
    })
  })
})
