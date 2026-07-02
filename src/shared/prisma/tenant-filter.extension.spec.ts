/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { createTenantFilterExtension } from './tenant-filter.extension'
import { ClsContextService } from '@shared/cls/cls-context.service'
import { TENANT_SCOPED_MODELS } from './tenant-scoped-models.config'

describe('createTenantFilterExtension', () => {
  let clsContextService: jest.Mocked<ClsContextService>

  const TENANT_CTX = {
    scope: 'TENANT' as const,
    tenantId: 'tid-a',
    userId: 'u1',
    roles: []
  }

  const PLATFORM_NO_IMPERSONATION = {
    scope: 'PLATFORM' as const,
    impersonatedTenantId: null,
    userId: 'u1',
    roles: []
  }

  beforeEach(() => {
    clsContextService = {
      getRequestContext: jest.fn()
    } as any
  })

  /**
   * Creates a mock Prisma client that simulates $extends behavior.
   *
   * The mock has two layers:
   *   1. originalMockFns — plain jest.fn() for each model operation
   *   2. mockPrisma.$extends(config) — returns a wrapped client that
   *      intercepts model methods through the extension's $allOperations handler
   *
   * When findUnique → findFirst redirect happens, the extension accesses
   * the outer (original) mock prisma, so we can assert on originalMockFns.
   */
  function createMockPrisma() {
    const originalMockFns: Record<string, Record<string, jest.Mock>> = {}

    // Create mocks for all tenant-scoped models
    for (const modelName of TENANT_SCOPED_MODELS) {
      const modelKey = modelName.charAt(0).toLowerCase() + modelName.slice(1)
      originalMockFns[modelKey] = {}

      const operations = [
        'findMany',
        'findFirst',
        'findUnique',
        'findUniqueOrThrow',
        'findFirstOrThrow',
        'create',
        'createMany',
        'update',
        'updateMany',
        'delete',
        'deleteMany',
        'upsert',
        'count',
        'aggregate',
        'groupBy'
      ]

      for (const op of operations) {
        originalMockFns[modelKey][op] = jest.fn().mockResolvedValue([])
      }
    }

    // Platform-scoped model — NOT in TENANT_SCOPED_MODELS
    originalMockFns['plan'] = {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({})
    }

    // Mock prisma — layer 1 (original methods)
    const mockPrisma: Record<string, unknown> = { ...originalMockFns }

    // $extends — layer 2: wraps model methods through the interceptor
    mockPrisma.$extends = function (config: {
      query?: {
        $allModels?: {
          $allOperations?: (params: {
            model: string
            operation: string
            args: unknown
            query: (args: unknown) => unknown
          }) => unknown
        }
      }
    }) {
      const handler = config?.query?.$allModels?.$allOperations
      if (!handler) return this

      const extended: Record<string, unknown> = {}
      for (const [key, methods] of Object.entries(originalMockFns)) {
        const modelName = key.charAt(0).toUpperCase() + key.slice(1)
        extended[key] = {}
        for (const [op, mockFn] of Object.entries(methods)) {
          ;(extended[key] as Record<string, unknown>)[op] = (args: unknown) => {
            return handler({
              model: modelName,
              operation: op,
              args,
              query: (qArgs: unknown) => mockFn(qArgs)
            })
          }
        }
      }
      return extended
    }

    return { mockPrisma, originalMockFns }
  }

  // ========================
  //  READ operations
  // ========================

  it('should add tenantId to findMany where for tenant-scoped models', async () => {
    clsContextService.getRequestContext.mockReturnValue(TENANT_CTX)
    const { mockPrisma, originalMockFns } = createMockPrisma()

    const ext = createTenantFilterExtension(clsContextService)
    const extended = ext(mockPrisma as any)

    await (extended as any).ingredient_TE.findMany({ where: { name: 'test' } })

    expect(originalMockFns['ingredient_TE'].findMany).toHaveBeenCalledWith({
      where: { name: 'test', tenantId: 'tid-a' }
    })
  })

  it('should add tenantId to findFirst where for tenant-scoped models', async () => {
    clsContextService.getRequestContext.mockReturnValue(TENANT_CTX)
    const { mockPrisma, originalMockFns } = createMockPrisma()

    const ext = createTenantFilterExtension(clsContextService)
    const extended = ext(mockPrisma as any)

    await (extended as any).ingredient_TE.findFirst({ where: { name: 'test' } })

    expect(originalMockFns['ingredient_TE'].findFirst).toHaveBeenCalledWith({
      where: { name: 'test', tenantId: 'tid-a' }
    })
  })

  it('should convert findUnique to findFirst adding tenantId', async () => {
    clsContextService.getRequestContext.mockReturnValue(TENANT_CTX)
    const { mockPrisma, originalMockFns } = createMockPrisma()

    const ext = createTenantFilterExtension(clsContextService)
    const extended = ext(mockPrisma as any)

    await (extended as any).ingredient_TE.findUnique({
      where: { id: 'abc' }
    })

    // Should call findFirst instead of findUnique
    expect(originalMockFns['ingredient_TE'].findFirst).toHaveBeenCalledWith({
      where: { id: 'abc', tenantId: 'tid-a' }
    })
    expect(originalMockFns['ingredient_TE'].findUnique).not.toHaveBeenCalled()
  })

  it('should convert findUniqueOrThrow to findFirstOrThrow adding tenantId', async () => {
    clsContextService.getRequestContext.mockReturnValue(TENANT_CTX)
    const { mockPrisma, originalMockFns } = createMockPrisma()

    const ext = createTenantFilterExtension(clsContextService)
    const extended = ext(mockPrisma as any)

    await (extended as any).ingredient_TE.findUniqueOrThrow({
      where: { id: 'abc' }
    })

    expect(
      originalMockFns['ingredient_TE'].findFirstOrThrow
    ).toHaveBeenCalledWith({
      where: { id: 'abc', tenantId: 'tid-a' }
    })
    expect(
      originalMockFns['ingredient_TE'].findUniqueOrThrow
    ).not.toHaveBeenCalled()
  })

  it('should convert Session.findUnique(refreshTokenHash) to findFirst maintaining where and adding tenantId', async () => {
    clsContextService.getRequestContext.mockReturnValue(TENANT_CTX)
    const { mockPrisma, originalMockFns } = createMockPrisma()

    const ext = createTenantFilterExtension(clsContextService)
    const extended = ext(mockPrisma as any)

    await (extended as any).session.findUnique({
      where: { refreshTokenHash: 'hash123' }
    })

    // Session is in TENANT_SCOPED_MODELS, so it gets filtered
    expect(originalMockFns['session'].findFirst).toHaveBeenCalledWith({
      where: { refreshTokenHash: 'hash123', tenantId: 'tid-a' }
    })
    expect(originalMockFns['session'].findUnique).not.toHaveBeenCalled()
  })

  it('should add tenantId to count queries', async () => {
    clsContextService.getRequestContext.mockReturnValue(TENANT_CTX)
    const { mockPrisma, originalMockFns } = createMockPrisma()

    const ext = createTenantFilterExtension(clsContextService)
    const extended = ext(mockPrisma as any)

    await (extended as any).ingredient_TE.count({ where: { name: 'test' } })

    expect(originalMockFns['ingredient_TE'].count).toHaveBeenCalledWith({
      where: { name: 'test', tenantId: 'tid-a' }
    })
  })

  it('should add tenantId to aggregate where for tenant-scoped models', async () => {
    clsContextService.getRequestContext.mockReturnValue(TENANT_CTX)
    const { mockPrisma, originalMockFns } = createMockPrisma()

    const ext = createTenantFilterExtension(clsContextService)
    const extended = ext(mockPrisma as any)

    await (extended as any).ingredient_TE.aggregate({ where: { name: 'test' }, _count: true })

    expect(originalMockFns['ingredient_TE'].aggregate).toHaveBeenCalledWith({
      where: { name: 'test', tenantId: 'tid-a' },
      _count: true
    })
  })

  it('should add tenantId to groupBy where for tenant-scoped models', async () => {
    clsContextService.getRequestContext.mockReturnValue(TENANT_CTX)
    const { mockPrisma, originalMockFns } = createMockPrisma()

    const ext = createTenantFilterExtension(clsContextService)
    const extended = ext(mockPrisma as any)

    await (extended as any).ingredient_TE.groupBy({ where: { name: 'test' }, by: ['tenantId'] })

    expect(originalMockFns['ingredient_TE'].groupBy).toHaveBeenCalledWith({
      where: { name: 'test', tenantId: 'tid-a' },
      by: ['tenantId']
    })
  })

  // ========================
  //  CREATE operations
  // ========================

  it('should add tenantId to create data for tenant-scoped models', async () => {
    clsContextService.getRequestContext.mockReturnValue(TENANT_CTX)
    const { mockPrisma, originalMockFns } = createMockPrisma()

    const ext = createTenantFilterExtension(clsContextService)
    const extended = ext(mockPrisma as any)

    await (extended as any).ingredient_TE.create({
      data: { name: 'New Ingredient' }
    })

    expect(originalMockFns['ingredient_TE'].create).toHaveBeenCalledWith({
      data: { name: 'New Ingredient', tenantId: 'tid-a' }
    })
  })

  it('should add tenantId to every item in createMany data', async () => {
    clsContextService.getRequestContext.mockReturnValue(TENANT_CTX)
    const { mockPrisma, originalMockFns } = createMockPrisma()

    const ext = createTenantFilterExtension(clsContextService)
    const extended = ext(mockPrisma as any)

    await (extended as any).ingredient_TE.createMany({
      data: [{ name: 'Ingredient A' }, { name: 'Ingredient B' }]
    })

    expect(originalMockFns['ingredient_TE'].createMany).toHaveBeenCalledWith({
      data: [
        { name: 'Ingredient A', tenantId: 'tid-a' },
        { name: 'Ingredient B', tenantId: 'tid-a' }
      ]
    })
  })

  // ========================
  //  UPDATE / DELETE operations
  // ========================

  it('should add tenantId to update where', async () => {
    clsContextService.getRequestContext.mockReturnValue(TENANT_CTX)
    const { mockPrisma, originalMockFns } = createMockPrisma()

    const ext = createTenantFilterExtension(clsContextService)
    const extended = ext(mockPrisma as any)

    await (extended as any).ingredient_TE.update({
      where: { id: 'abc' },
      data: { name: 'Updated' }
    })

    expect(originalMockFns['ingredient_TE'].update).toHaveBeenCalledWith({
      where: { id: 'abc', tenantId: 'tid-a' },
      data: { name: 'Updated' }
    })
  })

  it('should add tenantId to deleteMany where', async () => {
    clsContextService.getRequestContext.mockReturnValue(TENANT_CTX)
    const { mockPrisma, originalMockFns } = createMockPrisma()

    const ext = createTenantFilterExtension(clsContextService)
    const extended = ext(mockPrisma as any)

    await (extended as any).ingredient_TE.deleteMany({
      where: { name: 'obsolete' }
    })

    expect(originalMockFns['ingredient_TE'].deleteMany).toHaveBeenCalledWith({
      where: { name: 'obsolete', tenantId: 'tid-a' }
    })
  })

  it('should add tenantId to delete where', async () => {
    clsContextService.getRequestContext.mockReturnValue(TENANT_CTX)
    const { mockPrisma, originalMockFns } = createMockPrisma()

    const ext = createTenantFilterExtension(clsContextService)
    const extended = ext(mockPrisma as any)

    await (extended as any).ingredient_TE.delete({ where: { id: 'abc' } })

    expect(originalMockFns['ingredient_TE'].delete).toHaveBeenCalledWith({
      where: { id: 'abc', tenantId: 'tid-a' }
    })
  })

  it('should add tenantId to updateMany where', async () => {
    clsContextService.getRequestContext.mockReturnValue(TENANT_CTX)
    const { mockPrisma, originalMockFns } = createMockPrisma()

    const ext = createTenantFilterExtension(clsContextService)
    const extended = ext(mockPrisma as any)

    await (extended as any).ingredient_TE.updateMany({
      where: { name: 'old' },
      data: { name: 'new' }
    })

    expect(originalMockFns['ingredient_TE'].updateMany).toHaveBeenCalledWith({
      where: { name: 'old', tenantId: 'tid-a' },
      data: { name: 'new' }
    })
  })

  // ========================
  //  UPSERT
  // ========================

  it('should add tenantId to upsert where, create and update', async () => {
    clsContextService.getRequestContext.mockReturnValue(TENANT_CTX)
    const { mockPrisma, originalMockFns } = createMockPrisma()

    const ext = createTenantFilterExtension(clsContextService)
    const extended = ext(mockPrisma as any)

    await (extended as any).ingredient_TE.upsert({
      where: { id: 'abc' },
      create: { name: 'New' },
      update: { name: 'Updated' }
    })

    expect(originalMockFns['ingredient_TE'].upsert).toHaveBeenCalledWith({
      where: { id: 'abc', tenantId: 'tid-a' },
      create: { name: 'New', tenantId: 'tid-a' },
      update: { name: 'Updated', tenantId: 'tid-a' }
    })
  })

  // ========================
  //  PLATFORM-SCOPED MODELS — NO FILTER
  // ========================

  it('should NOT modify queries for platform-scoped models (Plan)', async () => {
    clsContextService.getRequestContext.mockReturnValue(TENANT_CTX)
    const { mockPrisma, originalMockFns } = createMockPrisma()

    const ext = createTenantFilterExtension(clsContextService)
    const extended = ext(mockPrisma as any)

    await (extended as any).plan.findMany({ where: { name: 'Basic' } })

    // Plan is NOT in TENANT_SCOPED_MODELS — no tenantId added
    expect(originalMockFns['plan'].findMany).toHaveBeenCalledWith({
      where: { name: 'Basic' }
    })
  })

  it('should NOT modify queries when no CLS context is present', async () => {
    clsContextService.getRequestContext.mockReturnValue(undefined)
    const { mockPrisma, originalMockFns } = createMockPrisma()

    const ext = createTenantFilterExtension(clsContextService)
    const extended = ext(mockPrisma as any)

    await (extended as any).ingredient_TE.findMany({ where: { name: 'test' } })

    // No context — no modification
    expect(originalMockFns['ingredient_TE'].findMany).toHaveBeenCalledWith({
      where: { name: 'test' }
    })
  })

  it('should NOT modify queries when effectiveTenantId is null (PLATFORM without impersonation)', async () => {
    clsContextService.getRequestContext.mockReturnValue(
      PLATFORM_NO_IMPERSONATION
    )
    const { mockPrisma, originalMockFns } = createMockPrisma()

    const ext = createTenantFilterExtension(clsContextService)
    const extended = ext(mockPrisma as any)

    await (extended as any).ingredient_TE.findMany({ where: { name: 'test' } })

    // No effective tenantId — no modification
    expect(originalMockFns['ingredient_TE'].findMany).toHaveBeenCalledWith({
      where: { name: 'test' }
    })
  })
})
