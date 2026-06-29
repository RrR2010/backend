import { RegulationType_PL } from './regulation-type-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { EntityDeletedError } from '@shared/errors/entity-state.errors'

describe('RegulationType_PL', () => {
  const validProps = {
    abbreviation: 'REG',
    code: 'REG-01',
    name: 'Regulation',
    description: 'A type of regulation'
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = RegulationType_PL.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.abbreviation).toBe('REG')
      expect(entity.code).toBe('REG-01')
      expect(entity.name).toBe('Regulation')
      expect(entity.description).toBe('A type of regulation')
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should create with nullable description', () => {
      const entity = RegulationType_PL.create({ ...validProps, description: null })
      expect(entity.description).toBeNull()
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = RegulationType_PL.rehydrate({
        id,
        abbreviation: 'REG',
        code: 'REG-01',
        name: 'Regulation',
        description: null,
        createdAt: now,
        updatedAt: now,
        systemState: SystemState.ACTIVE
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.code).toBe('REG-01')
    })
  })

  describe('behaviors', () => {
    it('should change code', () => {
      const entity = RegulationType_PL.create(validProps)
      entity.changeCode('NEW_CODE')
      expect(entity.code).toBe('NEW_CODE')
    })

    it('should change name', () => {
      const entity = RegulationType_PL.create(validProps)
      entity.changeName('New Name')
      expect(entity.name).toBe('New Name')
    })

    it('should change abbreviation', () => {
      const entity = RegulationType_PL.create(validProps)
      entity.changeAbbreviation('NEW_ABBR')
      expect(entity.abbreviation).toBe('NEW_ABBR')
    })

    it('should change description', () => {
      const entity = RegulationType_PL.create(validProps)
      entity.changeDescription('New desc')
      expect(entity.description).toBe('New desc')
    })

    describe('Lockable', () => {
      it('should throw on behavior when DELETED', () => {
        const entity = RegulationType_PL.create(validProps)
        entity.delete()

        expect(() => entity.changeCode('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeName('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeAbbreviation('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeDescription('X')).toThrow(EntityDeletedError)
      })
    })
  })
})
