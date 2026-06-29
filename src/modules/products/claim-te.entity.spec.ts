import { Claim_TE } from './claim-te.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { EntityDeletedError } from '@shared/errors/entity-state.errors'

describe('Claim_TE', () => {
  const validProps = {
    tenantId: 'tenant-1',
    code: 'ORG-001',
    name: 'Organic',
    description: 'Certified organic product'
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = Claim_TE.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.tenantId).toBe('tenant-1')
      expect(entity.code).toBe('ORG-001')
      expect(entity.name).toBe('Organic')
      expect(entity.description).toBe('Certified organic product')
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should create with nullable description', () => {
      const entity = Claim_TE.create({ ...validProps, description: null })
      expect(entity.description).toBeNull()
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = Claim_TE.rehydrate({
        id,
        tenantId: 'tenant-1',
        code: 'ORG-001',
        name: 'Organic',
        description: null,
        createdAt: now,
        updatedAt: now,
        systemState: SystemState.ACTIVE
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.code).toBe('ORG-001')
    })
  })

  describe('behaviors', () => {
    it('should change code', () => {
      const entity = Claim_TE.create(validProps)
      entity.changeCode('NEW-CODE')
      expect(entity.code).toBe('NEW-CODE')
    })

    it('should change name', () => {
      const entity = Claim_TE.create(validProps)
      entity.changeName('New Name')
      expect(entity.name).toBe('New Name')
    })

    it('should change description', () => {
      const entity = Claim_TE.create(validProps)
      entity.changeDescription('New desc')
      expect(entity.description).toBe('New desc')
    })

    describe('Lockable', () => {
      it('should throw on behavior when DELETED', () => {
        const entity = Claim_TE.create(validProps)
        entity.delete()

        expect(() => entity.changeCode('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeName('X')).toThrow(EntityDeletedError)
        expect(() => entity.changeDescription('X')).toThrow(EntityDeletedError)
      })
    })
  })
})
