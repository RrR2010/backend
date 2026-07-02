/**
 * FormulationVersion_TE Repository Tests
 *
 * Tenant-scoped (TE) repository — tenantId filtering applied.
 * Tests the PrismaFormulationVersion_TE_Repository CRUD operations,
 * findByProductId, and tenant isolation.
 */

import { ForbiddenException } from '@nestjs/common'
import { SystemState } from '@shared/behaviours/lockable'
import { createTenantContext, createPlatformContext } from '../../test-utils'

import { FormulationVersion_TE } from './formulation-version.entity'
import { PrismaFormulationVersion_TE_Repository } from './formulation.repository'

const ANY_ID = '550e8400-e29b-41d4-a716-446655440004'
const TENANT_ID = 'test-tenant-id'
const PRODUCT_ID = '550e8400-e29b-41d4-a716-446655440900'
const ctx = createTenantContext()
const platformCtx = createPlatformContext()

function createEntity(overrides: Partial<Record<string, unknown>> = {}) {
  return FormulationVersion_TE.create({
    tenantId: (overrides.tenantId as string) ?? TENANT_ID,
    productId: (overrides.productId as string) ?? PRODUCT_ID,
    version: (overrides.version as number) ?? 1,
    notes: (overrides.notes as string | null) ?? null,
  })
}

function createMockPrismaEntity(
  overrides: Partial<Record<string, unknown>> = {},
) {
  return {
    id: (overrides.id as string) ?? ANY_ID,
    createdAt: (overrides.createdAt as Date) ?? new Date('2025-01-01'),
    updatedAt: (overrides.updatedAt as Date) ?? new Date('2025-01-02'),
    systemState: (overrides.systemState as string) ?? 'ACTIVE',
    tenantId: (overrides.tenantId as string) ?? TENANT_ID,
    productId: (overrides.productId as string) ?? PRODUCT_ID,
    version: (overrides.version as number) ?? 1,
    notes: (overrides.notes as string | null) ?? null,
  }
}

describe('PrismaFormulationVersion_TE_Repository', () => {
  let mockPrisma: any
  let repo: PrismaFormulationVersion_TE_Repository

  beforeEach(() => {
    mockPrisma = {
      formulationVersion_TE: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
    }
    repo = new PrismaFormulationVersion_TE_Repository(mockPrisma as any)
  })

  // ============================================================
  // save
  // ============================================================
  describe('save', () => {
    it('should upsert entity and return it', async () => {
      mockPrisma.formulationVersion_TE.upsert.mockResolvedValue({})
      const entity = createEntity({ version: 2 })

      const result = await repo.save(entity, ctx)

      expect(mockPrisma.formulationVersion_TE.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: entity.id.value },
          update: expect.objectContaining({ version: 2 }),
          create: expect.objectContaining({ version: 2 }),
        }),
      )
      expect(result).toBe(entity)
    })

    it('should throw ForbiddenException when saving cross-tenant entity', async () => {
      const entity = createEntity({
        tenantId: 'other-tenant',
        version: 3,
      })

      await expect(repo.save(entity, ctx)).rejects.toThrow(ForbiddenException)
    })

    it('should persist all domain properties (toPersistence)', async () => {
      mockPrisma.formulationVersion_TE.upsert.mockResolvedValue({})
      const entity = createEntity({
        version: 5,
        notes: 'Fifth formulation iteration',
        productId: 'prod-123',
      })

      await repo.save(entity, ctx)

      const [args] = mockPrisma.formulationVersion_TE.upsert.mock.calls[0]
      expect(args.create).toMatchObject({
        id: entity.id.value,
        tenantId: TENANT_ID,
        productId: 'prod-123',
        version: 5,
        notes: 'Fifth formulation iteration',
        systemState: SystemState.ACTIVE,
      })
    })
  })

  // ============================================================
  // findById
  // ============================================================
  describe('findById', () => {
    it('should return domain entity when found (toDomain)', async () => {
      mockPrisma.formulationVersion_TE.findUnique.mockResolvedValue(
        createMockPrismaEntity({ version: 2 }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).not.toBeNull()
      expect(result!.version).toBe(2)
      expect(result!.id.value).toBe(ANY_ID)
      expect(result!.tenantId).toBe(TENANT_ID)
    })

    it('should return null when not found', async () => {
      mockPrisma.formulationVersion_TE.findUnique.mockResolvedValue(null)

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })

    it('should return null when entity is DELETED', async () => {
      mockPrisma.formulationVersion_TE.findUnique.mockResolvedValue(
        createMockPrismaEntity({ systemState: 'DELETED' }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })

    it('should filter by tenantId for tenant-scoped context', async () => {
      const whereSpy = jest.fn()
      mockPrisma.formulationVersion_TE.findUnique.mockImplementation(
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
    it('should return active entities filtered by tenantId', async () => {
      mockPrisma.formulationVersion_TE.findMany.mockResolvedValue([
        createMockPrismaEntity({
          id: '550e8400-e29b-41d4-a716-446655440100',
          version: 1,
        }),
        createMockPrismaEntity({
          id: '550e8400-e29b-41d4-a716-446655440101',
          version: 2,
        }),
      ])

      const result = await repo.findAll(ctx)

      expect(result).toHaveLength(2)
      expect(result[0]!.version).toBe(1)
      expect(result[1]!.version).toBe(2)
    })

    it('should apply pagination defaults (skip=0, take=100)', async () => {
      const argsSpy = jest.fn()
      mockPrisma.formulationVersion_TE.findMany.mockImplementation(
        (args: { skip?: number; take?: number }) => {
          argsSpy({ skip: args.skip, take: args.take })
          return Promise.resolve([])
        },
      )

      await repo.findAll(ctx)

      expect(argsSpy).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 100 }),
      )
    })

    it('should order by version descending', async () => {
      mockPrisma.formulationVersion_TE.findMany.mockResolvedValue([])

      await repo.findAll(ctx)

      expect(mockPrisma.formulationVersion_TE.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { version: 'desc' },
        }),
      )
    })

    it('should filter by ACTIVE systemState', async () => {
      const whereSpy = jest.fn()
      mockPrisma.formulationVersion_TE.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll(ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          systemState: SystemState.ACTIVE,
        }),
      )
    })

    it('should not apply tenantId filter for platform context', async () => {
      const whereSpy = jest.fn()
      mockPrisma.formulationVersion_TE.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll(platformCtx)

      expect(whereSpy).toHaveBeenCalled()
      const calledWhere = whereSpy.mock.calls[0][0]
      expect(calledWhere).not.toHaveProperty('tenantId')
    })
  })

  // ============================================================
  // findByProductId
  // ============================================================
  describe('findByProductId', () => {
    it('should return active versions for the given productId', async () => {
      mockPrisma.formulationVersion_TE.findMany.mockResolvedValue([
        createMockPrismaEntity({
          id: '550e8400-e29b-41d4-a716-446655440200',
          productId: PRODUCT_ID,
          version: 1,
        }),
        createMockPrismaEntity({
          id: '550e8400-e29b-41d4-a716-446655440201',
          productId: PRODUCT_ID,
          version: 2,
        }),
      ])

      const result = await repo.findByProductId(PRODUCT_ID, ctx)

      expect(result).toHaveLength(2)
      expect(result[0]!.productId).toBe(PRODUCT_ID)
      expect(result[1]!.productId).toBe(PRODUCT_ID)

      expect(mockPrisma.formulationVersion_TE.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ productId: PRODUCT_ID }),
        }),
      )
    })

    it('should apply tenantId filter for tenant context', async () => {
      const whereSpy = jest.fn()
      mockPrisma.formulationVersion_TE.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findByProductId(PRODUCT_ID, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: PRODUCT_ID,
          tenantId: TENANT_ID,
        }),
      )
    })

    it('should return only ACTIVE versions', async () => {
      const whereSpy = jest.fn()
      mockPrisma.formulationVersion_TE.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findByProductId(PRODUCT_ID, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          systemState: SystemState.ACTIVE,
        }),
      )
    })

    it('should order by version descending', async () => {
      mockPrisma.formulationVersion_TE.findMany.mockResolvedValue([])

      await repo.findByProductId(PRODUCT_ID, ctx)

      expect(mockPrisma.formulationVersion_TE.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { version: 'desc' },
        }),
      )
    })

    it('should return empty array when no versions match', async () => {
      mockPrisma.formulationVersion_TE.findMany.mockResolvedValue([])

      const result = await repo.findByProductId('non-existent-product', ctx)

      expect(result).toEqual([])
    })
  })

  // ============================================================
  // delete
  // ============================================================
  describe('delete', () => {
    it('should soft-delete by updating systemState to DELETED with tenantId filter', async () => {
      mockPrisma.formulationVersion_TE.update.mockResolvedValue({})

      await repo.delete(ANY_ID, ctx)

      expect(mockPrisma.formulationVersion_TE.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: ANY_ID, tenantId: TENANT_ID },
          data: expect.objectContaining({
            systemState: SystemState.DELETED,
          }),
        }),
      )
    })

    it('should not apply tenantId filter for platform context', async () => {
      mockPrisma.formulationVersion_TE.update.mockResolvedValue({})

      await repo.delete(ANY_ID, platformCtx)

      expect(mockPrisma.formulationVersion_TE.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: ANY_ID },
        }),
      )
    })
  })
})
