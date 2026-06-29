import { OgmDonorSpecies_PL } from './ogm-donor-species-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { EntityDeletedError } from '@shared/errors/entity-state.errors'

describe('OgmDonorSpecies_PL', () => {
  const validProps = {
    scientificName: 'Zea mays',
    commonName: 'Maize',
    category: 'Cereal'
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = OgmDonorSpecies_PL.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.scientificName).toBe('Zea mays')
      expect(entity.commonName).toBe('Maize')
      expect(entity.category).toBe('Cereal')
      expect(entity.createdBy).toBeNull()
      expect(entity.updatedBy).toBeNull()
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should create with nullable fields', () => {
      const entity = OgmDonorSpecies_PL.create({
        scientificName: 'Glycine max',
        commonName: null,
        category: null
      })

      expect(entity.commonName).toBeNull()
      expect(entity.category).toBeNull()
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = OgmDonorSpecies_PL.rehydrate({
        id,
        scientificName: 'Zea mays',
        commonName: 'Maize',
        category: 'Cereal',
        createdBy: null,
        updatedBy: 'user-1',
        createdAt: now,
        updatedAt: now,
        systemState: SystemState.ACTIVE
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.scientificName).toBe('Zea mays')
    })
  })

  describe('behaviors', () => {
    it('should change scientificName', () => {
      const entity = OgmDonorSpecies_PL.create(validProps)
      entity.changeScientificName('New species')
      expect(entity.scientificName).toBe('New species')
    })

    it('should change commonName', () => {
      const entity = OgmDonorSpecies_PL.create(validProps)
      entity.changeCommonName('New common')
      expect(entity.commonName).toBe('New common')
    })

    it('should change commonName to null', () => {
      const entity = OgmDonorSpecies_PL.create(validProps)
      entity.changeCommonName(null)
      expect(entity.commonName).toBeNull()
    })

    it('should change category', () => {
      const entity = OgmDonorSpecies_PL.create(validProps)
      entity.changeCategory('New category')
      expect(entity.category).toBe('New category')
    })

    describe('Lockable', () => {
      it('should throw on behavior when DELETED', () => {
        const entity = OgmDonorSpecies_PL.create(validProps)
        entity.delete()

        expect(() => entity.changeScientificName('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeCommonName('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeCategory('X')).toThrow(EntityDeletedError)
      })
    })
  })
})
