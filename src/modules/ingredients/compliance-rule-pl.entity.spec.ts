import { ComplianceRule_PL } from './compliance-rule-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { EntityDeletedError } from '@shared/errors/entity-state.errors'

describe('ComplianceRule_PL', () => {
  const validProps = {
    code: 'MAX-SUGAR-01',
    category: 'Nutrition',
    ruleType: 'MAXIMUM',
    description: 'Maximum sugar content',
    condition: { field: 'sugar', operator: 'lt', value: 10 },
    severity: 'ERROR',
    regulationId: 'regulation-id',
    nutrientId: 'nutrient-id'
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = ComplianceRule_PL.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.code).toBe('MAX-SUGAR-01')
      expect(entity.category).toBe('Nutrition')
      expect(entity.ruleType).toBe('MAXIMUM')
      expect(entity.description).toBe('Maximum sugar content')
      expect(entity.condition).toEqual({ field: 'sugar', operator: 'lt', value: 10 })
      expect(entity.severity).toBe('ERROR')
      expect(entity.regulationId).toBe('regulation-id')
      expect(entity.nutrientId).toBe('nutrient-id')
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should create with nullable condition and nutrientId', () => {
      const entity = ComplianceRule_PL.create({
        ...validProps,
        condition: null,
        nutrientId: null
      })

      expect(entity.condition).toBeNull()
      expect(entity.nutrientId).toBeNull()
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = ComplianceRule_PL.rehydrate({
        id,
        code: 'MAX-SUGAR-01',
        category: 'Nutrition',
        ruleType: 'MAXIMUM',
        description: 'Max sugar',
        condition: null,
        severity: 'ERROR',
        regulationId: 'reg-id',
        nutrientId: null,
        createdAt: now,
        updatedAt: now,
        systemState: SystemState.ACTIVE
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.code).toBe('MAX-SUGAR-01')
    })
  })

  describe('behaviors', () => {
    it('should change code', () => {
      const entity = ComplianceRule_PL.create(validProps)
      entity.changeCode('NEW_CODE')
      expect(entity.code).toBe('NEW_CODE')
    })

    it('should change category', () => {
      const entity = ComplianceRule_PL.create(validProps)
      entity.changeCategory('New category')
      expect(entity.category).toBe('New category')
    })

    it('should change ruleType', () => {
      const entity = ComplianceRule_PL.create(validProps)
      entity.changeRuleType('MINIMUM')
      expect(entity.ruleType).toBe('MINIMUM')
    })

    it('should change description', () => {
      const entity = ComplianceRule_PL.create(validProps)
      entity.changeDescription('New desc')
      expect(entity.description).toBe('New desc')
    })

    it('should change condition', () => {
      const entity = ComplianceRule_PL.create(validProps)
      entity.changeCondition({ newField: 'value' })
      expect(entity.condition).toEqual({ newField: 'value' })
    })

    it('should change severity', () => {
      const entity = ComplianceRule_PL.create(validProps)
      entity.changeSeverity('WARNING')
      expect(entity.severity).toBe('WARNING')
    })

    it('should change regulationId', () => {
      const entity = ComplianceRule_PL.create(validProps)
      entity.changeRegulationId('new-reg-id')
      expect(entity.regulationId).toBe('new-reg-id')
    })

    it('should change nutrientId', () => {
      const entity = ComplianceRule_PL.create(validProps)
      entity.changeNutrientId('new-nutrient-id')
      expect(entity.nutrientId).toBe('new-nutrient-id')
    })

    describe('Lockable', () => {
      it('should throw on behavior when DELETED', () => {
        const entity = ComplianceRule_PL.create(validProps)
        entity.delete()

        expect(() => entity.changeCode('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeCategory('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeRuleType('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeDescription('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeCondition(null)).toThrow(EntityDeletedError)
        expect(() => entity.changeSeverity('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeRegulationId('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeNutrientId(null)).toThrow(EntityDeletedError)
      })
    })
  })
})
