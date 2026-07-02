/**
 * LabelField_PL Repository Tests
 *
 * Platform-scoped (PL) repository — no tenantId filtering.
 * Tests the PrismaLabelField_PLRepository CRUD operations and mapper.
 */

import { SystemState } from '@shared/behaviours/lockable'
import { createPlatformContext } from '../../test-utils'

import { LabelField_PL } from './label-field-pl.entity'
import { PrismaLabelField_PLRepository } from './label-field-pl.repository'

const ANY_ID = '550e8400-e29b-41d4-a716-446655440004'
const ctx = createPlatformContext()

function createEntity(overrides: Partial<Record<string, unknown>> = {}) {
  return LabelField_PL.create({
    fieldName: (overrides.fieldName as string) ?? 'productName',
    sortOrder: (overrides.sortOrder as number) ?? 1,
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
    fieldName: (overrides.fieldName as string) ?? 'productName',
    sortOrder: (overrides.sortOrder as number) ?? 1,
  }
}

describe('PrismaLabelField_PLRepository', () => {
  let mockPrisma: any
  let repo: PrismaLabelField_PLRepository

  beforeEach(() => {
    mockPrisma = {
      labelField_PL: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
    }
    repo = new PrismaLabelField_PLRepository(mockPrisma as any)
  })

  // ============================================================
  // save
  // ============================================================
  describe('save', () => {
    it('should upsert entity and return it', async () => {
      mockPrisma.labelField_PL.upsert.mockResolvedValue({})
      const entity = createEntity({ fieldName: 'brandName' })

      const result = await repo.save(entity, ctx)

      expect(mockPrisma.labelField_PL.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: entity.id.value },
          update: expect.objectContaining({ fieldName: 'brandName' }),
          create: expect.objectContaining({ fieldName: 'brandName' }),
        }),
      )
      expect(result).toBe(entity)
    })

    it('should persist all domain properties (toPersistence)', async () => {
      mockPrisma.labelField_PL.upsert.mockResolvedValue({})
      const entity = createEntity({
        fieldName: 'ingredientsList',
        sortOrder: 5,
      })

      await repo.save(entity, ctx)

      const [args] = mockPrisma.labelField_PL.upsert.mock.calls[0]
      expect(args.create).toMatchObject({
        id: entity.id.value,
        fieldName: 'ingredientsList',
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
      mockPrisma.labelField_PL.findUnique.mockResolvedValue(
        createMockPrismaEntity({ fieldName: 'netWeight' }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).not.toBeNull()
      expect(result!.fieldName).toBe('netWeight')
      expect(result!.id.value).toBe(ANY_ID)
    })

    it('should return null when not found', async () => {
      mockPrisma.labelField_PL.findUnique.mockResolvedValue(null)

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })

    it('should return null when entity is DELETED', async () => {
      mockPrisma.labelField_PL.findUnique.mockResolvedValue(
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
      mockPrisma.labelField_PL.findMany.mockResolvedValue([
        createMockPrismaEntity({ id: '550e8400-e29b-41d4-a716-446655440100', fieldName: 'A' }),
        createMockPrismaEntity({ id: '550e8400-e29b-41d4-a716-446655440101', fieldName: 'B' }),
      ])

      const result = await repo.findAll({}, ctx)

      expect(result).toHaveLength(2)
      expect(result[0]!.fieldName).toBe('A')
      expect(result[1]!.fieldName).toBe('B')
    })

    it('should filter by fieldName when provided', async () => {
      const whereSpy = jest.fn()
      mockPrisma.labelField_PL.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({ fieldName: 'weight' }, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          fieldName: { contains: 'weight', mode: 'insensitive' },
        }),
      )
    })

    it('should exclude DELETED entities by default', async () => {
      const whereSpy = jest.fn()
      mockPrisma.labelField_PL.findMany.mockImplementation(
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
      mockPrisma.labelField_PL.update.mockResolvedValue({})

      await repo.delete(ANY_ID, ctx)

      expect(mockPrisma.labelField_PL.update).toHaveBeenCalledWith(
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
