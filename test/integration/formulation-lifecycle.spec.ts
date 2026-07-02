/**
 * T-092b: Formulation lifecycle
 *
 * Integration test: Controller → Service → Repository (mocked PrismaService)
 *
 * Scenarios:
 * 1. Create FormulationVersion_TE
 * 2. Create FormulationRevision_TE (DRAFT)
 * 3. submitRevision → PENDING_APPROVAL
 * 4. approveRevision → ACTIVE
 * 5. archiveRevision → HISTORIC
 *
 * Notes:
 * - The revision repository uses hop-based tenant filtering: findById calls
 *   this.prisma.formulationRevision_TE.findFirst (not findUnique) with a relation
 *   filter on formulationVersion_TE.tenantId.
 * - The revision repository save does a tenant check by looking up the parent version.
 */

import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '@shared/prisma/prisma.service'
import { FormulationsController } from '@formulations/formulation.controller'
import { FormulationService } from '@formulations/formulation.service'
import {
  FormulationVersion_TE_Repository,
  PrismaFormulationVersion_TE_Repository,
  FormulationRevision_TE_Repository,
  PrismaFormulationRevision_TE_Repository,
  FormulationItem_TE_Repository,
  PrismaFormulationItem_TE_Repository,
} from '@formulations/formulation.repository'
import { FormulationRevisionStatus } from '@prisma/client'
import { createTenantContext } from '../../src/test-utils'

describe('T-092b: Formulation lifecycle', () => {
  let controller: FormulationsController
  let prismaMock: {
    formulationVersion_TE: {
      findUnique: jest.Mock
      findMany: jest.Mock
      upsert: jest.Mock
    }
    formulationRevision_TE: {
      findFirst: jest.Mock
      findMany: jest.Mock
      upsert: jest.Mock
    }
    formulationItem_TE: {
      findUnique: jest.Mock
      findMany: jest.Mock
      upsert: jest.Mock
    }
  }

  const tenantCtx = createTenantContext()
  const mockRequest = { context: tenantCtx } as any

  // Factory for Prisma-shaped version records
  const makePrismaVersion = (overrides: Record<string, any> = {}) => ({
    id: '00000000-0000-4000-a000-000000000001',
    tenantId: tenantCtx.tenantId,
    productId: 'product-1',
    version: 1,
    notes: null,
    systemState: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  })

  // Factory for Prisma-shaped revision records
  const makePrismaRevision = (overrides: Record<string, any> = {}) => ({
    id: '00000000-0000-4000-a000-000000000010',
    formulationVersionId: '00000000-0000-4000-a000-000000000001',
    revision: 1,
    status: FormulationRevisionStatus.DRAFT,
    tenantId: tenantCtx.tenantId,
    notes: null,
    approverId: null,
    approvedBy: null,
    approvedAt: null,
    drift: false,
    systemState: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  })

  beforeEach(async () => {
    const versionStub = makePrismaVersion()

    prismaMock = {
      formulationVersion_TE: {
        // The revision repo's save() looks up the parent version via findUnique
        findUnique: jest.fn().mockResolvedValue(versionStub),
        findMany: jest.fn(),
        upsert: jest.fn().mockImplementation((args: any) =>
          Promise.resolve({ id: args.where.id, ...args.create }),
        ),
      },
      formulationRevision_TE: {
        // The revision repo's findById() uses findFirst (hop-based tenant filter)
        findFirst: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn().mockImplementation((args: any) =>
          Promise.resolve({ id: args.where.id, ...args.create }),
        ),
      },
      formulationItem_TE: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormulationsController],
      providers: [
        FormulationService,
        PrismaFormulationVersion_TE_Repository,
        {
          provide: FormulationVersion_TE_Repository,
          useExisting: PrismaFormulationVersion_TE_Repository,
        },
        PrismaFormulationRevision_TE_Repository,
        {
          provide: FormulationRevision_TE_Repository,
          useExisting: PrismaFormulationRevision_TE_Repository,
        },
        PrismaFormulationItem_TE_Repository,
        {
          provide: FormulationItem_TE_Repository,
          useExisting: PrismaFormulationItem_TE_Repository,
        },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile()

    controller = module.get(FormulationsController)
  })

  // ---------------------------------------------------------------
  // 1. Create Version
  // ---------------------------------------------------------------
  it('should create a FormulationVersion_TE', async () => {
    // Act
    const result = await controller.createVersion(
      { productId: 'product-1', version: 1 },
      mockRequest,
    )

    // Assert — response
    expect(result).toBeDefined()
    expect(result.productId).toBe('product-1')
    expect(result.version).toBe(1)
    expect(result.tenantId).toBe(tenantCtx.tenantId)

    // Assert — Prisma
    expect(prismaMock.formulationVersion_TE.upsert).toHaveBeenCalledTimes(1)
    const upsertCall = prismaMock.formulationVersion_TE.upsert.mock.calls[0][0]
    expect(upsertCall.create).toMatchObject({
      productId: 'product-1',
      version: 1,
      tenantId: tenantCtx.tenantId,
    })
  })

  // ---------------------------------------------------------------
  // 2. Create Revision (DRAFT)
  // ---------------------------------------------------------------
  it('should create a FormulationRevision_TE as DRAFT', async () => {
    // Arrange — first create a version so we have a reference
    const version = await controller.createVersion(
      { productId: 'product-1', version: 1 },
      mockRequest,
    )

    // Act
    const result = await controller.createRevision(
      { formulationVersionId: version.id, revision: 1 },
      mockRequest,
    )

    // Assert — response
    expect(result).toBeDefined()
    expect(result.formulationVersionId).toBe(version.id)
    expect(result.revision).toBe(1)
    expect(result.status).toBe(FormulationRevisionStatus.DRAFT)
    expect(result.tenantId).toBe(tenantCtx.tenantId)

    // Assert — Prisma
    const revisionUpsert =
      prismaMock.formulationRevision_TE.upsert.mock.calls[0][0]
    expect(revisionUpsert.create).toMatchObject({
      formulationVersionId: version.id,
      revision: 1,
      status: FormulationRevisionStatus.DRAFT,
      tenantId: tenantCtx.tenantId,
    })
  })

  // ---------------------------------------------------------------
  // 3. submitRevision → PENDING_APPROVAL
  // ---------------------------------------------------------------
  it('should submit DRAFT revision to PENDING_APPROVAL', async () => {
    // Arrange — create version + revision as DRAFT
    const version = await controller.createVersion(
      { productId: 'product-1', version: 1 },
      mockRequest,
    )
    const revision = await controller.createRevision(
      { formulationVersionId: version.id, revision: 1 },
      mockRequest,
    )

    // Mock findFirst (called by revisionRepo.findById) to return a DRAFT revision
    prismaMock.formulationRevision_TE.findFirst.mockResolvedValue(
      makePrismaRevision({
        id: revision.id,
        formulationVersionId: version.id,
        status: FormulationRevisionStatus.DRAFT,
      }),
    )

    // Act
    const submitted = await controller.submitRevision(revision.id, mockRequest)

    // Assert
    expect(submitted.status).toBe(FormulationRevisionStatus.PENDING_APPROVAL)

    // Verify Prisma upsert (call 0 = create, call 1 = submit) was called with updated status
    const submitCall = prismaMock.formulationRevision_TE.upsert.mock.calls[1]
    expect(submitCall[0].create.status).toBe(
      FormulationRevisionStatus.PENDING_APPROVAL,
    )
  })

  // ---------------------------------------------------------------
  // 4. approveRevision → ACTIVE
  // ---------------------------------------------------------------
  it('should approve PENDING_APPROVAL revision to ACTIVE', async () => {
    // Arrange — create version + revision
    const version = await controller.createVersion(
      { productId: 'product-1', version: 1 },
      mockRequest,
    )
    const revision = await controller.createRevision(
      { formulationVersionId: version.id, revision: 1 },
      mockRequest,
    )

    // Mock findFirst (called by revisionRepo.findById) to return PENDING_APPROVAL
    prismaMock.formulationRevision_TE.findFirst.mockResolvedValue(
      makePrismaRevision({
        id: revision.id,
        formulationVersionId: version.id,
        status: FormulationRevisionStatus.PENDING_APPROVAL,
      }),
    )

    // Act
    const approved = await controller.approveRevision(
      revision.id,
      { approverId: 'approver-1', approvedBy: 'admin@viver.com' },
      mockRequest,
    )

    // Assert
    expect(approved.status).toBe(FormulationRevisionStatus.ACTIVE)
    expect(approved.approverId).toBe('approver-1')
    expect(approved.approvedBy).toBe('admin@viver.com')
    expect(approved.approvedAt).toBeDefined()

    // Verify persistence (call 1 = approve save)
    const approveCall = prismaMock.formulationRevision_TE.upsert.mock.calls[1]
    expect(approveCall[0].create.status).toBe(FormulationRevisionStatus.ACTIVE)
    expect(approveCall[0].create.approverId).toBe('approver-1')
  })

  // ---------------------------------------------------------------
  // 5. archiveRevision → HISTORIC
  // ---------------------------------------------------------------
  it('should archive ACTIVE revision to HISTORIC', async () => {
    // Arrange — create version + revision
    const version = await controller.createVersion(
      { productId: 'product-1', version: 1 },
      mockRequest,
    )
    const revision = await controller.createRevision(
      { formulationVersionId: version.id, revision: 1 },
      mockRequest,
    )

    // Mock findFirst (called by revisionRepo.findById) to return ACTIVE
    prismaMock.formulationRevision_TE.findFirst.mockResolvedValue(
      makePrismaRevision({
        id: revision.id,
        formulationVersionId: version.id,
        status: FormulationRevisionStatus.ACTIVE,
        approverId: 'approver-1',
        approvedBy: 'admin@viver.com',
        approvedAt: new Date(),
      }),
    )

    // Act
    const archived = await controller.archiveRevision(revision.id, mockRequest)

    // Assert
    expect(archived.status).toBe(FormulationRevisionStatus.HISTORIC)

    // Verify persistence
    const archiveCall = prismaMock.formulationRevision_TE.upsert.mock.calls[1]
    expect(archiveCall[0].create.status).toBe(FormulationRevisionStatus.HISTORIC)
  })
})
