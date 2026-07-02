/**
 * Claim_TE Repository Tests
 *
 * Tenant-scoped (TE) repository — tenantId filtering applied.
 * Tests the PrismaClaim_TE_Repository CRUD operations and mapper.
 */

import { ForbiddenException } from '@nestjs/common'
import { SystemState } from '@shared/behaviours/lockable'
import { createTenantContext, createPlatformContext } from '../../test-utils'

import { Claim_TE } from './claim-te.entity'
import { PrismaClaim_TE_Repository } from './claim-te.repository'

const ANY_ID = '550e8400-e29b-41d4-a716-446655440000'
const TENANT_ID = 'test-tenant-id'
const ctx = createTenantContext()
const platformCtx = createPlatformContext()

function createClaimEntity(overrides: Partial<Record<string, unknown>> = {}) {
  return Claim_TE.create({
    tenantId: (overrides.tenantId as string) ?? TENANT_ID,
    code: (overrides.code as string) ?? 'CLAIM-001',
    name: (overrides.name as string) ?? 'Test Claim',
    description: (overrides.description as string | null) ?? null,
  })
}

function createMockPrismaClaimTE(
  overrides: Partial<Record<string, unknown>> = {},
) {
  return {
    id: (overrides.id as string) ?? ANY_ID,
    createdAt: (overrides.createdAt as Date) ?? new Date(),
    updatedAt: (overrides.updatedAt as Date) ?? new Date(),
    systemState: (overrides.systemState as string) ?? 'ACTIVE',
    tenantId: (overrides.tenantId as string) ?? TENANT_ID,
    code: (overrides.code as string) ?? 'CLAIM-001',
    name: (overrides.name as string) ?? 'Test Claim',
    description: (overrides.description as string | null) ?? null,
  }
}

describe('PrismaClaim_TE_Repository', () => {
  let mockPrisma: any
  let repo: PrismaClaim_TE_Repository

  beforeEach(() => {
    mockPrisma = {
      claim_TE: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
    }
    repo = new PrismaClaim_TE_Repository(mockPrisma as any)
  })

  // ============================================================
  // save
  // ============================================================
  describe('save', () => {
    it('should upsert entity and return it', async () => {
      mockPrisma.claim_TE.upsert.mockResolvedValue({})
      const entity = createClaimEntity({ name: 'Organic' })

      const result = await repo.save(entity, ctx)

      expect(mockPrisma.claim_TE.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: entity.id.value },
          update: expect.objectContaining({ name: 'Organic' }),
          create: expect.objectContaining({ name: 'Organic' }),
        }),
      )
      expect(result).toBe(entity)
    })

    it('should throw ForbiddenException when saving cross-tenant entity', async () => {
      const entity = createClaimEntity({
        tenantId: 'other-tenant',
        name: 'Cross-tenant',
      })

      await expect(repo.save(entity, ctx)).rejects.toThrow(ForbiddenException)
    })

    it('should persist all domain properties (toPersistence)', async () => {
      mockPrisma.claim_TE.upsert.mockResolvedValue({})
      const entity = createClaimEntity({
        code: 'ORG-001',
        name: 'Organic Certified',
        description: 'Product is organically certified',
      })

      await repo.save(entity, ctx)

      const [args] = mockPrisma.claim_TE.upsert.mock.calls[0]
      expect(args.create).toMatchObject({
        id: entity.id.value,
        code: 'ORG-001',
        name: 'Organic Certified',
        description: 'Product is organically certified',
        tenantId: TENANT_ID,
        systemState: SystemState.ACTIVE,
      })
    })
  })

  // ============================================================
  // findById
  // ============================================================
  describe('findById', () => {
    it('should return domain entity when found (toDomain)', async () => {
      mockPrisma.claim_TE.findUnique.mockResolvedValue(
        createMockPrismaClaimTE({ name: 'Gluten Free' }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).not.toBeNull()
      expect(result!.name).toBe('Gluten Free')
      expect(result!.id.value).toBe(ANY_ID)
      expect(result!.tenantId).toBe(TENANT_ID)
    })

    it('should return null when not found', async () => {
      mockPrisma.claim_TE.findUnique.mockResolvedValue(null)

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })

    it('should return null when entity is DELETED', async () => {
      mockPrisma.claim_TE.findUnique.mockResolvedValue(
        createMockPrismaClaimTE({ systemState: 'DELETED' }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })

    it('should filter by tenantId for tenant-scoped context', async () => {
      const whereSpy = jest.fn()
      mockPrisma.claim_TE.findUnique.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve(null)
        },
      )

      await repo.findById(ANY_ID, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: TENANT_ID }),
      )
    })
  })

  // ============================================================
  // findAll
  // ============================================================
  describe('findAll', () => {
    it('should return all active entities filtered by tenantId', async () => {
      mockPrisma.claim_TE.findMany.mockResolvedValue([
        createMockPrismaClaimTE({
          id: '550e8400-e29b-41d4-a716-446655440100',
          name: 'Claim A',
        }),
        createMockPrismaClaimTE({
          id: '550e8400-e29b-41d4-a716-446655440101',
          name: 'Claim B',
        }),
      ])

      const result = await repo.findAll({}, ctx)

      expect(result).toHaveLength(2)
      expect(result[0]!.name).toBe('Claim A')
      expect(result[1]!.name).toBe('Claim B')
    })

    it('should filter by name', async () => {
      const whereSpy = jest.fn()
      mockPrisma.claim_TE.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({ name: 'Organic' }, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: { contains: 'Organic', mode: 'insensitive' },
        }),
      )
    })

    it('should filter by code', async () => {
      const whereSpy = jest.fn()
      mockPrisma.claim_TE.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({ code: 'ORG' }, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: { contains: 'ORG', mode: 'insensitive' },
        }),
      )
    })

    it('should exclude DELETED entities for tenant context', async () => {
      const whereSpy = jest.fn()
      mockPrisma.claim_TE.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({}, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          systemState: { not: SystemState.DELETED },
        }),
      )
    })

    it('should not apply tenantId filter for platform context', async () => {
      const whereSpy = jest.fn()
      mockPrisma.claim_TE.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({}, platformCtx)

      expect(whereSpy).toHaveBeenCalled()
      const calledWhere = whereSpy.mock.calls[0][0]
      expect(calledWhere).not.toHaveProperty('tenantId')
    })
  })

  // ============================================================
  // delete
  // ============================================================
  describe('delete', () => {
    it('should soft-delete by updating systemState to DELETED with tenantId filter', async () => {
      mockPrisma.claim_TE.update.mockResolvedValue({})

      await repo.delete(ANY_ID, ctx)

      expect(mockPrisma.claim_TE.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: ANY_ID, tenantId: TENANT_ID },
          data: expect.objectContaining({
            systemState: SystemState.DELETED,
          }),
        }),
      )
    })

    it('should not apply tenantId filter for platform context', async () => {
      mockPrisma.claim_TE.update.mockResolvedValue({})

      await repo.delete(ANY_ID, platformCtx)

      expect(mockPrisma.claim_TE.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: ANY_ID },
        }),
      )
    })
  })
})
