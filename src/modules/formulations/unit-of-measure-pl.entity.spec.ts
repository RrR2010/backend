import { UnitOfMeasure_PL } from './unit-of-measure-pl.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { EntityDeletedError } from '@shared/errors/entity-state.errors'
import { MeasurementType, MeasurementSystem } from '@prisma/client'

describe('UnitOfMeasure_PL', () => {
  const validProps = {
    code: 'KG',
    symbol: 'kg',
    measurementType: MeasurementType.MASS,
    measurementSystem: MeasurementSystem.METRIC
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = UnitOfMeasure_PL.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.code).toBe('KG')
      expect(entity.symbol).toBe('kg')
      expect(entity.measurementType).toBe(MeasurementType.MASS)
      expect(entity.measurementSystem).toBe(MeasurementSystem.METRIC)
      expect(entity.createdBy).toBeNull()
      expect(entity.updatedBy).toBeNull()
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should create with nullable symbol', () => {
      const entity = UnitOfMeasure_PL.create({ ...validProps, symbol: null })
      expect(entity.symbol).toBeNull()
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = UnitOfMeasure_PL.rehydrate({
        id,
        code: 'KG',
        symbol: null,
        measurementType: MeasurementType.MASS,
        measurementSystem: MeasurementSystem.METRIC,
        createdBy: 'user-1',
        updatedBy: null,
        createdAt: now,
        updatedAt: now,
        systemState: SystemState.ACTIVE
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.code).toBe('KG')
    })
  })

  describe('behaviors', () => {
    it('should change code', () => {
      const entity = UnitOfMeasure_PL.create(validProps)
      entity.changeCode('G')
      expect(entity.code).toBe('G')
    })

    it('should change symbol', () => {
      const entity = UnitOfMeasure_PL.create(validProps)
      entity.changeSymbol('KGM')
      expect(entity.symbol).toBe('KGM')
    })

    it('should change measurementType', () => {
      const entity = UnitOfMeasure_PL.create(validProps)
      entity.changeMeasurementType(MeasurementType.VOLUME)
      expect(entity.measurementType).toBe(MeasurementType.VOLUME)
    })

    it('should change measurementSystem', () => {
      const entity = UnitOfMeasure_PL.create(validProps)
      entity.changeMeasurementSystem(MeasurementSystem.IMPERIAL)
      expect(entity.measurementSystem).toBe(MeasurementSystem.IMPERIAL)
    })

    describe('Lockable', () => {
      it('should throw on behavior when DELETED', () => {
        const entity = UnitOfMeasure_PL.create(validProps)
        entity.delete()

        expect(() => entity.changeCode('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeSymbol('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeMeasurementType(MeasurementType.VOLUME)).toThrow(EntityDeletedError)
        expect(() => entity.changeMeasurementSystem(MeasurementSystem.IMPERIAL)).toThrow(EntityDeletedError)
      })
    })
  })
})
