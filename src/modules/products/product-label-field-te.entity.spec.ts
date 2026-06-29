import { ProductLabelField_TE } from './product-label-field-te.entity'

describe('ProductLabelField_TE', () => {
  const validProps = {
    tenantId: 'tenant-1',
    productId: 'product-1',
    labelFieldId: 'label-field-1',
    designerValue: 'Designer Value',
    gerencialValue: 'Gerencial Value'
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = ProductLabelField_TE.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.tenantId).toBe('tenant-1')
      expect(entity.productId).toBe('product-1')
      expect(entity.labelFieldId).toBe('label-field-1')
      expect(entity.designerValue).toBe('Designer Value')
      expect(entity.gerencialValue).toBe('Gerencial Value')
    })

    it('should create with nullable values', () => {
      const entity = ProductLabelField_TE.create({
        ...validProps,
        designerValue: null,
        gerencialValue: null
      })

      expect(entity.designerValue).toBeNull()
      expect(entity.gerencialValue).toBeNull()
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = ProductLabelField_TE.rehydrate({
        id,
        tenantId: 'tenant-1',
        productId: 'product-1',
        labelFieldId: 'label-field-1',
        designerValue: null,
        gerencialValue: null,
        createdAt: now,
        updatedAt: now
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.productId).toBe('product-1')
    })
  })

  describe('behaviors', () => {
    it('should change designerValue', () => {
      const entity = ProductLabelField_TE.create(validProps)
      entity.changeDesignerValue('New Value')
      expect(entity.designerValue).toBe('New Value')
    })

    it('should change gerencialValue', () => {
      const entity = ProductLabelField_TE.create(validProps)
      entity.changeGerencialValue('New Gerencial')
      expect(entity.gerencialValue).toBe('New Gerencial')
    })
  })
})
