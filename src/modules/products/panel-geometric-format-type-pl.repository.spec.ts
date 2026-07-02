/**
 * PanelGeometricFormatType_PL Repository Tests
 *
 * Platform-scoped (PL) repository — no tenantId filtering.
 * Tests the PrismaPanelGeometricFormatType_PLRepository CRUD operations and mapper.
 */

import { SystemState } from '@shared/behaviours/lockable'
import { createPlatformContext } from '../../test-utils'

import { PanelGeometricFormatType_PL } from './panel-geometric-format-type-pl.entity'
import { PrismaPanelGeometricFormatType_PLRepository } from './panel-geometric-format-type-pl.repository'

const ANY_ID = '550e8400-e29b-41d4-a716-446655440006'
const ctx = createPlatformContext()

function createEntity(overrides: Partial<Record<string, unknown>> = {}) {
  return PanelGeometricFormatType_PL.create({
    formatName: (overrides.formatName as string) ?? 'Rectangle',
    valueFields: (overrides.valueFields as Record<string, unknown> | null) ?? null,
    calculationFormula: (overrides.calculationFormula as string | null) ?? null,
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
    formatName: (overrides.formatName as string) ?? 'Rectangle',
    valueFields: (overrides.valueFields as Record<string, unknown> | null) ?? null,
    calculationFormula: (overrides.calculationFormula as string | null) ?? null,
  }
}

describe('PrismaPanelGeometricFormatType_PLRepository', () => {
  let mockPrisma: any
  let repo: PrismaPanelGeometricFormatType_PLRepository

  beforeEach(() => {
    mockPrisma = {
      panelGeometricFormatType_PL: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
    }
    repo = new PrismaPanelGeometricFormatType_PLRepository(mockPrisma as any)
  })

  // ============================================================
  // save
  // ============================================================
  describe('save', () => {
    it('should upsert entity and return it', async () => {
      mockPrisma.panelGeometricFormatType_PL.upsert.mockResolvedValue({})
      const entity = createEntity({ formatName: 'Cylinder' })

      const result = await repo.save(entity, ctx)

      expect(mockPrisma.panelGeometricFormatType_PL.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: entity.id.value },
          update: expect.objectContaining({ formatName: 'Cylinder' }),
          create: expect.objectContaining({ formatName: 'Cylinder' }),
        }),
      )
      expect(result).toBe(entity)
    })

    it('should persist all domain properties (toPersistence)', async () => {
      mockPrisma.panelGeometricFormatType_PL.upsert.mockResolvedValue({})
      const entity = createEntity({
        formatName: 'Cone',
        valueFields: { height: 'number', radius: 'number' },
        calculationFormula: '(1/3) * pi * r^2 * h',
      })

      await repo.save(entity, ctx)

      const [args] = mockPrisma.panelGeometricFormatType_PL.upsert.mock.calls[0]
      expect(args.create).toMatchObject({
        id: entity.id.value,
        formatName: 'Cone',
        valueFields: { height: 'number', radius: 'number' },
        calculationFormula: '(1/3) * pi * r^2 * h',
        systemState: SystemState.ACTIVE,
      })
    })

    it('should convert valueFields to JSON', async () => {
      mockPrisma.panelGeometricFormatType_PL.upsert.mockResolvedValue({})
      const valueFields = { width: 'number', length: 'number' }
      const entity = createEntity({
        formatName: 'Rectangle',
        valueFields,
        calculationFormula: null,
      })

      await repo.save(entity, ctx)

      const [args] = mockPrisma.panelGeometricFormatType_PL.upsert.mock.calls[0]
      // The toPersistence mapper should cast valueFields as Prisma.InputJsonValue
      expect(args.create.valueFields).toEqual(valueFields)
    })
  })

  // ============================================================
  // findById
  // ============================================================
  describe('findById', () => {
    it('should return domain entity when found (toDomain)', async () => {
      const mockValueFields = { width: 'number', height: 'number' }
      mockPrisma.panelGeometricFormatType_PL.findUnique.mockResolvedValue(
        createMockPrismaEntity({
          formatName: 'Square',
          valueFields: mockValueFields,
        }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).not.toBeNull()
      expect(result!.formatName).toBe('Square')
      expect(result!.valueFields).toEqual(mockValueFields)
      expect(result!.id.value).toBe(ANY_ID)
    })

    it('should return null when not found', async () => {
      mockPrisma.panelGeometricFormatType_PL.findUnique.mockResolvedValue(null)

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })

    it('should return null when entity is DELETED', async () => {
      mockPrisma.panelGeometricFormatType_PL.findUnique.mockResolvedValue(
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
      mockPrisma.panelGeometricFormatType_PL.findMany.mockResolvedValue([
        createMockPrismaEntity({ id: '550e8400-e29b-41d4-a716-446655440100', formatName: 'A' }),
        createMockPrismaEntity({ id: '550e8400-e29b-41d4-a716-446655440101', formatName: 'B' }),
      ])

      const result = await repo.findAll({}, ctx)

      expect(result).toHaveLength(2)
      expect(result[0]!.formatName).toBe('A')
      expect(result[1]!.formatName).toBe('B')
    })

    it('should filter by formatName when provided', async () => {
      const whereSpy = jest.fn()
      mockPrisma.panelGeometricFormatType_PL.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({ formatName: 'Rect' }, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          formatName: { contains: 'Rect', mode: 'insensitive' },
        }),
      )
    })

    it('should exclude DELETED entities by default', async () => {
      const whereSpy = jest.fn()
      mockPrisma.panelGeometricFormatType_PL.findMany.mockImplementation(
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
      mockPrisma.panelGeometricFormatType_PL.update.mockResolvedValue({})

      await repo.delete(ANY_ID, ctx)

      expect(mockPrisma.panelGeometricFormatType_PL.update).toHaveBeenCalledWith(
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
