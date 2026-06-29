import { FormulationRegulatoryDeclaration_TE } from './formulation-regulatory-declaration-te.entity'

describe('FormulationRegulatoryDeclaration_TE', () => {
  const validProps = {
    tenantId: 'tenant-1',
    formulationRevisionId: 'revision-1',
    flagId: 'flag-1',
    flagValue: true
  }

  describe('create', () => {
    it('should create with valid required props', () => {
      const entity = FormulationRegulatoryDeclaration_TE.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.tenantId).toBe('tenant-1')
      expect(entity.formulationRevisionId).toBe('revision-1')
      expect(entity.flagId).toBe('flag-1')
      expect(entity.flagValue).toBe(true)
      expect(entity.notes).toBeNull()
    })

    it('should create with optional notes', () => {
      const entity = FormulationRegulatoryDeclaration_TE.create({
        ...validProps,
        notes: 'Declaration notes'
      })

      expect(entity.notes).toBe('Declaration notes')
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = FormulationRegulatoryDeclaration_TE.rehydrate({
        id,
        tenantId: 'tenant-1',
        formulationRevisionId: 'revision-1',
        flagId: 'flag-1',
        flagValue: false,
        notes: null,
        createdAt: now,
        updatedAt: now
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.flagValue).toBe(false)
    })
  })

  describe('behaviors', () => {
    it('should change flagValue', () => {
      const entity = FormulationRegulatoryDeclaration_TE.create(validProps)
      entity.changeFlagValue(false)
      expect(entity.flagValue).toBe(false)
    })

    it('should change notes', () => {
      const entity = FormulationRegulatoryDeclaration_TE.create(validProps)
      entity.changeNotes('Updated notes')
      expect(entity.notes).toBe('Updated notes')
    })
  })
})
