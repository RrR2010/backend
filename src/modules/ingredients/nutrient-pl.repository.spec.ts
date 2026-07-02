/**
 * Nutrient_PL Repository Tests
 *
 * Platform-scoped (PL) repository — no tenantId filtering.
 * Tests the PrismaNutrient_PLRepository CRUD operations and mapper.
 */

import { SystemState } from '@shared/behaviours/lockable'
import { createPlatformContext } from '../../test-utils'

import { Nutrient_PL } from './nutrient-pl.entity'
import { PrismaNutrient_PLRepository } from './nutrient-pl.repository'

const ANY_ID = '550e8400-e29b-41d4-a716-446655440001'
const ctx = createPlatformContext()

function createNutrientEntity(overrides: Partial<Record<string, unknown>> = {}) {
  return Nutrient_PL.create({
    name: (overrides.name as string) ?? 'Test Nutrient',
    unit: (overrides.unit as string) ?? 'G',
    category: (overrides.category as string) ?? 'MACRO',
    parentId: (overrides.parentId as string | null) ?? null,
    level: (overrides.level as number) ?? 1,
    sortOrder: (overrides.sortOrder as number) ?? 1,
    regulatoryRef: (overrides.regulatoryRef as string | null) ?? null,
  })
}

function createMockPrismaNutrientPL(
  overrides: Partial<Record<string, unknown>> = {},
) {
  return {
    id: (overrides.id as string) ?? ANY_ID,
    createdAt: (overrides.createdAt as Date) ?? new Date(),
    updatedAt: (overrides.updatedAt as Date) ?? new Date(),
    systemState: (overrides.systemState as string) ?? 'ACTIVE',
    name: (overrides.name as string) ?? 'Protein',
    unit: (overrides.unit as string) ?? 'G',
    category: (overrides.category as string) ?? 'MACRO',
    parentId: (overrides.parentId as string | null) ?? null,
    level: (overrides.level as number) ?? 1,
    sortOrder: (overrides.sortOrder as number) ?? 1,
    regulatoryRef: (overrides.regulatoryRef as string | null) ?? null,
    createdBy: (overrides.createdBy as string | null) ?? null,
    updatedBy: (overrides.updatedBy as string | null) ?? null,
  }
}

describe('PrismaNutrient_PLRepository', () => {
  let mockPrisma: any
  let repo: PrismaNutrient_PLRepository

  beforeEach(() => {
    mockPrisma = {
      nutrient_PL: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
    }
    repo = new PrismaNutrient_PLRepository(mockPrisma as any)
  })

  // ============================================================
  // save
  // ============================================================
  describe('save', () => {
    it('should upsert entity and return it', async () => {
      mockPrisma.nutrient_PL.upsert.mockResolvedValue({})
      const entity = createNutrientEntity({ name: 'Fiber' })

      const result = await repo.save(entity, ctx)

      expect(mockPrisma.nutrient_PL.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: entity.id.value },
          update: expect.objectContaining({ name: 'Fiber' }),
          create: expect.objectContaining({ name: 'Fiber' }),
        }),
      )
      expect(result).toBe(entity)
    })

    it('should persist all domain properties (toPersistence)', async () => {
      mockPrisma.nutrient_PL.upsert.mockResolvedValue({})
      const entity = createNutrientEntity({
        name: 'Vitamin C',
        unit: 'MG',
        category: 'VITAMIN',
        level: 2,
        sortOrder: 10,
      })

      await repo.save(entity, ctx)

      const [args] = mockPrisma.nutrient_PL.upsert.mock.calls[0]
      expect(args.create).toMatchObject({
        id: entity.id.value,
        name: 'Vitamin C',
        unit: 'MG',
        category: 'VITAMIN',
        level: 2,
        sortOrder: 10,
        systemState: SystemState.ACTIVE,
      })
    })
  })

  // ============================================================
  // findById
  // ============================================================
  describe('findById', () => {
    it('should return domain entity when found (toDomain)', async () => {
      mockPrisma.nutrient_PL.findUnique.mockResolvedValue(
        createMockPrismaNutrientPL({ name: 'Calcium' }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).not.toBeNull()
      expect(result!.name).toBe('Calcium')
      expect(result!.id.value).toBe(ANY_ID)
    })

    it('should return null when not found', async () => {
      mockPrisma.nutrient_PL.findUnique.mockResolvedValue(null)

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })

    it('should return null when entity is DELETED', async () => {
      mockPrisma.nutrient_PL.findUnique.mockResolvedValue(
        createMockPrismaNutrientPL({ systemState: 'DELETED' }),
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
      mockPrisma.nutrient_PL.findMany.mockResolvedValue([
        createMockPrismaNutrientPL({ id: '550e8400-e29b-41d4-a716-446655440100', name: 'A' }),
        createMockPrismaNutrientPL({ id: '550e8400-e29b-41d4-a716-446655440101', name: 'B' }),
      ])

      const result = await repo.findAll({}, ctx)

      expect(result).toHaveLength(2)
      expect(result[0]!.name).toBe('A')
      expect(result[1]!.name).toBe('B')
    })

    it('should filter by unit when provided', async () => {
      const whereSpy = jest.fn()
      mockPrisma.nutrient_PL.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({ unit: 'G' }, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({ unit: 'G' }),
      )
    })

    it('should filter by category when provided', async () => {
      const whereSpy = jest.fn()
      mockPrisma.nutrient_PL.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({ category: 'MACRO' }, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'MACRO' }),
      )
    })

    it('should exclude DELETED entities by default', async () => {
      const whereSpy = jest.fn()
      mockPrisma.nutrient_PL.findMany.mockImplementation(
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

    it('should apply default pagination', async () => {
      mockPrisma.nutrient_PL.findMany.mockResolvedValue([])

      await repo.findAll({}, ctx)

      expect(mockPrisma.nutrient_PL.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 50,
        }),
      )
    })

    it('should order results by sortOrder ascending', async () => {
      mockPrisma.nutrient_PL.findMany.mockResolvedValue([])

      await repo.findAll({}, ctx)

      expect(mockPrisma.nutrient_PL.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { sortOrder: 'asc' },
        }),
      )
    })
  })

  // ============================================================
  // findByParentId
  // ============================================================
  describe('findByParentId', () => {
    it('should return children for a given parentId', async () => {
      const parentId = 'parent-123'
      mockPrisma.nutrient_PL.findMany.mockResolvedValue([
        createMockPrismaNutrientPL({
          id: '550e8400-e29b-41d4-a716-446655440200',
          name: 'Saturated Fat',
          parentId,
        }),
        createMockPrismaNutrientPL({
          id: '550e8400-e29b-41d4-a716-446655440201',
          name: 'Unsaturated Fat',
          parentId,
        }),
      ])

      const result = await repo.findByParentId(parentId, ctx)

      expect(result).toHaveLength(2)
      expect(result[0]!.name).toBe('Saturated Fat')
      expect(result[1]!.name).toBe('Unsaturated Fat')

      expect(mockPrisma.nutrient_PL.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ parentId }),
        }),
      )
    })

    it('should exclude DELETED entities', async () => {
      const whereSpy = jest.fn()
      mockPrisma.nutrient_PL.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findByParentId('parent-456', ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          systemState: { not: SystemState.DELETED },
        }),
      )
    })

    it('should return empty array when parent has no children', async () => {
      mockPrisma.nutrient_PL.findMany.mockResolvedValue([])

      const result = await repo.findByParentId('orphan-parent', ctx)

      expect(result).toEqual([])
    })
  })

  // ============================================================
  // findRoots
  // ============================================================
  describe('findRoots', () => {
    it('should return root nutrients where parentId is null', async () => {
      mockPrisma.nutrient_PL.findMany.mockResolvedValue([
        createMockPrismaNutrientPL({
          id: '550e8400-e29b-41d4-a716-446655440300',
          name: 'Carbohydrates',
          parentId: null,
          level: 0,
        }),
        createMockPrismaNutrientPL({
          id: '550e8400-e29b-41d4-a716-446655440301',
          name: 'Fats',
          parentId: null,
          level: 0,
        }),
      ])

      const result = await repo.findRoots(ctx)

      expect(result).toHaveLength(2)
      expect(result[0]!.name).toBe('Carbohydrates')
      expect(result[1]!.name).toBe('Fats')
    })

    it('should filter by parentId IS NULL', async () => {
      const whereSpy = jest.fn()
      mockPrisma.nutrient_PL.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findRoots(ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          parentId: null,
          systemState: { not: SystemState.DELETED },
        }),
      )
    })

    it('should order roots by sortOrder ascending', async () => {
      mockPrisma.nutrient_PL.findMany.mockResolvedValue([])

      await repo.findRoots(ctx)

      expect(mockPrisma.nutrient_PL.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { sortOrder: 'asc' },
        }),
      )
    })

    it('should return empty array when no roots exist', async () => {
      mockPrisma.nutrient_PL.findMany.mockResolvedValue([])

      const result = await repo.findRoots(ctx)

      expect(result).toEqual([])
    })
  })

  // ============================================================
  // delete
  // ============================================================
  describe('delete', () => {
    it('should soft-delete by updating systemState to DELETED', async () => {
      mockPrisma.nutrient_PL.update.mockResolvedValue({})

      await repo.delete(ANY_ID, ctx)

      expect(mockPrisma.nutrient_PL.update).toHaveBeenCalledWith(
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
