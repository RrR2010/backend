/**
 * UnitOfMeasure_PL Repository Tests
 *
 * Platform-scoped (PL) repository — no tenantId filtering.
 * Tests the PrismaUnitOfMeasure_PLRepository CRUD operations and mapper.
 */

import { SystemState } from '@shared/behaviours/lockable'
import { createPlatformContext } from '../../test-utils'

import { UnitOfMeasure_PL } from './unit-of-measure-pl.entity'
import { PrismaUnitOfMeasure_PLRepository } from './unit-of-measure-pl.repository'

const ANY_ID = '550e8400-e29b-41d4-a716-446655440007'
const ctx = createPlatformContext()

function createEntity(overrides: Partial<Record<string, unknown>> = {}) {
  return UnitOfMeasure_PL.create({
    code: (overrides.code as string) ?? 'KG',
    symbol: (overrides.symbol as string | null) ?? 'kg',
    measurementType: (overrides.measurementType as string) ?? 'WEIGHT',
    measurementSystem: (overrides.measurementSystem as string) ?? 'METRIC',
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
    code: (overrides.code as string) ?? 'KG',
    symbol: (overrides.symbol as string | null) ?? 'kg',
    measurementType: (overrides.measurementType as string) ?? 'WEIGHT',
    measurementSystem: (overrides.measurementSystem as string) ?? 'METRIC',
    createdBy: (overrides.createdBy as string | null) ?? null,
    updatedBy: (overrides.updatedBy as string | null) ?? null,
  }
}

describe('PrismaUnitOfMeasure_PLRepository', () => {
  let mockPrisma: any
  let repo: PrismaUnitOfMeasure_PLRepository

  beforeEach(() => {
    mockPrisma = {
      unitOfMeasure_PL: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
    }
    repo = new PrismaUnitOfMeasure_PLRepository(mockPrisma as any)
  })

  // ============================================================
  // save
  // ============================================================
  describe('save', () => {
    it('should upsert entity and return it', async () => {
      mockPrisma.unitOfMeasure_PL.upsert.mockResolvedValue({})
      const entity = createEntity({ code: 'L' })

      const result = await repo.save(entity, ctx)

      expect(mockPrisma.unitOfMeasure_PL.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: entity.id.value },
          update: expect.objectContaining({ code: 'L' }),
          create: expect.objectContaining({ code: 'L' }),
        }),
      )
      expect(result).toBe(entity)
    })

    it('should persist all domain properties (toPersistence)', async () => {
      mockPrisma.unitOfMeasure_PL.upsert.mockResolvedValue({})
      const entity = createEntity({
        code: 'G',
        symbol: 'g',
        measurementType: 'WEIGHT',
        measurementSystem: 'METRIC',
      })

      await repo.save(entity, ctx)

      const [args] = mockPrisma.unitOfMeasure_PL.upsert.mock.calls[0]
      expect(args.create).toMatchObject({
        id: entity.id.value,
        code: 'G',
        symbol: 'g',
        measurementType: 'WEIGHT',
        measurementSystem: 'METRIC',
        systemState: SystemState.ACTIVE,
      })
    })
  })

  // ============================================================
  // findById
  // ============================================================
  describe('findById', () => {
    it('should return domain entity when found (toDomain)', async () => {
      mockPrisma.unitOfMeasure_PL.findUnique.mockResolvedValue(
        createMockPrismaEntity({ code: 'ML', symbol: 'ml' }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).not.toBeNull()
      expect(result!.code).toBe('ML')
      expect(result!.symbol).toBe('ml')
      expect(result!.id.value).toBe(ANY_ID)
    })

    it('should return null when not found', async () => {
      mockPrisma.unitOfMeasure_PL.findUnique.mockResolvedValue(null)

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })

    it('should return null when entity is DELETED', async () => {
      mockPrisma.unitOfMeasure_PL.findUnique.mockResolvedValue(
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
      mockPrisma.unitOfMeasure_PL.findMany.mockResolvedValue([
        createMockPrismaEntity({ id: '550e8400-e29b-41d4-a716-446655440100', code: 'KG' }),
        createMockPrismaEntity({ id: '550e8400-e29b-41d4-a716-446655440101', code: 'G' }),
      ])

      const result = await repo.findAll({}, ctx)

      expect(result).toHaveLength(2)
      expect(result[0]!.code).toBe('KG')
      expect(result[1]!.code).toBe('G')
    })

    it('should filter by measurementType when provided', async () => {
      const whereSpy = jest.fn()
      mockPrisma.unitOfMeasure_PL.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({ measurementType: 'VOLUME' }, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({ measurementType: 'VOLUME' }),
      )
    })

    it('should filter by measurementSystem when provided', async () => {
      const whereSpy = jest.fn()
      mockPrisma.unitOfMeasure_PL.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({ measurementSystem: 'IMPERIAL' }, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({ measurementSystem: 'IMPERIAL' }),
      )
    })

    it('should exclude DELETED entities by default', async () => {
      const whereSpy = jest.fn()
      mockPrisma.unitOfMeasure_PL.findMany.mockImplementation(
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
      mockPrisma.unitOfMeasure_PL.findMany.mockResolvedValue([])

      await repo.findAll({}, ctx)

      expect(mockPrisma.unitOfMeasure_PL.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 50,
        }),
      )
    })
  })

  // ============================================================
  // delete
  // ============================================================
  describe('delete', () => {
    it('should soft-delete by updating systemState to DELETED', async () => {
      mockPrisma.unitOfMeasure_PL.update.mockResolvedValue({})

      await repo.delete(ANY_ID, ctx)

      expect(mockPrisma.unitOfMeasure_PL.update).toHaveBeenCalledWith(
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
