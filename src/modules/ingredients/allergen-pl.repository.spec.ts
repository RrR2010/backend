/**
 * Allergen_PL Repository Tests
 *
 * Platform-scoped (PL) repository — no tenantId filtering.
 * Tests the PrismaAllergen_PLRepository CRUD operations and mapper.
 */

import { SystemState } from '@shared/behaviours/lockable'
import { createPlatformContext } from '../../test-utils'

import { Allergen_PL } from './allergen-pl.entity'
import { PrismaAllergen_PLRepository } from './allergen-pl.repository'

const ANY_ID = '550e8400-e29b-41d4-a716-446655440000'
const ctx = createPlatformContext()

function createAllergenEntity(overrides: Partial<Record<string, unknown>> = {}) {
  return Allergen_PL.create({
    name: (overrides.name as string) ?? 'Test Allergen',
    category: (overrides.category as string | null) ?? 'FOOD',
    regulatoryRef: (overrides.regulatoryRef as string | null) ?? null,
    sortOrder: (overrides.sortOrder as number) ?? 1,
  })
}

function createMockPrismaAllergenPL(
  overrides: Partial<Record<string, unknown>> = {},
) {
  return {
    id: (overrides.id as string) ?? ANY_ID,
    createdAt: (overrides.createdAt as Date) ?? new Date(),
    updatedAt: (overrides.updatedAt as Date) ?? new Date(),
    systemState: (overrides.systemState as string) ?? 'ACTIVE',
    name: (overrides.name as string) ?? 'Allergen A',
    category: (overrides.category as string | null) ?? 'FOOD',
    regulatoryRef: (overrides.regulatoryRef as string | null) ?? null,
    sortOrder: (overrides.sortOrder as number) ?? 1,
    createdBy: (overrides.createdBy as string | null) ?? null,
    updatedBy: (overrides.updatedBy as string | null) ?? null,
  }
}

describe('PrismaAllergen_PLRepository', () => {
  let mockPrisma: any
  let repo: PrismaAllergen_PLRepository

  beforeEach(() => {
    mockPrisma = {
      allergen_PL: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
    }
    repo = new PrismaAllergen_PLRepository(mockPrisma as any)
  })

  // ============================================================
  // save
  // ============================================================
  describe('save', () => {
    it('should upsert entity and return it', async () => {
      mockPrisma.allergen_PL.upsert.mockResolvedValue({})
      const entity = createAllergenEntity({ name: 'Peanut' })

      const result = await repo.save(entity, ctx)

      expect(mockPrisma.allergen_PL.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: entity.id.value },
          update: expect.objectContaining({ name: 'Peanut' }),
          create: expect.objectContaining({ name: 'Peanut' }),
        }),
      )
      expect(result).toBe(entity)
    })

    it('should persist all domain properties (toPersistence)', async () => {
      mockPrisma.allergen_PL.upsert.mockResolvedValue({})
      const entity = createAllergenEntity({
        name: 'Soy',
        category: 'INGREDIENT',
        regulatoryRef: 'REF-001',
        sortOrder: 5,
      })

      await repo.save(entity, ctx)

      const [args] = mockPrisma.allergen_PL.upsert.mock.calls[0]
      expect(args.create).toMatchObject({
        id: entity.id.value,
        name: 'Soy',
        category: 'INGREDIENT',
        regulatoryRef: 'REF-001',
        sortOrder: 5,
        systemState: SystemState.ACTIVE,
      })
    })
  })

  // ============================================================
  // findById
  // ============================================================
  describe('findById', () => {
    it('should return domain entity when found (toDomain)', async () => {
      mockPrisma.allergen_PL.findUnique.mockResolvedValue(
        createMockPrismaAllergenPL({ name: 'Milk' }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).not.toBeNull()
      expect(result!.name).toBe('Milk')
      expect(result!.id.value).toBe(ANY_ID)
    })

    it('should return null when not found', async () => {
      mockPrisma.allergen_PL.findUnique.mockResolvedValue(null)

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })

    it('should return null when entity is DELETED', async () => {
      mockPrisma.allergen_PL.findUnique.mockResolvedValue(
        createMockPrismaAllergenPL({ systemState: 'DELETED' }),
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
      mockPrisma.allergen_PL.findMany.mockResolvedValue([
        createMockPrismaAllergenPL({ id: '550e8400-e29b-41d4-a716-446655440100', name: 'A', sortOrder: 1 }),
        createMockPrismaAllergenPL({ id: '550e8400-e29b-41d4-a716-446655440101', name: 'B', sortOrder: 2 }),
      ])

      const result = await repo.findAll({}, ctx)

      expect(result).toHaveLength(2)
      expect(result[0]!.name).toBe('A')
      expect(result[1]!.name).toBe('B')
    })

    it('should filter by category', async () => {
      const whereSpy = jest.fn()
      mockPrisma.allergen_PL.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({ category: 'FOOD' }, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          category: { contains: 'FOOD', mode: 'insensitive' },
        }),
      )
    })

    it('should filter by systemState when provided', async () => {
      const whereSpy = jest.fn()
      mockPrisma.allergen_PL.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({ systemState: SystemState.LOCKED }, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          systemState: SystemState.LOCKED,
        }),
      )
    })

    it('should exclude DELETED entities by default', async () => {
      const whereSpy = jest.fn()
      mockPrisma.allergen_PL.findMany.mockImplementation(
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
      mockPrisma.allergen_PL.update.mockResolvedValue({})

      await repo.delete(ANY_ID, ctx)

      expect(mockPrisma.allergen_PL.update).toHaveBeenCalledWith(
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
