import { Product_TE } from './product.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { EntityDeletedError } from '@shared/errors/entity-state.errors'
import { ProductStatus } from '@prisma/client'

describe('Product_TE', () => {
  const validProps = {
    tenantId: 'tenant-1',
    internalName: 'Chocolate Ice Cream',
    code: 'PROD-001'
  }

  describe('create', () => {
    it('should create with valid required props', () => {
      const entity = Product_TE.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.tenantId).toBe('tenant-1')
      expect(entity.internalName).toBe('Chocolate Ice Cream')
      expect(entity.code).toBe('PROD-001')
      expect(entity.status).toBe(ProductStatus.DRAFT)
      expect(entity.commercialName).toBeNull()
      expect(entity.saleDenomination).toBeNull()
      expect(entity.productType).toBeNull()
      expect(entity.notes).toBeNull()
      expect(entity.barcodeGtin).toBeNull()
      expect(entity.externalCode).toBeNull()
      expect(entity.displayName).toBeNull()
      expect(entity.packagingType).toBeNull()
      expect(entity.batchCode).toBeNull()
      expect(entity.declaredWeight).toBeNull()
      expect(entity.declaredVolume).toBeNull()
      expect(entity.shelfLifeDays).toBeNull()
      expect(entity.storageConditions).toBeNull()
      expect(entity.productFamilyId).toBeNull()
      expect(entity.commercialLineId).toBeNull()
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should create with all optional fields', () => {
      const fullProps = {
        ...validProps,
        externalCode: 'EXT-001',
        displayName: 'Choco Ice Cream',
        status: ProductStatus.ACTIVE,
        commercialName: 'Chocolicious',
        saleDenomination: 'Ice cream with chocolate',
        productType: 'PREMIUM',
        notes: 'Best seller',
        barcodeGtin: '7891234567890',
        packagingType: 'POT',
        batchCode: 'BATCH-001',
        declaredWeight: 500,
        declaredVolume: null,
        shelfLifeDays: 365,
        storageConditions: 'Keep frozen at -18°C',
        productFamilyId: 'family-1',
        commercialLineId: 'line-1'
      }

      const entity = Product_TE.create(fullProps)

      expect(entity.externalCode).toBe('EXT-001')
      expect(entity.displayName).toBe('Choco Ice Cream')
      expect(entity.status).toBe(ProductStatus.ACTIVE)
      expect(entity.commercialName).toBe('Chocolicious')
      expect(entity.saleDenomination).toBe('Ice cream with chocolate')
      expect(entity.productType).toBe('PREMIUM')
      expect(entity.notes).toBe('Best seller')
      expect(entity.barcodeGtin).toBe('7891234567890')
      expect(entity.packagingType).toBe('POT')
      expect(entity.batchCode).toBe('BATCH-001')
      expect(entity.declaredWeight).toBe(500)
      expect(entity.declaredVolume).toBeNull()
      expect(entity.shelfLifeDays).toBe(365)
      expect(entity.storageConditions).toBe('Keep frozen at -18°C')
      expect(entity.productFamilyId).toBe('family-1')
      expect(entity.commercialLineId).toBe('line-1')
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = Product_TE.rehydrate({
        id,
        tenantId: 'tenant-1',
        internalName: 'Chocolate Ice Cream',
        code: 'PROD-001',
        externalCode: null,
        displayName: null,
        status: ProductStatus.DRAFT,
        commercialName: null,
        saleDenomination: null,
        productType: null,
        notes: null,
        barcodeGtin: null,
        packagingType: null,
        batchCode: null,
        declaredWeight: null,
        declaredVolume: null,
        shelfLifeDays: null,
        storageConditions: null,
        productFamilyId: null,
        commercialLineId: null,
        createdAt: now,
        updatedAt: now,
        systemState: SystemState.ACTIVE
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.internalName).toBe('Chocolate Ice Cream')
    })
  })

  describe('behaviors', () => {
    it('should change internalName', () => {
      const entity = Product_TE.create(validProps)
      entity.changeInternalName('New Name')
      expect(entity.internalName).toBe('New Name')
    })

    it('should change code', () => {
      const entity = Product_TE.create(validProps)
      entity.changeCode('NEW-CODE')
      expect(entity.code).toBe('NEW-CODE')
    })

    it('should change externalCode', () => {
      const entity = Product_TE.create(validProps)
      entity.changeExternalCode('EXT-NEW')
      expect(entity.externalCode).toBe('EXT-NEW')
    })

    it('should change displayName', () => {
      const entity = Product_TE.create(validProps)
      entity.changeDisplayName('Display Name')
      expect(entity.displayName).toBe('Display Name')
    })

    it('should change status', () => {
      const entity = Product_TE.create(validProps)
      entity.changeStatus(ProductStatus.ACTIVE)
      expect(entity.status).toBe(ProductStatus.ACTIVE)
    })

    it('should change commercialName', () => {
      const entity = Product_TE.create(validProps)
      entity.changeCommercialName('Commercial Name')
      expect(entity.commercialName).toBe('Commercial Name')
    })

    it('should change saleDenomination', () => {
      const entity = Product_TE.create(validProps)
      entity.changeSaleDenomination('Sale Denom')
      expect(entity.saleDenomination).toBe('Sale Denom')
    })

    it('should change notes', () => {
      const entity = Product_TE.create(validProps)
      entity.changeNotes('Some notes')
      expect(entity.notes).toBe('Some notes')
    })

    it('should change barcodeGtin', () => {
      const entity = Product_TE.create(validProps)
      entity.changeBarcodeGtin('7891234567890')
      expect(entity.barcodeGtin).toBe('7891234567890')
    })

    it('should change packagingType', () => {
      const entity = Product_TE.create(validProps)
      entity.changePackagingType('BOX')
      expect(entity.packagingType).toBe('BOX')
    })

    it('should change batchCode', () => {
      const entity = Product_TE.create(validProps)
      entity.changeBatchCode('B-NEW')
      expect(entity.batchCode).toBe('B-NEW')
    })

    it('should change declaredWeight', () => {
      const entity = Product_TE.create(validProps)
      entity.changeDeclaredWeight(1000)
      expect(entity.declaredWeight).toBe(1000)
    })

    it('should change declaredVolume', () => {
      const entity = Product_TE.create(validProps)
      entity.changeDeclaredVolume(2000)
      expect(entity.declaredVolume).toBe(2000)
    })

    it('should change shelfLifeDays', () => {
      const entity = Product_TE.create(validProps)
      entity.changeShelfLifeDays(180)
      expect(entity.shelfLifeDays).toBe(180)
    })

    it('should change storageConditions', () => {
      const entity = Product_TE.create(validProps)
      entity.changeStorageConditions('Store at 25°C')
      expect(entity.storageConditions).toBe('Store at 25°C')
    })

    it('should change productFamilyId', () => {
      const entity = Product_TE.create(validProps)
      entity.changeProductFamilyId('new-family')
      expect(entity.productFamilyId).toBe('new-family')
    })

    it('should change commercialLineId', () => {
      const entity = Product_TE.create(validProps)
      entity.changeCommercialLineId('new-line')
      expect(entity.commercialLineId).toBe('new-line')
    })

    describe('Lockable', () => {
      it('should throw on behavior when DELETED', () => {
        const entity = Product_TE.create(validProps)
        entity.delete()

        expect(() => entity.changeInternalName('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeCode('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeExternalCode('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeDisplayName('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeStatus(ProductStatus.ACTIVE)).toThrow(EntityDeletedError)
        expect(() => entity.changeCommercialName('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeSaleDenomination('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeNotes('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeBarcodeGtin('X')).toThrow(EntityDeletedError)
        expect(() => entity.changePackagingType('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeBatchCode('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeDeclaredWeight(1)).toThrow(EntityDeletedError)
        expect(() => entity.changeDeclaredVolume(1)).toThrow(EntityDeletedError)
        expect(() => entity.changeShelfLifeDays(1)).toThrow(EntityDeletedError)
        expect(() => entity.changeStorageConditions('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeProductFamilyId('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeCommercialLineId('X')).toThrow(EntityDeletedError)
      })
    })
  })
})
