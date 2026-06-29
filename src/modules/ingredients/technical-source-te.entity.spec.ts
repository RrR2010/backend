import { TechnicalSource_TE } from './technical-source-te.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { EntityDeletedError, EntityLockedError, EntityNotLockedError } from '@shared/errors/entity-state.errors'

describe('TechnicalSource_TE', () => {
  const baseProps = {
    tenantId: 'tenant-1',
    referenceName: 'Lab Report 2024',
    url: 'https://example.com/report',
    documentRef: 'DOC-001',
    notes: 'Technical source notes',
  }

  describe('create', () => {
    it('should create with sourceTypePlId only', () => {
      const entity = TechnicalSource_TE.create({
        ...baseProps,
        sourceTypePlId: 'pl-type-1',
        sourceTypeTeId: null,
      })

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.tenantId).toBe('tenant-1')
      expect(entity.sourceTypePlId).toBe('pl-type-1')
      expect(entity.sourceTypeTeId).toBeNull()
      expect(entity.referenceName).toBe('Lab Report 2024')
      expect(entity.url).toBe('https://example.com/report')
      expect(entity.documentRef).toBe('DOC-001')
      expect(entity.notes).toBe('Technical source notes')
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should create with sourceTypeTeId only', () => {
      const entity = TechnicalSource_TE.create({
        ...baseProps,
        sourceTypePlId: null,
        sourceTypeTeId: 'te-type-1',
      })

      expect(entity.sourceTypePlId).toBeNull()
      expect(entity.sourceTypeTeId).toBe('te-type-1')
      expect(entity.referenceName).toBe('Lab Report 2024')
    })

    it('should create with nullable fields', () => {
      const entity = TechnicalSource_TE.create({
        tenantId: 'tenant-1',
        sourceTypePlId: 'pl-type-1',
        sourceTypeTeId: null,
        referenceName: 'Minimal Source',
        url: null,
        documentRef: null,
        notes: null,
      })

      expect(entity.url).toBeNull()
      expect(entity.documentRef).toBeNull()
      expect(entity.notes).toBeNull()
      expect(entity.referenceName).toBe('Minimal Source')
    })

    describe('XOR validation', () => {
      it('should throw when both sourceTypePlId and sourceTypeTeId are null', () => {
        expect(() =>
          TechnicalSource_TE.create({
            ...baseProps,
            sourceTypePlId: null,
            sourceTypeTeId: null,
          }),
        ).toThrow(
          'TechnicalSource_TE must have exactly one source type: either sourceTypePlId (platform) or sourceTypeTeId (tenant), not both or neither',
        )
      })

      it('should throw when both sourceTypePlId and sourceTypeTeId are set', () => {
        expect(() =>
          TechnicalSource_TE.create({
            ...baseProps,
            sourceTypePlId: 'pl-type-1',
            sourceTypeTeId: 'te-type-1',
          }),
        ).toThrow(
          'TechnicalSource_TE must have exactly one source type: either sourceTypePlId (platform) or sourceTypeTeId (tenant), not both or neither',
        )
      })
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = TechnicalSource_TE.rehydrate({
        id,
        tenantId: 'tenant-1',
        sourceTypePlId: 'pl-type-1',
        sourceTypeTeId: null,
        referenceName: 'Lab Report 2024',
        url: null,
        documentRef: null,
        notes: null,
        createdAt: now,
        updatedAt: now,
        systemState: SystemState.ACTIVE,
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.sourceTypePlId).toBe('pl-type-1')
      expect(entity.referenceName).toBe('Lab Report 2024')
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })
  })

  describe('behaviors', () => {
    describe('changeSourceType', () => {
      it('should change to a new sourceTypePlId', () => {
        const entity = TechnicalSource_TE.create({
          ...baseProps,
          sourceTypePlId: 'pl-type-1',
          sourceTypeTeId: null,
        })

        entity.changeSourceType('pl-type-2', null)

        expect(entity.sourceTypePlId).toBe('pl-type-2')
        expect(entity.sourceTypeTeId).toBeNull()
      })

      it('should change to a new sourceTypeTeId', () => {
        const entity = TechnicalSource_TE.create({
          ...baseProps,
          sourceTypePlId: null,
          sourceTypeTeId: 'te-type-1',
        })

        entity.changeSourceType(null, 'te-type-2')

        expect(entity.sourceTypePlId).toBeNull()
        expect(entity.sourceTypeTeId).toBe('te-type-2')
      })

      it('should change from Pl to Te', () => {
        const entity = TechnicalSource_TE.create({
          ...baseProps,
          sourceTypePlId: 'pl-type-1',
          sourceTypeTeId: null,
        })

        entity.changeSourceType(null, 'te-type-1')

        expect(entity.sourceTypePlId).toBeNull()
        expect(entity.sourceTypeTeId).toBe('te-type-1')
      })

      it('should throw when changing to both null', () => {
        const entity = TechnicalSource_TE.create({
          ...baseProps,
          sourceTypePlId: 'pl-type-1',
          sourceTypeTeId: null,
        })

        expect(() => entity.changeSourceType(null, null)).toThrow(
          'TechnicalSource_TE must have exactly one source type: either sourceTypePlId (platform) or sourceTypeTeId (tenant), not both or neither',
        )
      })

      it('should throw when changing to both set', () => {
        const entity = TechnicalSource_TE.create({
          ...baseProps,
          sourceTypePlId: null,
          sourceTypeTeId: 'te-type-1',
        })

        expect(() => entity.changeSourceType('pl-type-1', 'te-type-1')).toThrow(
          'TechnicalSource_TE must have exactly one source type: either sourceTypePlId (platform) or sourceTypeTeId (tenant), not both or neither',
        )
      })
    })

    it('should change referenceName', () => {
      const entity = TechnicalSource_TE.create({
        ...baseProps,
        sourceTypePlId: 'pl-type-1',
        sourceTypeTeId: null,
      })

      entity.changeReferenceName('Updated Report')

      expect(entity.referenceName).toBe('Updated Report')
    })

    it('should change url', () => {
      const entity = TechnicalSource_TE.create({
        ...baseProps,
        sourceTypePlId: 'pl-type-1',
        sourceTypeTeId: null,
      })

      entity.changeUrl('https://example.com/updated')

      expect(entity.url).toBe('https://example.com/updated')
    })

    it('should change documentRef', () => {
      const entity = TechnicalSource_TE.create({
        ...baseProps,
        sourceTypePlId: 'pl-type-1',
        sourceTypeTeId: null,
      })

      entity.changeDocumentRef('DOC-002')

      expect(entity.documentRef).toBe('DOC-002')
    })

    it('should change notes', () => {
      const entity = TechnicalSource_TE.create({
        ...baseProps,
        sourceTypePlId: 'pl-type-1',
        sourceTypeTeId: null,
      })

      entity.changeNotes('Updated notes')

      expect(entity.notes).toBe('Updated notes')
    })
  })

  describe('Lockable', () => {
    it('should lock and unlock', () => {
      const entity = TechnicalSource_TE.create({
        ...baseProps,
        sourceTypePlId: 'pl-type-1',
        sourceTypeTeId: null,
      })

      entity.lock()
      expect(entity.systemState).toBe(SystemState.LOCKED)

      entity.unlock()
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should throw EntityNotLockedError on unlock when not locked', () => {
      const entity = TechnicalSource_TE.create({
        ...baseProps,
        sourceTypePlId: 'pl-type-1',
        sourceTypeTeId: null,
      })

      expect(() => entity.unlock()).toThrow(EntityNotLockedError)
    })

    it('should delete entity', () => {
      const entity = TechnicalSource_TE.create({
        ...baseProps,
        sourceTypePlId: 'pl-type-1',
        sourceTypeTeId: null,
      })

      entity.delete()
      expect(entity.systemState).toBe(SystemState.DELETED)
    })

    it('should throw on behaviors when DELETED', () => {
      const entity = TechnicalSource_TE.create({
        ...baseProps,
        sourceTypePlId: 'pl-type-1',
        sourceTypeTeId: null,
      })
      entity.delete()

      expect(() => entity.changeSourceType('pl-2', null)).toThrow(EntityDeletedError)
      expect(() => entity.changeReferenceName('X')).toThrow(EntityDeletedError)
      expect(() => entity.changeUrl('X')).toThrow(EntityDeletedError)
      expect(() => entity.changeDocumentRef('X')).toThrow(EntityDeletedError)
      expect(() => entity.changeNotes('X')).toThrow(EntityDeletedError)
    })

    it('should throw on behaviors when LOCKED', () => {
      const entity = TechnicalSource_TE.create({
        ...baseProps,
        sourceTypePlId: 'pl-type-1',
        sourceTypeTeId: null,
      })
      entity.lock()

      expect(() => entity.changeSourceType('pl-2', null)).toThrow(EntityLockedError)
      expect(() => entity.changeReferenceName('X')).toThrow(EntityLockedError)
      expect(() => entity.changeUrl('X')).toThrow(EntityLockedError)
      expect(() => entity.changeDocumentRef('X')).toThrow(EntityLockedError)
      expect(() => entity.changeNotes('X')).toThrow(EntityLockedError)
    })
  })
})
