import { PanelGeometricFormatType_PL } from './panel-geometric-format-type-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { EntityDeletedError } from '@shared/errors/entity-state.errors'

describe('PanelGeometricFormatType_PL', () => {
  const validProps = {
    formatName: 'Rectangle',
    valueFields: { width: 'number', height: 'number' },
    calculationFormula: 'w * h'
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = PanelGeometricFormatType_PL.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.formatName).toBe('Rectangle')
      expect(entity.valueFields).toEqual({ width: 'number', height: 'number' })
      expect(entity.calculationFormula).toBe('w * h')
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should create with nullable fields', () => {
      const entity = PanelGeometricFormatType_PL.create({
        formatName: 'Circle',
        valueFields: null,
        calculationFormula: null
      })

      expect(entity.valueFields).toBeNull()
      expect(entity.calculationFormula).toBeNull()
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = PanelGeometricFormatType_PL.rehydrate({
        id,
        formatName: 'Rectangle',
        valueFields: null,
        calculationFormula: null,
        createdAt: now,
        updatedAt: now,
        systemState: SystemState.ACTIVE
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.formatName).toBe('Rectangle')
    })
  })

  describe('behaviors', () => {
    it('should change formatName', () => {
      const entity = PanelGeometricFormatType_PL.create(validProps)
      entity.changeFormatName('Square')
      expect(entity.formatName).toBe('Square')
    })

    it('should change valueFields', () => {
      const entity = PanelGeometricFormatType_PL.create(validProps)
      entity.changeValueFields({ side: 'number' })
      expect(entity.valueFields).toEqual({ side: 'number' })
    })

    it('should change calculationFormula', () => {
      const entity = PanelGeometricFormatType_PL.create(validProps)
      entity.changeCalculationFormula('side * side')
      expect(entity.calculationFormula).toBe('side * side')
    })

    describe('Lockable', () => {
      it('should throw on behavior when DELETED', () => {
        const entity = PanelGeometricFormatType_PL.create(validProps)
        entity.delete()

        expect(() => entity.changeFormatName('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeValueFields(null)).toThrow(EntityDeletedError)
        expect(() => entity.changeCalculationFormula('X')).toThrow(EntityDeletedError)
      })
    })
  })
})
