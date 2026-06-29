import { ProductPanel_TE } from './product-panel-te.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { EntityDeletedError } from '@shared/errors/entity-state.errors'
import { ProductPanelType } from '@prisma/client'

describe('ProductPanel_TE', () => {
  const validProps = {
    tenantId: 'tenant-1',
    productId: 'product-1',
    panelNumber: 1,
    type: ProductPanelType.NUTRITIONAL,
    geometricFormatTypeId: 'format-1',
    geometricFormatValues: { width: 10, height: 20 }
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = ProductPanel_TE.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.tenantId).toBe('tenant-1')
      expect(entity.productId).toBe('product-1')
      expect(entity.panelNumber).toBe(1)
      expect(entity.type).toBe(ProductPanelType.NUTRITIONAL)
      expect(entity.geometricFormatTypeId).toBe('format-1')
      expect(entity.geometricFormatValues).toEqual({ width: 10, height: 20 })
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should create with nullable fields', () => {
      const entity = ProductPanel_TE.create({
        ...validProps,
        geometricFormatTypeId: null,
        geometricFormatValues: null
      })

      expect(entity.geometricFormatTypeId).toBeNull()
      expect(entity.geometricFormatValues).toBeNull()
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = ProductPanel_TE.rehydrate({
        id,
        tenantId: 'tenant-1',
        productId: 'product-1',
        panelNumber: 1,
        type: ProductPanelType.NUTRITIONAL,
        geometricFormatTypeId: null,
        geometricFormatValues: null,
        createdAt: now,
        updatedAt: now,
        systemState: SystemState.ACTIVE
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.panelNumber).toBe(1)
    })
  })

  describe('behaviors', () => {
    it('should change panelNumber', () => {
      const entity = ProductPanel_TE.create(validProps)
      entity.changePanelNumber(2)
      expect(entity.panelNumber).toBe(2)
    })

    it('should change type', () => {
      const entity = ProductPanel_TE.create(validProps)
      entity.changeType(ProductPanelType.INGREDIENTS)
      expect(entity.type).toBe(ProductPanelType.INGREDIENTS)
    })

    it('should change geometricFormatTypeId', () => {
      const entity = ProductPanel_TE.create(validProps)
      entity.changeGeometricFormatTypeId('new-format')
      expect(entity.geometricFormatTypeId).toBe('new-format')
    })

    it('should change geometricFormatValues', () => {
      const entity = ProductPanel_TE.create(validProps)
      entity.changeGeometricFormatValues({ side: 15 })
      expect(entity.geometricFormatValues).toEqual({ side: 15 })
    })

    describe('Lockable', () => {
      it('should throw on behavior when DELETED', () => {
        const entity = ProductPanel_TE.create(validProps)
        entity.delete()

        expect(() => entity.changePanelNumber(2)).toThrow(EntityDeletedError)
        expect(() => entity.changeType(ProductPanelType.INGREDIENTS)).toThrow(EntityDeletedError)
        expect(() => entity.changeGeometricFormatTypeId('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeGeometricFormatValues(null)).toThrow(EntityDeletedError)
      })
    })
  })
})
