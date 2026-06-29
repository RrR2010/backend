import { RegulatoryBody_PL } from './regulatory-body-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { EntityDeletedError } from '@shared/errors/entity-state.errors'

describe('RegulatoryBody_PL', () => {
  const validProps = {
    abbreviation: 'ANVISA',
    code: 'ANVISA-BR',
    name: 'Agência Nacional de Vigilância Sanitária',
    description: 'Brazilian Health Regulatory Agency'
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = RegulatoryBody_PL.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.abbreviation).toBe('ANVISA')
      expect(entity.code).toBe('ANVISA-BR')
      expect(entity.name).toBe('Agência Nacional de Vigilância Sanitária')
      expect(entity.description).toBe('Brazilian Health Regulatory Agency')
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should create with nullable abbreviation and description', () => {
      const entity = RegulatoryBody_PL.create({
        ...validProps,
        abbreviation: null,
        description: null
      })

      expect(entity.abbreviation).toBeNull()
      expect(entity.description).toBeNull()
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = RegulatoryBody_PL.rehydrate({
        id,
        abbreviation: 'ANVISA',
        code: 'ANVISA-BR',
        name: 'ANVISA',
        description: null,
        createdAt: now,
        updatedAt: now,
        systemState: SystemState.ACTIVE
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.code).toBe('ANVISA-BR')
    })
  })

  describe('behaviors', () => {
    it('should change code', () => {
      const entity = RegulatoryBody_PL.create(validProps)
      entity.changeCode('NEW_CODE')
      expect(entity.code).toBe('NEW_CODE')
    })

    it('should change name', () => {
      const entity = RegulatoryBody_PL.create(validProps)
      entity.changeName('New Name')
      expect(entity.name).toBe('New Name')
    })

    it('should change abbreviation', () => {
      const entity = RegulatoryBody_PL.create(validProps)
      entity.changeAbbreviation('NEW_ABBR')
      expect(entity.abbreviation).toBe('NEW_ABBR')
    })

    it('should change abbreviation to null', () => {
      const entity = RegulatoryBody_PL.create(validProps)
      entity.changeAbbreviation(null)
      expect(entity.abbreviation).toBeNull()
    })

    it('should change description', () => {
      const entity = RegulatoryBody_PL.create(validProps)
      entity.changeDescription('New desc')
      expect(entity.description).toBe('New desc')
    })

    describe('Lockable', () => {
      it('should throw on behavior when DELETED', () => {
        const entity = RegulatoryBody_PL.create(validProps)
        entity.delete()

        expect(() => entity.changeCode('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeName('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeAbbreviation('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeDescription('X')).toThrow(EntityDeletedError)
      })
    })
  })
})
