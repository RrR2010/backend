import { FormulationAllergen_TE } from './formulation-allergen-te.entity'

describe('FormulationAllergen_TE', () => {
  const validProps = {
    tenantId: 'tenant-1',
    formulationRevisionId: 'revision-1'
  }

  describe('create', () => {
    it('should create with valid required props', () => {
      const entity = FormulationAllergen_TE.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.tenantId).toBe('tenant-1')
      expect(entity.formulationRevisionId).toBe('revision-1')
      expect(entity.allergenDeclaration).toBeNull()
      expect(entity.allergenMayContain).toBeNull()
    })

    it('should create with optional fields', () => {
      const entity = FormulationAllergen_TE.create({
        ...validProps,
        allergenDeclaration: 'Contains milk',
        allergenMayContain: 'May contain traces of nuts'
      })

      expect(entity.allergenDeclaration).toBe('Contains milk')
      expect(entity.allergenMayContain).toBe('May contain traces of nuts')
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = FormulationAllergen_TE.rehydrate({
        id,
        tenantId: 'tenant-1',
        formulationRevisionId: 'revision-1',
        allergenDeclaration: null,
        allergenMayContain: 'May contain',
        createdAt: now,
        updatedAt: now
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.allergenMayContain).toBe('May contain')
    })
  })

  describe('behaviors', () => {
    it('should change allergenDeclaration', () => {
      const entity = FormulationAllergen_TE.create(validProps)
      entity.changeAllergenDeclaration('Contains soy')
      expect(entity.allergenDeclaration).toBe('Contains soy')
    })

    it('should change allergenMayContain', () => {
      const entity = FormulationAllergen_TE.create(validProps)
      entity.changeAllergenMayContain('May contain gluten')
      expect(entity.allergenMayContain).toBe('May contain gluten')
    })
  })
})
