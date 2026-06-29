import { FunctionalGroup_TE } from './functional-group.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { EntityDeletedError } from '@shared/errors/entity-state.errors'

describe('FunctionalGroup_TE', () => {
  const validProps = {
    tenantId: 'tenant-1',
    name: 'Stabilizers',
    code: 'STB-01',
    sortOrder: 1,
    isActive: true
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = FunctionalGroup_TE.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.tenantId).toBe('tenant-1')
      expect(entity.name).toBe('Stabilizers')
      expect(entity.code).toBe('STB-01')
      expect(entity.sortOrder).toBe(1)
      expect(entity.isActive).toBe(true)
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should create with nullable code', () => {
      const entity = FunctionalGroup_TE.create({ ...validProps, code: null })
      expect(entity.code).toBeNull()
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = FunctionalGroup_TE.rehydrate({
        id,
        tenantId: 'tenant-1',
        name: 'Stabilizers',
        code: null,
        sortOrder: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        systemState: SystemState.ACTIVE
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.name).toBe('Stabilizers')
    })
  })

  describe('behaviors', () => {
    it('should change name', () => {
      const entity = FunctionalGroup_TE.create(validProps)
      entity.changeName('New Name')
      expect(entity.name).toBe('New Name')
    })

    it('should change code', () => {
      const entity = FunctionalGroup_TE.create(validProps)
      entity.changeCode('NEW-CODE')
      expect(entity.code).toBe('NEW-CODE')
    })

    it('should change sortOrder', () => {
      const entity = FunctionalGroup_TE.create(validProps)
      entity.changeSortOrder(5)
      expect(entity.sortOrder).toBe(5)
    })

    it('should toggle isActive', () => {
      const entity = FunctionalGroup_TE.create(validProps)
      expect(entity.isActive).toBe(true)
      entity.toggleActive()
      expect(entity.isActive).toBe(false)
      entity.toggleActive()
      expect(entity.isActive).toBe(true)
    })

    it('should setActive (noop when already active)', () => {
      const entity = FunctionalGroup_TE.create(validProps)
      entity.setActive()
      expect(entity.isActive).toBe(true)
    })

    it('should setInactive', () => {
      const entity = FunctionalGroup_TE.create(validProps)
      entity.setInactive()
      expect(entity.isActive).toBe(false)
    })

    it('should setInactive (noop when already inactive)', () => {
      const entity = FunctionalGroup_TE.create({ ...validProps, isActive: false })
      entity.setInactive()
      expect(entity.isActive).toBe(false)
    })

    it('should sync isActive on activate', () => {
      const entity = FunctionalGroup_TE.create(validProps)
      entity.delete()
      expect(entity.isActive).toBe(false)
    })

    describe('Lockable', () => {
      it('should throw on behavior when DELETED', () => {
        const entity = FunctionalGroup_TE.create(validProps)
        entity.delete()

        expect(() => entity.changeName('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeCode('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeSortOrder(2)).toThrow(EntityDeletedError)
        expect(() => entity.toggleActive()).toThrow(EntityDeletedError)
        expect(() => entity.setActive()).toThrow(EntityDeletedError)
        expect(() => entity.setInactive()).toThrow(EntityDeletedError)
      })
    })
  })
})
