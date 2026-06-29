/**
 * Tenant Isolation Test Helpers
 *
 * Reusable utility functions for testing common tenant isolation patterns
 * across all _TE (tenant-scoped) entities.
 *
 * Usage in a spec file:
 * @example
 *   import { assertTenantMismatchOnSave, assertCrossTenantReadBlocked } from '@test-utils/tenant-isolation-tests'
 *
 *   describe('My_TE repository', () => {
 *     let repo: ...
 *     let mockPrisma: any
 *
 *     beforeEach(() => { /* setup *\/ })
 *
 *     // Register standard tests inline:
 *     assertTenantMismatchOnSave(repo, (tenantId) => My_TE.create({ tenantId, ... }))
 *     assertCrossTenantReadBlocked(repo, 'some-entity-id', mockPrisma)
 *   })
 */

import { ForbiddenException } from '@nestjs/common'
import type { RequestContext } from '@authorization/authorization.types'
import { createTenantContext, createPlatformContext } from './mock-context'

// ============================================================
// Type interfaces
// ============================================================

/** Minimum interface that any tenant-scoped entity must satisfy. */
export interface TenantScopedEntity {
  id: { value: string }
  tenantId: string
}

/** Minimum CRUD interface a tenant-scoped repository must expose. */
export interface TenantScopedRepository<T extends TenantScopedEntity> {
  save(entity: T, ctx: RequestContext): Promise<T>
  findById(id: string, ctx: RequestContext): Promise<T | null>
}

/**
 * Shape of a mock Prisma client for a single tenant-scoped model.
 * The modelName property must match the field name used in the real PrismaService
 * (e.g. `company_TE`, `functionalGroup_TE`, `ingredient_TE`).
 */
export interface MockPrismaTenantModel {
  findUnique: jest.Mock
  findMany?: jest.Mock
  upsert: jest.Mock
}

// ============================================================
// Pattern 1 – Tenant mismatch protection
// ============================================================

/**
 * Verifies the repository.save() method rejects an entity whose tenantId
 * differs from the request context tenantId.
 *
 * The repository MUST throw ForbiddenException for mismatched tenants.
 *
 * @param repo         - Concrete repository instance (with mocked Prisma)
 * @param entityFactory - Callback that creates an entity for the given tenantId
 */
export function assertTenantMismatchOnSave<T extends TenantScopedEntity>(
  repo: TenantScopedRepository<T>,
  entityFactory: (tenantId: string) => T,
): void {
  it('should reject save when entity tenantId differs from context tenantId', async () => {
    const entity = entityFactory('tenant-a')
    const ctx = createTenantContext({ tenantId: 'tenant-b' })
    await expect(repo.save(entity, ctx)).rejects.toThrow(ForbiddenException)
  })
}

/**
 * Verifies the repository.save() method accepts an entity whose tenantId
 * matches the request context tenantId.
 *
 * @param repo         - Concrete repository instance (with mocked Prisma)
 * @param entityFactory - Callback that creates an entity for the given tenantId
 */
export function assertTenantMatchOnSave<T extends TenantScopedEntity>(
  repo: TenantScopedRepository<T>,
  entityFactory: (tenantId: string) => T,
): void {
  it('should allow save when entity tenantId matches context tenantId', async () => {
    const entity = entityFactory('tenant-b')
    const ctx = createTenantContext({ tenantId: 'tenant-b' })
    // The mock Prisma upsert must resolve for this test to pass
    await expect(repo.save(entity, ctx)).resolves.toBeDefined()
  })
}

// ============================================================
// Pattern 2 – Cross-tenant read (findById)
// ============================================================

/**
 * Verifies that a TENANT-scoped user cannot read an entity that belongs to
 * a different tenant via findById.  The repository uses `getEffectiveTenantId`
 * to add a tenantId filter, so Prisma returns null and the domain result is null.
 *
 * The mock MUST be configured so that findUnique resolves to null when the
 * called where clause includes `tenantId` for the *wrong* tenant.
 *
 * @param repo         - Concrete repository instance
 * @param entityId    - The ID of an entity that belongs to tenant-a
 * @param mockPrisma  - Object with the model namespace containing findUnique
 * @param modelName   - Name of the prisma model property (e.g. 'company_TE')
 */
export function assertCrossTenantReadBlocked<T extends TenantScopedEntity>(
  repo: TenantScopedRepository<T>,
  entityId: string,
  mockPrisma: { [model: string]: MockPrismaTenantModel },
  modelName: string,
): void {
  it('should return null when tenant user reads an entity from a different tenant', async () => {
    // Simulate Prisma returning nothing when tenantId filter does not match
    const mockModel = mockPrisma[modelName]
    if (!mockModel) {
      throw new Error(
        `Mock Prisma does not have a property '${modelName}'. Available keys: ${Object.keys(mockPrisma).join(', ')}`,
      )
    }
    mockModel.findUnique.mockResolvedValue(null)

    const ctx = createTenantContext({ tenantId: 'tenant-b' })
    const result = await repo.findById(entityId, ctx)

    expect(result).toBeNull()

    // Verify the tenantId filter was actually passed to Prisma
    expect(mockModel.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-b' }),
      }),
    )
  })
}

// ============================================================
// Pattern 3 – Platform vs Tenant context
// ============================================================

/**
 * Verifies that a PLATFORM user WITH impersonation can read entities belonging
 * to the impersonated tenant.
 *
 * @param repo             - Concrete repository instance
 * @param entityId         - The ID of an entity belonging to the target tenant
 * @param expectedTenantId - The tenant the platform user is impersonating
 */
export function assertPlatformCanReadWithImpersonation<T extends TenantScopedEntity>(
  repo: TenantScopedRepository<T>,
  entityId: string,
  expectedTenantId: string,
): void {
  it('should allow platform user with impersonation to read tenant data', async () => {
    const ctx = createPlatformContext({ impersonatedTenantId: expectedTenantId })
    const result = await repo.findById(entityId, ctx)
    expect(result).not.toBeNull()
    expect(result!.tenantId).toBe(expectedTenantId)
  })
}

/**
 * Verifies that a PLATFORM user WITHOUT impersonation bypasses tenant filtering
 * (i.e. can read data from any tenant).
 *
 * @param repo      - Concrete repository instance
 * @param entityId  - The ID of an entity belonging to any tenant
 */
export function assertPlatformReadWithoutImpersonation<T extends TenantScopedEntity>(
  repo: TenantScopedRepository<T>,
  entityId: string,
): void {
  it('should bypass tenant filter when platform user has no impersonation', async () => {
    const ctx = createPlatformContext({ impersonatedTenantId: null })
    const result = await repo.findById(entityId, ctx)
    // With no impersonation there is no tenantId filter → entity is returned
    expect(result).not.toBeNull()
  })
}

// ============================================================
// Pattern 4 – Missing tenantId in service
// ============================================================

/**
 * Verifies that the service.create() method throws an error when the tenantId
 * cannot be resolved from the request context (e.g. platform user without
 * impersonation).
 *
 * @param serviceCreate  - The actual service.create method
 * @param validProps     - A valid set of creation properties (without tenantId)
 */
export function assertMissingTenantIdThrows(
  serviceCreate: (props: any, ctx: RequestContext) => Promise<any>,
  validProps: Record<string, any>,
): void {
  it('should throw when tenantId cannot be resolved from request context', async () => {
    const ctx = createPlatformContext({ impersonatedTenantId: null })
    await expect(serviceCreate(validProps, ctx)).rejects.toThrow()
  })
}

// ============================================================
// Full battery — runs all basic patterns in a describe block
// ============================================================

/**
 * Runs the complete set of basic tenant isolation tests for a repository.
 *
 * @param repoName         - Human-readable label (e.g. 'Company_TE')
 * @param repo             - Concrete repository instance
 * @param entityFactory    - Callback that creates an entity for the given tenantId
 * @param entityId         - The ID of a persisted entity belonging to tenant-a
 * @param mockPrisma       - Mock Prisma object (must contain the model namespace)
 * @param modelName        - Prisma model property name (e.g. 'company_TE')
 * @param expectedTenantId - The tenantId the mock entity belongs to (default tenant-a)
 */
export function runBasicTenantIsolationTests<T extends TenantScopedEntity>(
  repoName: string,
  repo: TenantScopedRepository<T>,
  entityFactory: (tenantId: string) => T,
  entityId: string,
  mockPrisma: { [model: string]: MockPrismaTenantModel },
  modelName: string,
  expectedTenantId: string = 'tenant-a',
): void {
  describe(`Tenant isolation — ${repoName}`, () => {
    describe('tenantId consistency on save', () => {
      assertTenantMismatchOnSave(repo, entityFactory)
      assertTenantMatchOnSave(repo, entityFactory)
    })

    describe('cross-tenant access', () => {
      assertCrossTenantReadBlocked(repo, entityId, mockPrisma, modelName)
    })

    describe('platform context', () => {
      // Platform + impersonation → tenant filter is active
      assertPlatformCanReadWithImpersonation(repo, entityId, expectedTenantId)
      // Platform no impersonation → no tenant filter
      assertPlatformReadWithoutImpersonation(repo, entityId)
    })
  })
}
