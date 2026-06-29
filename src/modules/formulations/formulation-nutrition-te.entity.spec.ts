import { FormulationNutrition_TE } from './formulation-nutrition-te.entity'

describe('FormulationNutrition_TE', () => {
  const validProps = {
    tenantId: 'tenant-1',
    formulationRevisionId: 'revision-1',
    nutrientId: 'nutrient-1'
  }

  describe('create', () => {
    it('should create with valid required props', () => {
      const entity = FormulationNutrition_TE.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.tenantId).toBe('tenant-1')
      expect(entity.formulationRevisionId).toBe('revision-1')
      expect(entity.nutrientId).toBe('nutrient-1')
      expect(entity.declaredValue).toBeNull()
      expect(entity.calculatedValue).toBeNull()
      expect(entity.refValue).toBeNull()
      expect(entity.notes).toBeNull()
    })

    it('should create with optional fields', () => {
      const entity = FormulationNutrition_TE.create({
        ...validProps,
        declaredValue: 10.5,
        calculatedValue: 9.8,
        refValue: 10.0,
        notes: 'From lab analysis'
      })

      expect(entity.declaredValue).toBe(10.5)
      expect(entity.calculatedValue).toBe(9.8)
      expect(entity.refValue).toBe(10.0)
      expect(entity.notes).toBe('From lab analysis')
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = FormulationNutrition_TE.rehydrate({
        id,
        tenantId: 'tenant-1',
        formulationRevisionId: 'revision-1',
        nutrientId: 'nutrient-1',
        declaredValue: null,
        calculatedValue: null,
        refValue: null,
        notes: null,
        createdAt: now,
        updatedAt: now
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.nutrientId).toBe('nutrient-1')
    })
  })

  describe('behaviors', () => {
    it('should change declaredValue', () => {
      const entity = FormulationNutrition_TE.create(validProps)
      entity.changeDeclaredValue(15.0)
      expect(entity.declaredValue).toBe(15.0)
    })

    it('should change calculatedValue', () => {
      const entity = FormulationNutrition_TE.create(validProps)
      entity.changeCalculatedValue(14.5)
      expect(entity.calculatedValue).toBe(14.5)
    })

    it('should change refValue', () => {
      const entity = FormulationNutrition_TE.create(validProps)
      entity.changeRefValue(15.0)
      expect(entity.refValue).toBe(15.0)
    })

    it('should change notes', () => {
      const entity = FormulationNutrition_TE.create(validProps)
      entity.changeNotes('Updated')
      expect(entity.notes).toBe('Updated')
    })
  })
})
