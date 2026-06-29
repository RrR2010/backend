import { ProductClaim_TE } from './product-claim-te.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { EntityDeletedError } from '@shared/errors/entity-state.errors'

describe('ProductClaim_TE', () => {
  const validProps = {
    tenantId: 'tenant-1',
    productId: 'product-1',
    claimId: 'claim-1',
    isActive: true,
    sortOrder: 1
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = ProductClaim_TE.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.tenantId).toBe('tenant-1')
      expect(entity.productId).toBe('product-1')
      expect(entity.claimId).toBe('claim-1')
      expect(entity.isActive).toBe(true)
      expect(entity.sortOrder).toBe(1)
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = ProductClaim_TE.rehydrate({
        id,
        tenantId: 'tenant-1',
        productId: 'product-1',
        claimId: 'claim-1',
        isActive: true,
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
        systemState: SystemState.ACTIVE
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.isActive).toBe(true)
    })
  })

  describe('behaviors', () => {
    it('should change isActive', () => {
      const entity = ProductClaim_TE.create(validProps)
      entity.changeIsActive(false)
      expect(entity.isActive).toBe(false)
    })

    it('should change sortOrder', () => {
      const entity = ProductClaim_TE.create(validProps)
      entity.changeSortOrder(5)
      expect(entity.sortOrder).toBe(5)
    })

    describe('Lockable', () => {
      it('should throw on behavior when DELETED', () => {
        const entity = ProductClaim_TE.create(validProps)
        entity.delete()

        expect(() => entity.changeIsActive(false)).toThrow(EntityDeletedError)
        expect(() => entity.changeSortOrder(2)).toThrow(EntityDeletedError)
      })
    })
  })
})
