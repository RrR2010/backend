import { Regulation_PL } from './regulation-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { EntityDeletedError } from '@shared/errors/entity-state.errors'

describe('Regulation_PL', () => {
  const validProps = {
    number: '1169/2011',
    year: 2011,
    title: 'Food information to consumers',
    publishedAt: new Date('2011-11-22'),
    regulatoryBodyId: 'eu-commission-id',
    regulationTypeId: 'regulation-type-id'
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = Regulation_PL.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.number).toBe('1169/2011')
      expect(entity.year).toBe(2011)
      expect(entity.title).toBe('Food information to consumers')
      expect(entity.publishedAt).toEqual(validProps.publishedAt)
      expect(entity.regulatoryBodyId).toBe('eu-commission-id')
      expect(entity.regulationTypeId).toBe('regulation-type-id')
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should create with nullable fields', () => {
      const entity = Regulation_PL.create({
        ...validProps,
        title: null,
        publishedAt: null
      })

      expect(entity.title).toBeNull()
      expect(entity.publishedAt).toBeNull()
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = Regulation_PL.rehydrate({
        id,
        number: '1169/2011',
        year: 2011,
        title: null,
        publishedAt: null,
        regulatoryBodyId: 'eu-commission',
        regulationTypeId: 'reg-type-id',
        createdAt: now,
        updatedAt: now,
        systemState: SystemState.ACTIVE
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.number).toBe('1169/2011')
    })
  })

  describe('behaviors', () => {
    it('should change number', () => {
      const entity = Regulation_PL.create(validProps)
      entity.changeNumber('NEW/2024')
      expect(entity.number).toBe('NEW/2024')
    })

    it('should change year', () => {
      const entity = Regulation_PL.create(validProps)
      entity.changeYear(2024)
      expect(entity.year).toBe(2024)
    })

    it('should change title', () => {
      const entity = Regulation_PL.create(validProps)
      entity.changeTitle('New title')
      expect(entity.title).toBe('New title')
    })

    it('should change publishedAt', () => {
      const date = new Date('2024-01-01')
      const entity = Regulation_PL.create(validProps)
      entity.changePublishedAt(date)
      expect(entity.publishedAt).toEqual(date)
    })

    it('should change regulatoryBodyId', () => {
      const entity = Regulation_PL.create(validProps)
      entity.changeRegulatoryBodyId('new-body-id')
      expect(entity.regulatoryBodyId).toBe('new-body-id')
    })

    it('should change regulationTypeId', () => {
      const entity = Regulation_PL.create(validProps)
      entity.changeRegulationTypeId('new-type-id')
      expect(entity.regulationTypeId).toBe('new-type-id')
    })

    describe('Lockable', () => {
      it('should throw on behavior when DELETED', () => {
        const entity = Regulation_PL.create(validProps)
        entity.delete()

        expect(() => entity.changeNumber('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeYear(2024)).toThrow(EntityDeletedError)
        expect(() => entity.changeTitle('X')).toThrow(EntityDeletedError)
        expect(() => entity.changePublishedAt(null)).toThrow(EntityDeletedError)
        expect(() => entity.changeRegulatoryBodyId('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeRegulationTypeId('X')).toThrow(EntityDeletedError)
      })
    })
  })
})
