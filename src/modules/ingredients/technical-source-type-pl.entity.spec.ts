import { TechnicalSourceType_PL } from './technical-source-type-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { EntityDeletedError } from '@shared/errors/entity-state.errors'

describe('TechnicalSourceType_PL', () => {
  const validProps = {
    code: 'LAB',
    name: 'Laboratory Analysis',
    description: 'Results from laboratory testing'
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = TechnicalSourceType_PL.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.code).toBe('LAB')
      expect(entity.name).toBe('Laboratory Analysis')
      expect(entity.description).toBe('Results from laboratory testing')
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should create with nullable description', () => {
      const entity = TechnicalSourceType_PL.create({ ...validProps, description: null })
      expect(entity.description).toBeNull()
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = TechnicalSourceType_PL.rehydrate({
        id,
        code: 'LAB',
        name: 'Laboratory Analysis',
        description: null,
        createdAt: now,
        updatedAt: now,
        systemState: SystemState.ACTIVE
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.code).toBe('LAB')
    })
  })

  describe('behaviors', () => {
    it('should change code', () => {
      const entity = TechnicalSourceType_PL.create(validProps)
      entity.changeCode('NEW_CODE')
      expect(entity.code).toBe('NEW_CODE')
    })

    it('should change name', () => {
      const entity = TechnicalSourceType_PL.create(validProps)
      entity.changeName('New Name')
      expect(entity.name).toBe('New Name')
    })

    it('should change description', () => {
      const entity = TechnicalSourceType_PL.create(validProps)
      entity.changeDescription('New description')
      expect(entity.description).toBe('New description')
    })

    describe('Lockable', () => {
      it('should throw on behavior when DELETED', () => {
        const entity = TechnicalSourceType_PL.create(validProps)
        entity.delete()

        expect(() => entity.changeCode('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeName('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeDescription('X')).toThrow(EntityDeletedError)
      })
    })
  })
})
