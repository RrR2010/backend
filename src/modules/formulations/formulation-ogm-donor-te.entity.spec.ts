import { FormulationOgmDonor_TE } from './formulation-ogm-donor-te.entity'

describe('FormulationOgmDonor_TE', () => {
  const validProps = {
    tenantId: 'tenant-1',
    formulationRevisionId: 'revision-1',
    ogmDonorSpeciesId: 'species-1'
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = FormulationOgmDonor_TE.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.tenantId).toBe('tenant-1')
      expect(entity.formulationRevisionId).toBe('revision-1')
      expect(entity.ogmDonorSpeciesId).toBe('species-1')
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = FormulationOgmDonor_TE.rehydrate({
        id,
        tenantId: 'tenant-1',
        formulationRevisionId: 'revision-1',
        ogmDonorSpeciesId: 'species-1',
        createdAt: now,
        updatedAt: now
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.ogmDonorSpeciesId).toBe('species-1')
    })
  })

  describe('behaviors', () => {
    it('should change ogmDonorSpeciesId', () => {
      const entity = FormulationOgmDonor_TE.create(validProps)
      entity.changeOgmDonorSpeciesId('new-species')
      expect(entity.ogmDonorSpeciesId).toBe('new-species')
    })
  })
})
