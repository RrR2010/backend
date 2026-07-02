/**
 * RegulatoryBody_PL Repository Tests
 *
 * Platform-scoped (PL) repository — no tenantId filtering.
 * Tests the PrismaRegulatoryBody_PLRepository CRUD operations and mapper.
 */

import { SystemState } from '@shared/behaviours/lockable'
import { createPlatformContext } from '../../test-utils'

import { RegulatoryBody_PL } from './regulatory-body-pl.entity'
import { PrismaRegulatoryBody_PLRepository } from './regulatory-body-pl.repository'

const ANY_ID = '550e8400-e29b-41d4-a716-446655440002'
const ctx = createPlatformContext()

function createEntity(overrides: Partial<Record<string, unknown>> = {}) {
  return RegulatoryBody_PL.create({
    abbreviation: (overrides.abbreviation as string | null) ?? 'ANVISA',
    code: (overrides.code as string) ?? 'BR-ANVISA',
    name: (overrides.name as string) ?? 'Agência Nacional de Vigilância Sanitária',
    description: (overrides.description as string | null) ?? 'Brazilian health regulator',
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
    abbreviation: (overrides.abbreviation as string | null) ?? 'ANVISA',
    code: (overrides.code as string) ?? 'BR-ANVISA',
    name: (overrides.name as string) ?? 'Agência Nacional de Vigilância Sanitária',
    description: (overrides.description as string | null) ?? 'Brazilian health regulator',
  }
}

describe('PrismaRegulatoryBody_PLRepository', () => {
  let mockPrisma: any
  let repo: PrismaRegulatoryBody_PLRepository

  beforeEach(() => {
    mockPrisma = {
      regulatoryBody_PL: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
    }
    repo = new PrismaRegulatoryBody_PLRepository(mockPrisma as any)
  })

  // ============================================================
  // save
  // ============================================================
  describe('save', () => {
    it('should upsert entity and return it', async () => {
      mockPrisma.regulatoryBody_PL.upsert.mockResolvedValue({})
      const entity = createEntity({ code: 'US-FDA' })

      const result = await repo.save(entity, ctx)

      expect(mockPrisma.regulatoryBody_PL.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: entity.id.value },
          update: expect.objectContaining({ code: 'US-FDA' }),
          create: expect.objectContaining({ code: 'US-FDA' }),
        }),
      )
      expect(result).toBe(entity)
    })

    it('should persist all domain properties (toPersistence)', async () => {
      mockPrisma.regulatoryBody_PL.upsert.mockResolvedValue({})
      const entity = createEntity({
        abbreviation: 'EU',
        code: 'EU-COMM',
        name: 'European Commission',
        description: 'European regulatory body',
      })

      await repo.save(entity, ctx)

      const [args] = mockPrisma.regulatoryBody_PL.upsert.mock.calls[0]
      expect(args.create).toMatchObject({
        id: entity.id.value,
        abbreviation: 'EU',
        code: 'EU-COMM',
        name: 'European Commission',
        description: 'European regulatory body',
        systemState: SystemState.ACTIVE,
      })
    })
  })

  // ============================================================
  // findById
  // ============================================================
  describe('findById', () => {
    it('should return domain entity when found (toDomain)', async () => {
      mockPrisma.regulatoryBody_PL.findUnique.mockResolvedValue(
        createMockPrismaEntity({
          code: 'US-FDA',
          name: 'Food and Drug Administration',
        }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).not.toBeNull()
      expect(result!.code).toBe('US-FDA')
      expect(result!.name).toBe('Food and Drug Administration')
      expect(result!.id.value).toBe(ANY_ID)
    })

    it('should return null when not found', async () => {
      mockPrisma.regulatoryBody_PL.findUnique.mockResolvedValue(null)

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })

    it('should return null when entity is DELETED', async () => {
      mockPrisma.regulatoryBody_PL.findUnique.mockResolvedValue(
        createMockPrismaEntity({ systemState: 'DELETED' }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })
  })

  // ============================================================
  // findByAbbreviation
  // ============================================================
  describe('findByAbbreviation', () => {
    it('should return domain entity when abbreviation matches', async () => {
      mockPrisma.regulatoryBody_PL.findFirst.mockResolvedValue(
        createMockPrismaEntity({ abbreviation: 'FDA', code: 'US-FDA' }),
      )

      const result = await repo.findByAbbreviation('FDA', ctx)

      expect(result).not.toBeNull()
      expect(result!.abbreviation).toBe('FDA')
      expect(result!.code).toBe('US-FDA')

      expect(mockPrisma.regulatoryBody_PL.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ abbreviation: 'FDA' }),
        }),
      )
    })

    it('should return null when abbreviation does not match', async () => {
      mockPrisma.regulatoryBody_PL.findFirst.mockResolvedValue(null)

      const result = await repo.findByAbbreviation('NONEXISTENT', ctx)

      expect(result).toBeNull()
    })

    it('should return null when entity is DELETED', async () => {
      mockPrisma.regulatoryBody_PL.findFirst.mockResolvedValue(
        createMockPrismaEntity({ abbreviation: 'OLD', systemState: 'DELETED' }),
      )

      const result = await repo.findByAbbreviation('OLD', ctx)

      expect(result).toBeNull()
    })
  })

  // ============================================================
  // findAll
  // ============================================================
  describe('findAll', () => {
    it('should return all active entities by default', async () => {
      mockPrisma.regulatoryBody_PL.findMany.mockResolvedValue([
        createMockPrismaEntity({ id: '550e8400-e29b-41d4-a716-446655440100', code: 'BR-ANVISA' }),
        createMockPrismaEntity({ id: '550e8400-e29b-41d4-a716-446655440101', code: 'US-FDA' }),
      ])

      const result = await repo.findAll({}, ctx)

      expect(result).toHaveLength(2)
      expect(result[0]!.code).toBe('BR-ANVISA')
      expect(result[1]!.code).toBe('US-FDA')
    })

    it('should exclude DELETED entities by default', async () => {
      const whereSpy = jest.fn()
      mockPrisma.regulatoryBody_PL.findMany.mockImplementation(
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

    it('should order by code ascending', async () => {
      mockPrisma.regulatoryBody_PL.findMany.mockResolvedValue([])

      await repo.findAll({}, ctx)

      expect(mockPrisma.regulatoryBody_PL.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { code: 'asc' },
        }),
      )
    })
  })

  // ============================================================
  // delete
  // ============================================================
  describe('delete', () => {
    it('should soft-delete by updating systemState to DELETED', async () => {
      mockPrisma.regulatoryBody_PL.update.mockResolvedValue({})

      await repo.delete(ANY_ID, ctx)

      expect(mockPrisma.regulatoryBody_PL.update).toHaveBeenCalledWith(
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
