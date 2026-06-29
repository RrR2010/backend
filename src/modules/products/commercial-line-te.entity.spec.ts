import { CommercialLine_TE } from './commercial-line-te.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { EntityDeletedError } from '@shared/errors/entity-state.errors'

describe('CommercialLine_TE', () => {
  const validProps = {
    tenantId: 'tenant-1',
    name: 'Summer Collection',
    description: '2024 summer product line'
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = CommercialLine_TE.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.tenantId).toBe('tenant-1')
      expect(entity.name).toBe('Summer Collection')
      expect(entity.description).toBe('2024 summer product line')
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should create with nullable description', () => {
      const entity = CommercialLine_TE.create({ ...validProps, description: null })
      expect(entity.description).toBeNull()
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = CommercialLine_TE.rehydrate({
        id,
        tenantId: 'tenant-1',
        name: 'Summer Collection',
        description: null,
        createdAt: now,
        updatedAt: now,
        systemState: SystemState.ACTIVE
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.name).toBe('Summer Collection')
    })
  })

  describe('behaviors', () => {
    it('should change name', () => {
      const entity = CommercialLine_TE.create(validProps)
      entity.changeName('New Line')
      expect(entity.name).toBe('New Line')
    })

    it('should change description', () => {
      const entity = CommercialLine_TE.create(validProps)
      entity.changeDescription('New desc')
      expect(entity.description).toBe('New desc')
    })

    describe('Lockable', () => {
      it('should throw on behavior when DELETED', () => {
        const entity = CommercialLine_TE.create(validProps)
        entity.delete()

        expect(() => entity.changeName('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeDescription('X')).toThrow(EntityDeletedError)
      })
    })
  })
})
