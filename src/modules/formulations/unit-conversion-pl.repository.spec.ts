/**
 * UnitConversion_PL Repository Tests
 *
 * Platform-scoped (PL) repository — no tenantId filtering.
 * Tests the PrismaUnitConversion_PLRepository CRUD operations, mapper,
 * and extra query methods (findByFromUnit, findByToUnit).
 */

import { SystemState } from '@shared/behaviours/lockable'
import { createPlatformContext } from '../../test-utils'

import { UnitConversion_PL } from './unit-conversion-pl.entity'
import { PrismaUnitConversion_PLRepository } from './unit-conversion-pl.repository'

const ANY_ID = '550e8400-e29b-41d4-a716-446655440008'
const FROM_UNIT_ID = '550e8400-e29b-41d4-a716-446655440010'
const TO_UNIT_ID = '550e8400-e29b-41d4-a716-446655440011'
const ctx = createPlatformContext()

function createEntity(overrides: Partial<Record<string, unknown>> = {}) {
  return UnitConversion_PL.create({
    fromUnitId: (overrides.fromUnitId as string) ?? FROM_UNIT_ID,
    toUnitId: (overrides.toUnitId as string) ?? TO_UNIT_ID,
    factor: (overrides.factor as number) ?? 1.0,
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
    fromUnitId: (overrides.fromUnitId as string) ?? FROM_UNIT_ID,
    toUnitId: (overrides.toUnitId as string) ?? TO_UNIT_ID,
    factor: (overrides.factor as number) ?? 1.0,
    createdBy: (overrides.createdBy as string | null) ?? null,
    updatedBy: (overrides.updatedBy as string | null) ?? null,
  }
}

describe('PrismaUnitConversion_PLRepository', () => {
  let mockPrisma: any
  let repo: PrismaUnitConversion_PLRepository

  beforeEach(() => {
    mockPrisma = {
      unitConversion_PL: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
    }
    repo = new PrismaUnitConversion_PLRepository(mockPrisma as any)
  })

  // ============================================================
  // save
  // ============================================================
  describe('save', () => {
    it('should upsert entity and return it', async () => {
      mockPrisma.unitConversion_PL.upsert.mockResolvedValue({})
      const entity = createEntity({ factor: 1000 })

      const result = await repo.save(entity, ctx)

      expect(mockPrisma.unitConversion_PL.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: entity.id.value },
          update: expect.objectContaining({ factor: 1000 }),
          create: expect.objectContaining({ factor: 1000 }),
        }),
      )
      expect(result).toBe(entity)
    })

    it('should persist all domain properties (toPersistence)', async () => {
      mockPrisma.unitConversion_PL.upsert.mockResolvedValue({})
      const entity = createEntity({
        fromUnitId: FROM_UNIT_ID,
        toUnitId: TO_UNIT_ID,
        factor: 2.20462,
      })

      await repo.save(entity, ctx)

      const [args] = mockPrisma.unitConversion_PL.upsert.mock.calls[0]
      expect(args.create).toMatchObject({
        id: entity.id.value,
        fromUnitId: FROM_UNIT_ID,
        toUnitId: TO_UNIT_ID,
        factor: 2.20462,
        systemState: SystemState.ACTIVE,
      })
    })
  })

  // ============================================================
  // findById
  // ============================================================
  describe('findById', () => {
    it('should return domain entity when found (toDomain)', async () => {
      mockPrisma.unitConversion_PL.findUnique.mockResolvedValue(
        createMockPrismaEntity({ factor: 453.592 }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).not.toBeNull()
      expect(result!.factor).toBe(453.592)
      expect(result!.id.value).toBe(ANY_ID)
    })

    it('should return null when not found', async () => {
      mockPrisma.unitConversion_PL.findUnique.mockResolvedValue(null)

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })

    it('should return null when entity is DELETED', async () => {
      mockPrisma.unitConversion_PL.findUnique.mockResolvedValue(
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
      mockPrisma.unitConversion_PL.findMany.mockResolvedValue([
        createMockPrismaEntity({ id: '550e8400-e29b-41d4-a716-446655440100', factor: 1 }),
        createMockPrismaEntity({ id: '550e8400-e29b-41d4-a716-446655440101', factor: 1000 }),
      ])

      const result = await repo.findAll({}, ctx)

      expect(result).toHaveLength(2)
      expect(result[0]!.factor).toBe(1)
      expect(result[1]!.factor).toBe(1000)
    })

    it('should filter by fromUnitId when provided', async () => {
      const whereSpy = jest.fn()
      mockPrisma.unitConversion_PL.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({ fromUnitId: FROM_UNIT_ID }, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({ fromUnitId: FROM_UNIT_ID }),
      )
    })

    it('should filter by toUnitId when provided', async () => {
      const whereSpy = jest.fn()
      mockPrisma.unitConversion_PL.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({ toUnitId: TO_UNIT_ID }, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({ toUnitId: TO_UNIT_ID }),
      )
    })

    it('should exclude DELETED entities by default', async () => {
      const whereSpy = jest.fn()
      mockPrisma.unitConversion_PL.findMany.mockImplementation(
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
      mockPrisma.unitConversion_PL.findMany.mockResolvedValue([])

      await repo.findAll({}, ctx)

      expect(mockPrisma.unitConversion_PL.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 50,
        }),
      )
    })
  })

  // ============================================================
  // findByFromUnit
  // ============================================================
  describe('findByFromUnit', () => {
    it('should return conversions with matching fromUnitId', async () => {
      mockPrisma.unitConversion_PL.findMany.mockResolvedValue([
        createMockPrismaEntity({ id: '550e8400-e29b-41d4-a716-446655440200', fromUnitId: FROM_UNIT_ID, factor: 1000 }),
        createMockPrismaEntity({ id: '550e8400-e29b-41d4-a716-446655440201', fromUnitId: FROM_UNIT_ID, factor: 453.592 }),
      ])

      const result = await repo.findByFromUnit(FROM_UNIT_ID, ctx)

      expect(result).toHaveLength(2)
      expect(mockPrisma.unitConversion_PL.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            fromUnitId: FROM_UNIT_ID,
            systemState: { not: SystemState.DELETED },
          }),
        }),
      )
    })
  })

  // ============================================================
  // findByToUnit
  // ============================================================
  describe('findByToUnit', () => {
    it('should return conversions with matching toUnitId', async () => {
      mockPrisma.unitConversion_PL.findMany.mockResolvedValue([
        createMockPrismaEntity({ id: '550e8400-e29b-41d4-a716-446655440300', toUnitId: TO_UNIT_ID, factor: 0.001 }),
      ])

      const result = await repo.findByToUnit(TO_UNIT_ID, ctx)

      expect(result).toHaveLength(1)
      expect(mockPrisma.unitConversion_PL.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            toUnitId: TO_UNIT_ID,
            systemState: { not: SystemState.DELETED },
          }),
        }),
      )
    })
  })

  // ============================================================
  // delete
  // ============================================================
  describe('delete', () => {
    it('should soft-delete by updating systemState to DELETED', async () => {
      mockPrisma.unitConversion_PL.update.mockResolvedValue({})

      await repo.delete(ANY_ID, ctx)

      expect(mockPrisma.unitConversion_PL.update).toHaveBeenCalledWith(
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
