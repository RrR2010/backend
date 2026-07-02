import { InternalServerErrorException } from '@nestjs/common'
import { FormulationService } from './formulation.service'
import { FormulationVersion_TE } from './formulation-version.entity'
import { FormulationRevision_TE } from './formulation-revision.entity'
import { FormulationItem_TE } from './formulation-item.entity'
import {
  FormulationVersion_TENotFoundError,
  FormulationRevision_TENotFoundError,
  FormulationItem_TENotFoundError,
} from './formulation.errors'
import { FormulationRevisionStatus } from '@prisma/client'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'

describe('FormulationService', () => {
  let service: FormulationService
  let versionRepo: any
  let revisionRepo: any
  let itemRepo: any

  const tenantCtx = {
    userId: 'user-1',
    scope: 'TENANT' as any,
    tenantId: 'tenant-1',
    roles: ['ADMIN'],
  }

  const platformCtx = {
    userId: 'admin',
    scope: 'PLATFORM' as any,
    roles: ['ADMIN'],
    impersonatedTenantId: null,
  }

  // --------------- Fixtures ---------------

  function createVersionFixture(overrides: Record<string, any> = {}): FormulationVersion_TE {
    return FormulationVersion_TE.create({
      tenantId: 'tenant-1',
      productId: 'product-1',
      version: 1,
      ...overrides,
    })
  }

  function createRevisionFixture(
    status: FormulationRevisionStatus = FormulationRevisionStatus.DRAFT,
    overrides: Record<string, any> = {},
  ): FormulationRevision_TE {
    if (status !== FormulationRevisionStatus.DRAFT) {
      // For non-DRAFT states, create via DRAFT then advance
      const draft = FormulationRevision_TE.create({
        formulationVersionId: 'version-1',
        revision: 1,
        tenantId: 'tenant-1',
        ...overrides,
      })
      // Use rehydrate to set the desired status directly
      const now = new Date()
      return FormulationRevision_TE.rehydrate({
        id: draft.id,
        formulationVersionId: draft.formulationVersionId,
        revision: draft.revision,
        notes: draft.notes,
        status,
        tenantId: draft.tenantId,
        approverId: status === FormulationRevisionStatus.ACTIVE ? 'approver-1' : null,
        approvedBy: status === FormulationRevisionStatus.ACTIVE ? 'approved-by-1' : null,
        approvedAt: status === FormulationRevisionStatus.ACTIVE ? new Date() : null,
        drift: false,
        systemState: SystemState.ACTIVE,
        createdAt: now,
        updatedAt: now,
        ...overrides,
      })
    }
    return FormulationRevision_TE.create({
      formulationVersionId: 'version-1',
      revision: 1,
      tenantId: 'tenant-1',
      ...overrides,
    })
  }

  function createItemFixture(overrides: Record<string, any> = {}): FormulationItem_TE {
    return FormulationItem_TE.create({
      formulationRevisionId: 'revision-1',
      ingredientId: 'ingredient-1',
      quantity: 10,
      unitId: 'unit-1',
      tenantId: 'tenant-1',
      ...overrides,
    })
  }

  beforeEach(() => {
    versionRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByProductId: jest.fn(),
      delete: jest.fn(),
    }
    revisionRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByVersionId: jest.fn(),
      delete: jest.fn(),
    }
    itemRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByRevisionId: jest.fn(),
      delete: jest.fn(),
    }
    service = new FormulationService(versionRepo, revisionRepo, itemRepo)
  })

  // =============== VERSIONS ===============

  describe('createVersion', () => {
    it('should create version with tenantId from ctx', async () => {
      const saved = createVersionFixture()
      versionRepo.save.mockResolvedValue(saved)

      const result = await service.createVersion(
        { productId: 'product-1', version: 1 },
        tenantCtx,
      )

      expect(result.tenantId).toBe('tenant-1')
      expect(versionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _props: expect.objectContaining({ tenantId: 'tenant-1' }),
        }),
        tenantCtx,
      )
    })

    it('should throw InternalServerErrorException when ctx has no tenantId', async () => {
      await expect(
        service.createVersion(
          { productId: 'product-1', version: 1 },
          platformCtx,
        ),
      ).rejects.toThrow(InternalServerErrorException)
    })
  })

  describe('findVersionById', () => {
    it('should return version when found', async () => {
      const version = createVersionFixture()
      versionRepo.findById.mockResolvedValue(version)

      const result = await service.findVersionById(version.id.value, tenantCtx)

      expect(versionRepo.findById).toHaveBeenCalledWith(version.id.value, tenantCtx)
      expect(result).toBe(version)
    })

    it('should throw FormulationVersion_TENotFoundError when not found', async () => {
      versionRepo.findById.mockResolvedValue(null)

      await expect(
        service.findVersionById('nonexistent', tenantCtx),
      ).rejects.toThrow(FormulationVersion_TENotFoundError)
    })
  })

  describe('findAllVersions', () => {
    it('should return list of versions with default pagination', async () => {
      const list = [createVersionFixture()]
      versionRepo.findAll.mockResolvedValue(list)

      const result = await service.findAllVersions(tenantCtx)

      expect(versionRepo.findAll).toHaveBeenCalledWith(tenantCtx, 0, 100)
      expect(result).toHaveLength(1)
    })

    it('should pass skip/take to repo', async () => {
      versionRepo.findAll.mockResolvedValue([])

      await service.findAllVersions(tenantCtx, 10, 20)

      expect(versionRepo.findAll).toHaveBeenCalledWith(tenantCtx, 10, 20)
    })
  })

  describe('findVersionsByProduct', () => {
    it('should delegate to repo.findByProductId', async () => {
      const list = [createVersionFixture()]
      versionRepo.findByProductId.mockResolvedValue(list)

      const result = await service.findVersionsByProduct('product-1', tenantCtx)

      expect(versionRepo.findByProductId).toHaveBeenCalledWith('product-1', tenantCtx)
      expect(result).toHaveLength(1)
    })
  })

  describe('deleteVersion', () => {
    it('should find version and call repo.delete', async () => {
      const version = createVersionFixture()
      versionRepo.findById.mockResolvedValue(version)
      versionRepo.delete.mockResolvedValue(undefined)

      await service.deleteVersion(version.id.value, tenantCtx)

      expect(versionRepo.findById).toHaveBeenCalledWith(version.id.value, tenantCtx)
      expect(versionRepo.delete).toHaveBeenCalledWith(version.id.value, tenantCtx)
    })

    it('should throw FormulationVersion_TENotFoundError when not found', async () => {
      versionRepo.findById.mockResolvedValue(null)

      await expect(
        service.deleteVersion('nonexistent', tenantCtx),
      ).rejects.toThrow(FormulationVersion_TENotFoundError)
    })
  })

  // =============== REVISIONS ===============

  describe('createRevision', () => {
    it('should create revision as DRAFT with tenantId', async () => {
      const saved = createRevisionFixture(FormulationRevisionStatus.DRAFT)
      revisionRepo.save.mockResolvedValue(saved)

      const result = await service.createRevision(
        { formulationVersionId: 'version-1', revision: 1 },
        tenantCtx,
      )

      expect(result.status).toBe(FormulationRevisionStatus.DRAFT)
      expect(revisionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _props: expect.objectContaining({ status: FormulationRevisionStatus.DRAFT }),
        }),
        tenantCtx,
      )
    })
  })

  describe('findRevisionById', () => {
    it('should return revision when found', async () => {
      const revision = createRevisionFixture()
      revisionRepo.findById.mockResolvedValue(revision)

      const result = await service.findRevisionById(revision.id.value, tenantCtx)

      expect(revisionRepo.findById).toHaveBeenCalledWith(revision.id.value, tenantCtx)
      expect(result).toBe(revision)
    })

    it('should throw FormulationRevision_TENotFoundError when not found', async () => {
      revisionRepo.findById.mockResolvedValue(null)

      await expect(
        service.findRevisionById('nonexistent', tenantCtx),
      ).rejects.toThrow(FormulationRevision_TENotFoundError)
    })
  })

  describe('findRevisionsByVersion', () => {
    it('should delegate to repo.findByVersionId', async () => {
      const list = [createRevisionFixture()]
      revisionRepo.findByVersionId.mockResolvedValue(list)

      const result = await service.findRevisionsByVersion('version-1', tenantCtx)

      expect(revisionRepo.findByVersionId).toHaveBeenCalledWith('version-1', tenantCtx)
      expect(result).toHaveLength(1)
    })
  })

  // =============== REVISION LIFECYCLE ===============

  describe('submitRevision', () => {
    it('should transition DRAFT to PENDING_APPROVAL', async () => {
      const draft = createRevisionFixture(FormulationRevisionStatus.DRAFT)
      revisionRepo.findById.mockResolvedValue(draft)
      revisionRepo.save.mockImplementation((entity: any) => Promise.resolve(entity))

      const result = await service.submitRevision(draft.id.value, tenantCtx)

      expect(revisionRepo.findById).toHaveBeenCalledWith(draft.id.value, tenantCtx)
      expect(revisionRepo.save).toHaveBeenCalled()
      expect(result.status).toBe(FormulationRevisionStatus.PENDING_APPROVAL)
    })

    it('should throw error when revision is not DRAFT', async () => {
      const pending = createRevisionFixture(FormulationRevisionStatus.PENDING_APPROVAL)
      revisionRepo.findById.mockResolvedValue(pending)

      await expect(service.submitRevision(pending.id.value, tenantCtx)).rejects.toThrow(
        'Only DRAFT revisions can be submitted for approval',
      )
    })
  })

  describe('approveRevision', () => {
    it('should transition PENDING_APPROVAL to ACTIVE with approver info', async () => {
      const pending = createRevisionFixture(FormulationRevisionStatus.PENDING_APPROVAL)
      revisionRepo.findById.mockResolvedValue(pending)
      revisionRepo.save.mockImplementation((entity: any) => Promise.resolve(entity))

      const result = await service.approveRevision(
        pending.id.value,
        'approver-1',
        'approved-by-1',
        tenantCtx,
      )

      expect(revisionRepo.findById).toHaveBeenCalledWith(pending.id.value, tenantCtx)
      expect(revisionRepo.save).toHaveBeenCalled()
      expect(result.status).toBe(FormulationRevisionStatus.ACTIVE)
    })

    it('should throw error when revision is not PENDING_APPROVAL', async () => {
      const draft = createRevisionFixture(FormulationRevisionStatus.DRAFT)
      revisionRepo.findById.mockResolvedValue(draft)

      await expect(
        service.approveRevision(draft.id.value, 'approver-1', 'approved-by-1', tenantCtx),
      ).rejects.toThrow('Only PENDING_APPROVAL revisions can be approved')
    })
  })

  describe('rejectRevision', () => {
    it('should transition PENDING_APPROVAL back to DRAFT', async () => {
      const pending = createRevisionFixture(FormulationRevisionStatus.PENDING_APPROVAL)
      revisionRepo.findById.mockResolvedValue(pending)
      revisionRepo.save.mockImplementation((entity: any) => Promise.resolve(entity))

      const result = await service.rejectRevision(pending.id.value, tenantCtx)

      expect(revisionRepo.findById).toHaveBeenCalledWith(pending.id.value, tenantCtx)
      expect(revisionRepo.save).toHaveBeenCalled()
      expect(result.status).toBe(FormulationRevisionStatus.DRAFT)
    })

    it('should throw error when revision is not PENDING_APPROVAL', async () => {
      const active = createRevisionFixture(FormulationRevisionStatus.ACTIVE)
      revisionRepo.findById.mockResolvedValue(active)

      await expect(
        service.rejectRevision(active.id.value, tenantCtx),
      ).rejects.toThrow('Only PENDING_APPROVAL revisions can be returned to draft')
    })
  })

  describe('archiveRevision', () => {
    it('should transition ACTIVE to HISTORIC', async () => {
      const active = createRevisionFixture(FormulationRevisionStatus.ACTIVE)
      revisionRepo.findById.mockResolvedValue(active)
      revisionRepo.save.mockImplementation((entity: any) => Promise.resolve(entity))

      const result = await service.archiveRevision(active.id.value, tenantCtx)

      expect(revisionRepo.findById).toHaveBeenCalledWith(active.id.value, tenantCtx)
      expect(revisionRepo.save).toHaveBeenCalled()
      expect(result.status).toBe(FormulationRevisionStatus.HISTORIC)
    })

    it('should throw error when revision is not ACTIVE', async () => {
      const draft = createRevisionFixture(FormulationRevisionStatus.DRAFT)
      revisionRepo.findById.mockResolvedValue(draft)

      await expect(
        service.archiveRevision(draft.id.value, tenantCtx),
      ).rejects.toThrow('Only ACTIVE revisions can be archived')
    })
  })

  // =============== ITEMS ===============

  describe('createItem', () => {
    it('should create item with tenantId', async () => {
      const saved = createItemFixture()
      itemRepo.save.mockResolvedValue(saved)

      const result = await service.createItem(
        {
          formulationRevisionId: 'revision-1',
          ingredientId: 'ingredient-1',
          quantity: 10,
          unitId: 'unit-1',
        },
        tenantCtx,
      )

      expect(result.tenantId).toBe('tenant-1')
      expect(itemRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _props: expect.objectContaining({ tenantId: 'tenant-1' }),
        }),
        tenantCtx,
      )
    })
  })

  describe('findItemsByRevision', () => {
    it('should delegate to repo.findByRevisionId', async () => {
      const list = [createItemFixture()]
      itemRepo.findByRevisionId.mockResolvedValue(list)

      const result = await service.findItemsByRevision('revision-1', tenantCtx)

      expect(itemRepo.findByRevisionId).toHaveBeenCalledWith('revision-1', tenantCtx)
      expect(result).toHaveLength(1)
    })
  })

  describe('findItemById', () => {
    it('should return item when found', async () => {
      const item = createItemFixture()
      itemRepo.findById.mockResolvedValue(item)

      const result = await service.findItemById(item.id.value, tenantCtx)

      expect(itemRepo.findById).toHaveBeenCalledWith(item.id.value, tenantCtx)
      expect(result).toBe(item)
    })

    it('should throw FormulationItem_TENotFoundError when not found', async () => {
      itemRepo.findById.mockResolvedValue(null)

      await expect(
        service.findItemById('nonexistent', tenantCtx),
      ).rejects.toThrow(FormulationItem_TENotFoundError)
    })
  })

  describe('deleteItem', () => {
    it('should find item and call repo.delete', async () => {
      const item = createItemFixture()
      itemRepo.findById.mockResolvedValue(item)
      itemRepo.delete.mockResolvedValue(undefined)

      await service.deleteItem(item.id.value, tenantCtx)

      expect(itemRepo.findById).toHaveBeenCalledWith(item.id.value, tenantCtx)
      expect(itemRepo.delete).toHaveBeenCalledWith(item.id.value, tenantCtx)
    })

    it('should throw FormulationItem_TENotFoundError when not found', async () => {
      itemRepo.findById.mockResolvedValue(null)

      await expect(
        service.deleteItem('nonexistent', tenantCtx),
      ).rejects.toThrow(FormulationItem_TENotFoundError)
    })
  })
})
