import { FormulationRevision_TE } from './formulation-revision.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { EntityDeletedError, EntityNotLockedError } from '@shared/errors/entity-state.errors'
import { FormulationRevisionStatus } from '@prisma/client'

describe('FormulationRevision_TE', () => {
  const validProps = {
    tenantId: 'tenant-1',
    formulationVersionId: 'version-1',
    revision: 1,
  }

  const createRevision = () => FormulationRevision_TE.create(validProps)

  describe('create', () => {
    it('should create with status DRAFT', () => {
      const entity = createRevision()

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.tenantId).toBe('tenant-1')
      expect(entity.formulationVersionId).toBe('version-1')
      expect(entity.revision).toBe(1)
      expect(entity.notes).toBeNull()
      expect(entity.status).toBe(FormulationRevisionStatus.DRAFT)
      expect(entity.approverId).toBeNull()
      expect(entity.approvedBy).toBeNull()
      expect(entity.approvedAt).toBeNull()
      expect(entity.drift).toBe(false)
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should create with optional notes', () => {
      const entity = FormulationRevision_TE.create({
        ...validProps,
        notes: 'Initial revision',
      })

      expect(entity.notes).toBe('Initial revision')
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()
      const approvedAt = new Date('2024-06-01')

      const entity = FormulationRevision_TE.rehydrate({
        id,
        tenantId: 'tenant-1',
        formulationVersionId: 'version-1',
        revision: 1,
        notes: 'Some notes',
        status: FormulationRevisionStatus.ACTIVE,
        approverId: 'approver-1',
        approvedBy: 'admin@example.com',
        approvedAt,
        drift: false,
        createdAt: now,
        updatedAt: now,
        systemState: SystemState.ACTIVE,
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.status).toBe(FormulationRevisionStatus.ACTIVE)
      expect(entity.approverId).toBe('approver-1')
      expect(entity.approvedBy).toBe('admin@example.com')
      expect(entity.approvedAt).toEqual(approvedAt)
      expect(entity.drift).toBe(false)
    })
  })

  describe('state machine', () => {
    describe('submitForApproval', () => {
      it('should transition DRAFT → PENDING_APPROVAL', () => {
        const entity = createRevision()
        expect(entity.status).toBe(FormulationRevisionStatus.DRAFT)

        entity.submitForApproval()

        expect(entity.status).toBe(FormulationRevisionStatus.PENDING_APPROVAL)
      })

      it('should throw when not in DRAFT', () => {
        const entity = createRevision()
        entity.submitForApproval() // now PENDING_APPROVAL

        expect(() => entity.submitForApproval()).toThrow(
          'Only DRAFT revisions can be submitted for approval',
        )
      })

      it('should throw when in ACTIVE', () => {
        const entity = createRevision()
        entity.submitForApproval()
        entity.approve('approver-1', 'admin@example.com')
        expect(entity.status).toBe(FormulationRevisionStatus.ACTIVE)

        expect(() => entity.submitForApproval()).toThrow(
          'Only DRAFT revisions can be submitted for approval',
        )
      })
    })

    describe('approve', () => {
      it('should transition PENDING_APPROVAL → ACTIVE with metadata', () => {
        const entity = createRevision()
        entity.submitForApproval()
        expect(entity.status).toBe(FormulationRevisionStatus.PENDING_APPROVAL)

        entity.approve('approver-1', 'admin@example.com')

        expect(entity.status).toBe(FormulationRevisionStatus.ACTIVE)
        expect(entity.approverId).toBe('approver-1')
        expect(entity.approvedBy).toBe('admin@example.com')
        expect(entity.approvedAt).toBeDefined()
        expect(entity.approvedAt).toBeInstanceOf(Date)
      })

      it('should throw when in DRAFT', () => {
        const entity = createRevision()
        expect(entity.status).toBe(FormulationRevisionStatus.DRAFT)

        expect(() => entity.approve('approver-1', 'admin@example.com')).toThrow(
          'Only PENDING_APPROVAL revisions can be approved',
        )
      })

      it('should throw when in ACTIVE', () => {
        const entity = createRevision()
        entity.submitForApproval()
        entity.approve('approver-1', 'admin@example.com')
        expect(entity.status).toBe(FormulationRevisionStatus.ACTIVE)

        expect(() => entity.approve('approver-2', 'other@example.com')).toThrow(
          'Only PENDING_APPROVAL revisions can be approved',
        )
      })
    })

    describe('rejectToDraft', () => {
      it('should transition PENDING_APPROVAL → DRAFT', () => {
        const entity = createRevision()
        entity.submitForApproval()
        expect(entity.status).toBe(FormulationRevisionStatus.PENDING_APPROVAL)

        entity.rejectToDraft()

        expect(entity.status).toBe(FormulationRevisionStatus.DRAFT)
      })

      it('should throw when not in PENDING_APPROVAL', () => {
        const entity = createRevision()
        expect(entity.status).toBe(FormulationRevisionStatus.DRAFT)

        expect(() => entity.rejectToDraft()).toThrow(
          'Only PENDING_APPROVAL revisions can be returned to draft',
        )
      })
    })

    describe('archive', () => {
      it('should transition ACTIVE → HISTORIC', () => {
        const entity = createRevision()
        entity.submitForApproval()
        entity.approve('approver-1', 'admin@example.com')
        expect(entity.status).toBe(FormulationRevisionStatus.ACTIVE)

        entity.archive()

        expect(entity.status).toBe(FormulationRevisionStatus.HISTORIC)
      })

      it('should throw when in DRAFT', () => {
        const entity = createRevision()
        expect(entity.status).toBe(FormulationRevisionStatus.DRAFT)

        expect(() => entity.archive()).toThrow(
          'Only ACTIVE revisions can be archived',
        )
      })

      it('should throw when in PENDING_APPROVAL', () => {
        const entity = createRevision()
        entity.submitForApproval()
        expect(entity.status).toBe(FormulationRevisionStatus.PENDING_APPROVAL)

        expect(() => entity.archive()).toThrow(
          'Only ACTIVE revisions can be archived',
        )
      })
    })

    describe('markHistoric', () => {
      it('should be an alias for archive (ACTIVE → HISTORIC)', () => {
        const entity = createRevision()
        entity.submitForApproval()
        entity.approve('approver-1', 'admin@example.com')
        expect(entity.status).toBe(FormulationRevisionStatus.ACTIVE)

        entity.markHistoric()

        expect(entity.status).toBe(FormulationRevisionStatus.HISTORIC)
      })

      it('should throw like archive when in DRAFT', () => {
        const entity = createRevision()

        expect(() => entity.markHistoric()).toThrow(
          'Only ACTIVE revisions can be archived',
        )
      })
    })
  })

  describe('behaviors', () => {
    it('should change notes', () => {
      const entity = createRevision()
      entity.changeNotes('Updated notes')
      expect(entity.notes).toBe('Updated notes')
    })
  })

  describe('Lockable', () => {
    it('should lock and unlock', () => {
      const entity = createRevision()
      entity.lock()
      expect(entity.systemState).toBe(SystemState.LOCKED)

      entity.unlock()
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should throw EntityNotLockedError on unlock when not locked', () => {
      const entity = createRevision()
      expect(() => entity.unlock()).toThrow(EntityNotLockedError)
    })

    it('should delete entity', () => {
      const entity = createRevision()
      entity.delete()
      expect(entity.systemState).toBe(SystemState.DELETED)
    })

    it('should throw on behaviors when DELETED', () => {
      const entity = createRevision()
      entity.delete()

      expect(() => entity.changeNotes('X')).toThrow(EntityDeletedError)
      expect(() => entity.submitForApproval()).toThrow(EntityDeletedError)
      expect(() => entity.approve('a', 'b')).toThrow(EntityDeletedError)
      expect(() => entity.rejectToDraft()).toThrow(EntityDeletedError)
      expect(() => entity.archive()).toThrow(EntityDeletedError)
      expect(() => entity.markHistoric()).toThrow(EntityDeletedError)
    })
  })
})
