/**
 * ProductFamily_TE Repository Tests
 *
 * Tenant-scoped (TE) repository — tenantId filtering applied.
 * Tests the PrismaProductFamily_TE_Repository CRUD operations and mapper.
 */

import { ForbiddenException } from '@nestjs/common'
import { SystemState } from '@shared/behaviours/lockable'
import { createTenantContext, createPlatformContext } from '../../test-utils'

import { ProductFamily_TE } from './product-family-te.entity'
import { PrismaProductFamily_TE_Repository } from './product-family-te.repository'

const ANY_ID = '550e8400-e29b-41d4-a716-446655440000'
const TENANT_ID = 'test-tenant-id'
const ctx = createTenantContext()
const platformCtx = createPlatformContext()

function createProductFamilyEntity(overrides: Partial<Record<string, unknown>> = {}) {
  return ProductFamily_TE.create({
    tenantId: (overrides.tenantId as string) ?? TENANT_ID,
    name: (overrides.name as string) ?? 'Test Family',
    description: (overrides.description as string | null) ?? null,
  })
}

function createMockPrismaProductFamilyTE(
  overrides: Partial<Record<string, unknown>> = {},
) {
  return {
    id: (overrides.id as string) ?? ANY_ID,
    createdAt: (overrides.createdAt as Date) ?? new Date(),
    updatedAt: (overrides.updatedAt as Date) ?? new Date(),
    systemState: (overrides.systemState as string) ?? 'ACTIVE',
    tenantId: (overrides.tenantId as string) ?? TENANT_ID,
    name: (overrides.name as string) ?? 'Test Family',
    description: (overrides.description as string | null) ?? null,
  }
}

describe('PrismaProductFamily_TE_Repository', () => {
  let mockPrisma: any
  let repo: PrismaProductFamily_TE_Repository

  beforeEach(() => {
    mockPrisma = {
      productFamily_TE: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
    }
    repo = new PrismaProductFamily_TE_Repository(mockPrisma as any)
  })

  // ============================================================
  // save
  // ============================================================
  describe('save', () => {
    it('should upsert entity and return it', async () => {
      mockPrisma.productFamily_TE.upsert.mockResolvedValue({})
      const entity = createProductFamilyEntity({ name: 'Ice Creams' })

      const result = await repo.save(entity, ctx)

      expect(mockPrisma.productFamily_TE.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: entity.id.value },
          update: expect.objectContaining({ name: 'Ice Creams' }),
          create: expect.objectContaining({ name: 'Ice Creams' }),
        }),
      )
      expect(result).toBe(entity)
    })

    it('should throw ForbiddenException when saving cross-tenant entity', async () => {
      const entity = createProductFamilyEntity({
        tenantId: 'other-tenant',
        name: 'Cross-tenant',
      })

      await expect(repo.save(entity, ctx)).rejects.toThrow(ForbiddenException)
    })

    it('should persist all domain properties (toPersistence)', async () => {
      mockPrisma.productFamily_TE.upsert.mockResolvedValue({})
      const entity = createProductFamilyEntity({
        name: 'Yogurts',
        description: 'All yogurt products',
      })

      await repo.save(entity, ctx)

      const [args] = mockPrisma.productFamily_TE.upsert.mock.calls[0]
      expect(args.create).toMatchObject({
        id: entity.id.value,
        name: 'Yogurts',
        description: 'All yogurt products',
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
      mockPrisma.productFamily_TE.findUnique.mockResolvedValue(
        createMockPrismaProductFamilyTE({ name: 'Frozen Desserts' }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).not.toBeNull()
      expect(result!.name).toBe('Frozen Desserts')
      expect(result!.id.value).toBe(ANY_ID)
      expect(result!.tenantId).toBe(TENANT_ID)
    })

    it('should return null when not found', async () => {
      mockPrisma.productFamily_TE.findUnique.mockResolvedValue(null)

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })

    it('should return null when entity is DELETED', async () => {
      mockPrisma.productFamily_TE.findUnique.mockResolvedValue(
        createMockPrismaProductFamilyTE({ systemState: 'DELETED' }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })

    it('should filter by tenantId for tenant-scoped context', async () => {
      const whereSpy = jest.fn()
      mockPrisma.productFamily_TE.findUnique.mockImplementation(
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
      mockPrisma.productFamily_TE.findMany.mockResolvedValue([
        createMockPrismaProductFamilyTE({
          id: '550e8400-e29b-41d4-a716-446655440100',
          name: 'Family A',
        }),
        createMockPrismaProductFamilyTE({
          id: '550e8400-e29b-41d4-a716-446655440101',
          name: 'Family B',
        }),
      ])

      const result = await repo.findAll({}, ctx)

      expect(result).toHaveLength(2)
      expect(result[0]!.name).toBe('Family A')
      expect(result[1]!.name).toBe('Family B')
    })

    it('should filter by name', async () => {
      const whereSpy = jest.fn()
      mockPrisma.productFamily_TE.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({ name: 'Ice' }, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: { contains: 'Ice', mode: 'insensitive' },
        }),
      )
    })

    it('should exclude DELETED entities for tenant context', async () => {
      const whereSpy = jest.fn()
      mockPrisma.productFamily_TE.findMany.mockImplementation(
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
      mockPrisma.productFamily_TE.findMany.mockImplementation(
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
      mockPrisma.productFamily_TE.update.mockResolvedValue({})

      await repo.delete(ANY_ID, ctx)

      expect(mockPrisma.productFamily_TE.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: ANY_ID, tenantId: TENANT_ID },
          data: expect.objectContaining({
            systemState: SystemState.DELETED,
          }),
        }),
      )
    })

    it('should not apply tenantId filter for platform context', async () => {
      mockPrisma.productFamily_TE.update.mockResolvedValue({})

      await repo.delete(ANY_ID, platformCtx)

      expect(mockPrisma.productFamily_TE.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: ANY_ID },
        }),
      )
    })
  })
})
