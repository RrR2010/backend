/**
 * DeclarationFlag_PL Repository Tests
 *
 * Platform-scoped (PL) repository — no tenantId filtering.
 * Tests the PrismaDeclarationFlag_PLRepository CRUD operations and mapper.
 */

import { SystemState } from '@shared/behaviours/lockable'
import { createPlatformContext } from '../../test-utils'

import { DeclarationFlag_PL } from './declaration-flag-pl.entity'
import { PrismaDeclarationFlag_PLRepository } from './declaration-flag-pl.repository'

const ANY_ID = '550e8400-e29b-41d4-a716-446655440002'
const ctx = createPlatformContext()

function createFlagEntity(overrides: Partial<Record<string, unknown>> = {}) {
  return DeclarationFlag_PL.create({
    code: (overrides.code as string) ?? 'GLUTEN',
    name: (overrides.name as string) ?? 'Contains Gluten',
    description: (overrides.description as string | null) ?? null,
    appliesTo: (overrides.appliesTo as string) ?? 'ALL',
  })
}

function createMockPrismaFlagPL(
  overrides: Partial<Record<string, unknown>> = {},
) {
  return {
    id: (overrides.id as string) ?? ANY_ID,
    createdAt: (overrides.createdAt as Date) ?? new Date(),
    updatedAt: (overrides.updatedAt as Date) ?? new Date(),
    systemState: (overrides.systemState as string) ?? 'ACTIVE',
    code: (overrides.code as string) ?? 'GLUTEN',
    name: (overrides.name as string) ?? 'Contains Gluten',
    description: (overrides.description as string | null) ?? null,
    appliesTo: (overrides.appliesTo as string) ?? 'ALL',
    createdBy: (overrides.createdBy as string | null) ?? null,
    updatedBy: (overrides.updatedBy as string | null) ?? null,
  }
}

describe('PrismaDeclarationFlag_PLRepository', () => {
  let mockPrisma: any
  let repo: PrismaDeclarationFlag_PLRepository

  beforeEach(() => {
    mockPrisma = {
      declarationFlag_PL: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
    }
    repo = new PrismaDeclarationFlag_PLRepository(mockPrisma as any)
  })

  // ============================================================
  // save
  // ============================================================
  describe('save', () => {
    it('should upsert entity and return it', async () => {
      mockPrisma.declarationFlag_PL.upsert.mockResolvedValue({})
      const entity = createFlagEntity({ code: 'LACTOSE' })

      const result = await repo.save(entity, ctx)

      expect(mockPrisma.declarationFlag_PL.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: entity.id.value },
          update: expect.objectContaining({ code: 'LACTOSE' }),
          create: expect.objectContaining({ code: 'LACTOSE' }),
        }),
      )
      expect(result).toBe(entity)
    })

    it('should persist all domain properties (toPersistence)', async () => {
      mockPrisma.declarationFlag_PL.upsert.mockResolvedValue({})
      const entity = createFlagEntity({
        code: 'SOY',
        name: 'Contains Soy',
        description: 'Allergen declaration for soy',
        appliesTo: 'INGREDIENT',
      })

      await repo.save(entity, ctx)

      const [args] = mockPrisma.declarationFlag_PL.upsert.mock.calls[0]
      expect(args.create).toMatchObject({
        id: entity.id.value,
        code: 'SOY',
        name: 'Contains Soy',
        description: 'Allergen declaration for soy',
        appliesTo: 'INGREDIENT',
        systemState: SystemState.ACTIVE,
      })
    })
  })

  // ============================================================
  // findById
  // ============================================================
  describe('findById', () => {
    it('should return domain entity when found (toDomain)', async () => {
      mockPrisma.declarationFlag_PL.findUnique.mockResolvedValue(
        createMockPrismaFlagPL({ name: 'Contains Milk' }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).not.toBeNull()
      expect(result!.name).toBe('Contains Milk')
      expect(result!.id.value).toBe(ANY_ID)
    })

    it('should return null when not found', async () => {
      mockPrisma.declarationFlag_PL.findUnique.mockResolvedValue(null)

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })

    it('should return null when entity is DELETED', async () => {
      mockPrisma.declarationFlag_PL.findUnique.mockResolvedValue(
        createMockPrismaFlagPL({ systemState: 'DELETED' }),
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
      mockPrisma.declarationFlag_PL.findMany.mockResolvedValue([
        createMockPrismaFlagPL({ id: '550e8400-e29b-41d4-a716-446655440100', code: 'A' }),
        createMockPrismaFlagPL({ id: '550e8400-e29b-41d4-a716-446655440101', code: 'B' }),
      ])

      const result = await repo.findAll({}, ctx)

      expect(result).toHaveLength(2)
      expect(result[0]!.code).toBe('A')
      expect(result[1]!.code).toBe('B')
    })

    it('should filter by appliesTo when provided', async () => {
      const whereSpy = jest.fn()
      mockPrisma.declarationFlag_PL.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({ appliesTo: 'INGREDIENT' }, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({ appliesTo: 'INGREDIENT' }),
      )
    })

    it('should exclude DELETED entities by default', async () => {
      const whereSpy = jest.fn()
      mockPrisma.declarationFlag_PL.findMany.mockImplementation(
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
      mockPrisma.declarationFlag_PL.update.mockResolvedValue({})

      await repo.delete(ANY_ID, ctx)

      expect(mockPrisma.declarationFlag_PL.update).toHaveBeenCalledWith(
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
