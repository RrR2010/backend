import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { UserScope, PlatformRole, TenantRole } from '@users/user.types'
import { TenantContextGuard } from './tenant-context.guard'

function createMockReflector() {
  return {
    get: jest.fn().mockReturnValue(false),
  }
}

function createMockTenantMembershipRepository() {
  return {
    findAll: jest.fn(),
  }
}

function createMockPrisma() {
  return {
    tenant: {
      findUnique: jest.fn(),
    },
  }
}

function createMockAuditLogService() {
  return {
    create: jest.fn().mockResolvedValue({}),
  }
}

describe('TenantContextGuard - impersonation logic', () => {
  let guard: TenantContextGuard
  let mockReflector: ReturnType<typeof createMockReflector>
  let mockTenantMembershipRepo: ReturnType<
    typeof createMockTenantMembershipRepository
  >
  let mockPrisma: ReturnType<typeof createMockPrisma>
  let mockAuditLogService: ReturnType<typeof createMockAuditLogService>

  beforeEach(() => {
    mockReflector = createMockReflector()
    mockTenantMembershipRepo = createMockTenantMembershipRepository()
    mockPrisma = createMockPrisma()
    mockAuditLogService = createMockAuditLogService()

    guard = new TenantContextGuard(
      mockReflector as any,
      mockTenantMembershipRepo as any,
      mockPrisma as any,
      mockAuditLogService as any,
    )
  })

  function createMockRequest(overrides: Record<string, any> = {}) {
    const request: Record<string, any> = {
      user: { userId: 'user-1', scope: UserScope.PLATFORM, roles: [PlatformRole.ADMIN] },
      authScope: UserScope.PLATFORM,
      userId: 'user-1',
      tenantId: null,
      impersonatedTenantId: null,
      tenantContext: undefined,
      context: undefined,
      header: jest.fn().mockReturnValue(null),
      ...overrides,
    }
    return request
  }

  function createMockContext(request: Record<string, any>) {
    return {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(request),
      }),
    } as any
  }

  // ========= Audit logging on impersonation =========

  it('should log IMPERSONATION_STARTED audit event on successful impersonation', async () => {
    const request = createMockRequest({
      user: {
        userId: 'user-1',
        scope: UserScope.PLATFORM,
        roles: [PlatformRole.ADMIN],
      },
      authScope: UserScope.PLATFORM,
      ip: '127.0.0.1',
      headers: { 'user-agent': 'test-agent' },
      header: jest.fn().mockImplementation((name: string) => {
        if (name === 'X-Tenant-Id') return 'tenant-abc'
        return null
      }),
    })

    mockPrisma.tenant.findUnique.mockResolvedValue({
      id: 'tenant-abc',
      subscription: { status: 'ACTIVE' },
    })

    const result = await guard.canActivate(createMockContext(request))

    expect(result).toBe(true)
    expect(mockAuditLogService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'IMPERSONATION_STARTED',
        entityName: 'Impersonation',
        entityId: 'tenant-abc',
        tenantId: 'tenant-abc',
        userId: 'user-1',
      }),
      expect.objectContaining({
        userId: 'user-1',
        scope: UserScope.PLATFORM,
        impersonatedTenantId: 'tenant-abc',
      }),
    )
  })

  // ========= PLATFORM ADMIN with valid X-Tenant-Id =========

  it('should set impersonation for PLATFORM ADMIN with valid X-Tenant-Id', async () => {
    const request = createMockRequest({
      user: {
        userId: 'user-1',
        scope: UserScope.PLATFORM,
        roles: [PlatformRole.ADMIN],
      },
      authScope: UserScope.PLATFORM,
      header: jest.fn().mockImplementation((name: string) => {
        if (name === 'X-Tenant-Id') return 'tenant-abc'
        return null
      }),
    })

    mockPrisma.tenant.findUnique.mockResolvedValue({
      id: 'tenant-abc',
      subscription: { status: 'ACTIVE' },
    })

    const result = await guard.canActivate(createMockContext(request))

    expect(result).toBe(true)
    expect(request.impersonatedTenantId).toBe('tenant-abc')
    expect(request.tenantContext).toBeDefined()
    expect(request.tenantContext?.tenantId).toBe('tenant-abc')
  })

  // ========= PLATFORM ADMIN with GRACE subscription =========

  it('should allow impersonation for GRACE subscription status', async () => {
    const request = createMockRequest({
      user: {
        userId: 'user-1',
        scope: UserScope.PLATFORM,
        roles: [PlatformRole.ADMIN],
      },
      authScope: UserScope.PLATFORM,
      header: jest.fn().mockImplementation((name: string) => {
        if (name === 'X-Tenant-Id') return 'tenant-grace'
        return null
      }),
    })

    mockPrisma.tenant.findUnique.mockResolvedValue({
      id: 'tenant-grace',
      subscription: { status: 'GRACE' },
    })

    const result = await guard.canActivate(createMockContext(request))

    expect(result).toBe(true)
    expect(request.impersonatedTenantId).toBe('tenant-grace')
  })

  // ========= PLATFORM USER with X-Tenant-Id =========

  it('should throw ForbiddenException for PLATFORM USER with X-Tenant-Id', async () => {
    const request = createMockRequest({
      user: {
        userId: 'user-1',
        scope: UserScope.PLATFORM,
        roles: [PlatformRole.USER],
      },
      authScope: UserScope.PLATFORM,
      header: jest.fn().mockImplementation((name: string) => {
        if (name === 'X-Tenant-Id') return 'tenant-abc'
        return null
      }),
    })

    // Prisma should not be called because role check happens first
    mockPrisma.tenant.findUnique.mockResolvedValue({
      id: 'tenant-abc',
      subscription: { status: 'ACTIVE' },
    })

    await expect(
      guard.canActivate(createMockContext(request)),
    ).rejects.toThrow(ForbiddenException)

    // Impersonation should be cleaned up
    expect(request.impersonatedTenantId).toBeNull()
  })

  // ========= PLATFORM ADMIN with non-existent tenant =========

  it('should throw NotFoundException for non-existent tenant', async () => {
    const request = createMockRequest({
      user: {
        userId: 'user-1',
        scope: UserScope.PLATFORM,
        roles: [PlatformRole.ADMIN],
      },
      authScope: UserScope.PLATFORM,
      header: jest.fn().mockImplementation((name: string) => {
        if (name === 'X-Tenant-Id') return 'non-existent-id'
        return null
      }),
    })

    mockPrisma.tenant.findUnique.mockResolvedValue(null)

    await expect(
      guard.canActivate(createMockContext(request)),
    ).rejects.toThrow(NotFoundException)

    // Impersonation should be cleaned up
    expect(request.impersonatedTenantId).toBeNull()
  })

  // ========= PLATFORM ADMIN with expired subscription =========

  it('should throw ForbiddenException for expired subscription', async () => {
    const request = createMockRequest({
      user: {
        userId: 'user-1',
        scope: UserScope.PLATFORM,
        roles: [PlatformRole.ADMIN],
      },
      authScope: UserScope.PLATFORM,
      header: jest.fn().mockImplementation((name: string) => {
        if (name === 'X-Tenant-Id') return 'tenant-expired'
        return null
      }),
    })

    mockPrisma.tenant.findUnique.mockResolvedValue({
      id: 'tenant-expired',
      subscription: { status: 'EXPIRED' },
    })

    await expect(
      guard.canActivate(createMockContext(request)),
    ).rejects.toThrow(ForbiddenException)

    expect(request.impersonatedTenantId).toBeNull()
  })

  it('should throw ForbiddenException for CANCELED subscription', async () => {
    const request = createMockRequest({
      user: {
        userId: 'user-1',
        scope: UserScope.PLATFORM,
        roles: [PlatformRole.ADMIN],
      },
      authScope: UserScope.PLATFORM,
      header: jest.fn().mockImplementation((name: string) => {
        if (name === 'X-Tenant-Id') return 'tenant-canceled'
        return null
      }),
    })

    mockPrisma.tenant.findUnique.mockResolvedValue({
      id: 'tenant-canceled',
      subscription: { status: 'CANCELED' },
    })

    await expect(
      guard.canActivate(createMockContext(request)),
    ).rejects.toThrow(ForbiddenException)

    expect(request.impersonatedTenantId).toBeNull()
  })

  it('should throw ForbiddenException when tenant has no subscription', async () => {
    const request = createMockRequest({
      user: {
        userId: 'user-1',
        scope: UserScope.PLATFORM,
        roles: [PlatformRole.ADMIN],
      },
      authScope: UserScope.PLATFORM,
      header: jest.fn().mockImplementation((name: string) => {
        if (name === 'X-Tenant-Id') return 'tenant-no-sub'
        return null
      }),
    })

    mockPrisma.tenant.findUnique.mockResolvedValue({
      id: 'tenant-no-sub',
      subscription: null,
    })

    await expect(
      guard.canActivate(createMockContext(request)),
    ).rejects.toThrow(ForbiddenException)

    expect(request.impersonatedTenantId).toBeNull()
  })

  // ========= TENANT user with X-Tenant-Id (header ignored) =========

  it('should ignore X-Tenant-Id for TENANT users', async () => {
    const request = createMockRequest({
      user: {
        userId: 'user-1',
        scope: UserScope.TENANT,
        roles: [TenantRole.USER],
      },
      authScope: UserScope.TENANT,
      tenantId: 'real-tenant-id',
      header: jest.fn().mockImplementation((name: string) => {
        if (name === 'X-Tenant-Id') return 'fake-tenant-id'
        return null
      }),
    })

    mockTenantMembershipRepo.findAll.mockResolvedValue([
      { isOwner: false },
    ])

    const result = await guard.canActivate(createMockContext(request))

    expect(result).toBe(true)
    // Tenant must use JWT tenantId, not the header
    expect(request.impersonatedTenantId).toBeNull()
    expect(request.tenantContext?.tenantId).toBe('real-tenant-id')
  })

  // ========= PLATFORM ADMIN without X-Tenant-Id (no impersonation) =========

  it('should allow PLATFORM ADMIN without X-Tenant-Id (normal mode)', async () => {
    const request = createMockRequest({
      user: {
        userId: 'user-1',
        scope: UserScope.PLATFORM,
        roles: [PlatformRole.ADMIN],
      },
      authScope: UserScope.PLATFORM,
      header: jest.fn().mockReturnValue(null), // No X-Tenant-Id header
    })

    // No Prisma call expected since there's no impersonation
    const result = await guard.canActivate(createMockContext(request))

    expect(result).toBe(true)
    expect(request.impersonatedTenantId).toBeNull()
  })
})
