/**
 * TechnicalSourceType_PL Repository Tests
 *
 * Platform-scoped (PL) repository — no tenantId filtering.
 * Tests the PrismaTechnicalSourceType_PLRepository CRUD operations and mapper.
 */

import { SystemState } from '@shared/behaviours/lockable'
import { createPlatformContext } from '../../test-utils'

import { TechnicalSourceType_PL } from './technical-source-type-pl.entity'
import { PrismaTechnicalSourceType_PLRepository } from './technical-source-type-pl.repository'

const ANY_ID = '550e8400-e29b-41d4-a716-446655440003'
const ctx = createPlatformContext()

function createEntity(overrides: Partial<Record<string, unknown>> = {}) {
  return TechnicalSourceType_PL.create({
    code: (overrides.code as string) ?? 'LAB_REPORT',
    name: (overrides.name as string) ?? 'Lab Report',
    description: (overrides.description as string | null) ?? null,
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
    code: (overrides.code as string) ?? 'LAB_REPORT',
    name: (overrides.name as string) ?? 'Lab Report',
    description: (overrides.description as string | null) ?? null,
  }
}

describe('PrismaTechnicalSourceType_PLRepository', () => {
  let mockPrisma: any
  let repo: PrismaTechnicalSourceType_PLRepository

  beforeEach(() => {
    mockPrisma = {
      technicalSourceType_PL: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
    }
    repo = new PrismaTechnicalSourceType_PLRepository(mockPrisma as any)
  })

  // ============================================================
  // save
  // ============================================================
  describe('save', () => {
    it('should upsert entity and return it', async () => {
      mockPrisma.technicalSourceType_PL.upsert.mockResolvedValue({})
      const entity = createEntity({ code: 'COA' })

      const result = await repo.save(entity, ctx)

      expect(mockPrisma.technicalSourceType_PL.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: entity.id.value },
          update: expect.objectContaining({ code: 'COA' }),
          create: expect.objectContaining({ code: 'COA' }),
        }),
      )
      expect(result).toBe(entity)
    })

    it('should persist all domain properties (toPersistence)', async () => {
      mockPrisma.technicalSourceType_PL.upsert.mockResolvedValue({})
      const entity = createEntity({
        code: 'INVOICE',
        name: 'Supplier Invoice',
        description: 'Official supplier invoice document',
      })

      await repo.save(entity, ctx)

      const [args] = mockPrisma.technicalSourceType_PL.upsert.mock.calls[0]
      expect(args.create).toMatchObject({
        id: entity.id.value,
        code: 'INVOICE',
        name: 'Supplier Invoice',
        description: 'Official supplier invoice document',
        systemState: SystemState.ACTIVE,
      })
    })
  })

  // ============================================================
  // findById
  // ============================================================
  describe('findById', () => {
    it('should return domain entity when found (toDomain)', async () => {
      mockPrisma.technicalSourceType_PL.findUnique.mockResolvedValue(
        createMockPrismaEntity({ name: 'Technical Sheet' }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).not.toBeNull()
      expect(result!.name).toBe('Technical Sheet')
      expect(result!.id.value).toBe(ANY_ID)
    })

    it('should return null when not found', async () => {
      mockPrisma.technicalSourceType_PL.findUnique.mockResolvedValue(null)

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })

    it('should return null when entity is DELETED', async () => {
      mockPrisma.technicalSourceType_PL.findUnique.mockResolvedValue(
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
      mockPrisma.technicalSourceType_PL.findMany.mockResolvedValue([
        createMockPrismaEntity({ id: '550e8400-e29b-41d4-a716-446655440100', code: 'A' }),
        createMockPrismaEntity({ id: '550e8400-e29b-41d4-a716-446655440101', code: 'B' }),
      ])

      const result = await repo.findAll({}, ctx)

      expect(result).toHaveLength(2)
      expect(result[0]!.code).toBe('A')
      expect(result[1]!.code).toBe('B')
    })

    it('should exclude DELETED entities by default', async () => {
      const whereSpy = jest.fn()
      mockPrisma.technicalSourceType_PL.findMany.mockImplementation(
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
      mockPrisma.technicalSourceType_PL.findMany.mockResolvedValue([])

      await repo.findAll({}, ctx)

      expect(mockPrisma.technicalSourceType_PL.findMany).toHaveBeenCalledWith(
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
      mockPrisma.technicalSourceType_PL.update.mockResolvedValue({})

      await repo.delete(ANY_ID, ctx)

      expect(mockPrisma.technicalSourceType_PL.update).toHaveBeenCalledWith(
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
