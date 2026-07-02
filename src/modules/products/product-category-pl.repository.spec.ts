/**
 * ProductCategory_PL Repository Tests
 *
 * Platform-scoped (PL) repository — no tenantId filtering.
 * Tests the PrismaProductCategory_PLRepository CRUD operations and mapper.
 */

import { SystemState } from '@shared/behaviours/lockable'
import { createPlatformContext } from '../../test-utils'

import { ProductCategory_PL } from './product-category-pl.entity'
import { PrismaProductCategory_PLRepository } from './product-category-pl.repository'

const ANY_ID = '550e8400-e29b-41d4-a716-446655440005'
const ctx = createPlatformContext()

function createEntity(overrides: Partial<Record<string, unknown>> = {}) {
  return ProductCategory_PL.create({
    code: (overrides.code as string) ?? 'CAT_A',
    name: (overrides.name as string) ?? 'Category A',
    description: (overrides.description as string | null) ?? null,
    sequentialNumber: (overrides.sequentialNumber as number) ?? 1,
  })
}

function createMockPrismaEntity(
  overrides: Partial<Record<string, unknown>> = {},
) {
  return {
    id: (overrides.id as string) ?? ANY_ID,
    createdAt: (overrides.createdAt as Date) ?? new Date(),
    updatedAt: (overrides.updatedAt as Date) ?? new Date(),
    systemState: (overrides.systemState as string) ?? 'ACTIVE',
    code: (overrides.code as string) ?? 'CAT_A',
    name: (overrides.name as string) ?? 'Category A',
    description: (overrides.description as string | null) ?? null,
    sequentialNumber: (overrides.sequentialNumber as number) ?? 1,
  }
}

describe('PrismaProductCategory_PLRepository', () => {
  let mockPrisma: any
  let repo: PrismaProductCategory_PLRepository

  beforeEach(() => {
    mockPrisma = {
      productCategory_PL: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
    }
    repo = new PrismaProductCategory_PLRepository(mockPrisma as any)
  })

  // ============================================================
  // save
  // ============================================================
  describe('save', () => {
    it('should upsert entity and return it', async () => {
      mockPrisma.productCategory_PL.upsert.mockResolvedValue({})
      const entity = createEntity({ code: 'CAT_B' })

      const result = await repo.save(entity, ctx)

      expect(mockPrisma.productCategory_PL.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: entity.id.value },
          update: expect.objectContaining({ code: 'CAT_B' }),
          create: expect.objectContaining({ code: 'CAT_B' }),
        }),
      )
      expect(result).toBe(entity)
    })

    it('should persist all domain properties (toPersistence)', async () => {
      mockPrisma.productCategory_PL.upsert.mockResolvedValue({})
      const entity = createEntity({
        code: 'CAT_X',
        name: 'Premium Category',
        description: 'High-end products',
        sequentialNumber: 10,
      })

      await repo.save(entity, ctx)

      const [args] = mockPrisma.productCategory_PL.upsert.mock.calls[0]
      expect(args.create).toMatchObject({
        id: entity.id.value,
        code: 'CAT_X',
        name: 'Premium Category',
        description: 'High-end products',
        sequentialNumber: 10,
        systemState: SystemState.ACTIVE,
      })
    })
  })

  // ============================================================
  // findById
  // ============================================================
  describe('findById', () => {
    it('should return domain entity when found (toDomain)', async () => {
      mockPrisma.productCategory_PL.findUnique.mockResolvedValue(
        createMockPrismaEntity({ name: 'Ice Cream' }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).not.toBeNull()
      expect(result!.name).toBe('Ice Cream')
      expect(result!.id.value).toBe(ANY_ID)
    })

    it('should return null when not found', async () => {
      mockPrisma.productCategory_PL.findUnique.mockResolvedValue(null)

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })

    it('should return null when entity is DELETED', async () => {
      mockPrisma.productCategory_PL.findUnique.mockResolvedValue(
        createMockPrismaEntity({ systemState: 'DELETED' }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })
  })

  // ============================================================
  // findAll
  // ============================================================
  describe('findAll', () => {
    it('should return all active entities by default', async () => {
      mockPrisma.productCategory_PL.findMany.mockResolvedValue([
        createMockPrismaEntity({ id: '550e8400-e29b-41d4-a716-446655440100', code: 'A' }),
        createMockPrismaEntity({ id: '550e8400-e29b-41d4-a716-446655440101', code: 'B' }),
      ])

      const result = await repo.findAll({}, ctx)

      expect(result).toHaveLength(2)
      expect(result[0]!.code).toBe('A')
      expect(result[1]!.code).toBe('B')
    })

    it('should filter by code when provided', async () => {
      const whereSpy = jest.fn()
      mockPrisma.productCategory_PL.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({ code: 'CAT' }, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: { contains: 'CAT', mode: 'insensitive' },
        }),
      )
    })

    it('should exclude DELETED entities by default', async () => {
      const whereSpy = jest.fn()
      mockPrisma.productCategory_PL.findMany.mockImplementation(
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
  })

  // ============================================================
  // delete
  // ============================================================
  describe('delete', () => {
    it('should soft-delete by updating systemState to DELETED', async () => {
      mockPrisma.productCategory_PL.update.mockResolvedValue({})

      await repo.delete(ANY_ID, ctx)

      expect(mockPrisma.productCategory_PL.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: ANY_ID },
          data: expect.objectContaining({
            systemState: SystemState.DELETED,
          }),
        }),
      )
    })
  })
})
