/**
 * RegulationType_PL Repository Tests
 *
 * Platform-scoped (PL) repository — no tenantId filtering.
 * Tests the PrismaRegulationType_PLRepository CRUD operations and mapper.
 */

import { SystemState } from '@shared/behaviours/lockable'
import { createPlatformContext } from '../../test-utils'

import { RegulationType_PL } from './regulation-type-pl.entity'
import { PrismaRegulationType_PLRepository } from './regulation-type-pl.repository'

const ANY_ID = '550e8400-e29b-41d4-a716-446655440003'
const ctx = createPlatformContext()

function createEntity(overrides: Partial<Record<string, unknown>> = {}) {
  return RegulationType_PL.create({
    abbreviation: (overrides.abbreviation as string) ?? 'RES',
    code: (overrides.code as string) ?? 'RESOLUTION',
    name: (overrides.name as string) ?? 'Resolution',
    description: (overrides.description as string | null) ?? 'Standard regulatory resolution',
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
    abbreviation: (overrides.abbreviation as string) ?? 'RES',
    code: (overrides.code as string) ?? 'RESOLUTION',
    name: (overrides.name as string) ?? 'Resolution',
    description: (overrides.description as string | null) ?? 'Standard regulatory resolution',
  }
}

describe('PrismaRegulationType_PLRepository', () => {
  let mockPrisma: any
  let repo: PrismaRegulationType_PLRepository

  beforeEach(() => {
    mockPrisma = {
      regulationType_PL: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
    }
    repo = new PrismaRegulationType_PLRepository(mockPrisma as any)
  })

  // ============================================================
  // save
  // ============================================================
  describe('save', () => {
    it('should upsert entity and return it', async () => {
      mockPrisma.regulationType_PL.upsert.mockResolvedValue({})
      const entity = createEntity({ code: 'DECREE' })

      const result = await repo.save(entity, ctx)

      expect(mockPrisma.regulationType_PL.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: entity.id.value },
          update: expect.objectContaining({ code: 'DECREE' }),
          create: expect.objectContaining({ code: 'DECREE' }),
        }),
      )
      expect(result).toBe(entity)
    })

    it('should persist all domain properties (toPersistence)', async () => {
      mockPrisma.regulationType_PL.upsert.mockResolvedValue({})
      const entity = createEntity({
        abbreviation: 'RDC',
        code: 'RDC',
        name: 'Resolução da Diretoria Colegiada',
        description: 'ANVISA collegiate board resolution',
      })

      await repo.save(entity, ctx)

      const [args] = mockPrisma.regulationType_PL.upsert.mock.calls[0]
      expect(args.create).toMatchObject({
        id: entity.id.value,
        abbreviation: 'RDC',
        code: 'RDC',
        name: 'Resolução da Diretoria Colegiada',
        description: 'ANVISA collegiate board resolution',
        systemState: SystemState.ACTIVE,
      })
    })
  })

  // ============================================================
  // findById
  // ============================================================
  describe('findById', () => {
    it('should return domain entity when found (toDomain)', async () => {
      mockPrisma.regulationType_PL.findUnique.mockResolvedValue(
        createMockPrismaEntity({
          code: 'INSTRUCTION',
          name: 'Normative Instruction',
        }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).not.toBeNull()
      expect(result!.code).toBe('INSTRUCTION')
      expect(result!.name).toBe('Normative Instruction')
      expect(result!.id.value).toBe(ANY_ID)
    })

    it('should return null when not found', async () => {
      mockPrisma.regulationType_PL.findUnique.mockResolvedValue(null)

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })

    it('should return null when entity is DELETED', async () => {
      mockPrisma.regulationType_PL.findUnique.mockResolvedValue(
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
      mockPrisma.regulationType_PL.findMany.mockResolvedValue([
        createMockPrismaEntity({ id: '550e8400-e29b-41d4-a716-446655440100', code: 'RESOLUTION' }),
        createMockPrismaEntity({ id: '550e8400-e29b-41d4-a716-446655440101', code: 'DECREE' }),
      ])

      const result = await repo.findAll({}, ctx)

      expect(result).toHaveLength(2)
      expect(result[0]!.code).toBe('RESOLUTION')
      expect(result[1]!.code).toBe('DECREE')
    })

    it('should exclude DELETED entities by default', async () => {
      const whereSpy = jest.fn()
      mockPrisma.regulationType_PL.findMany.mockImplementation(
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
      mockPrisma.regulationType_PL.findMany.mockResolvedValue([])

      await repo.findAll({}, ctx)

      expect(mockPrisma.regulationType_PL.findMany).toHaveBeenCalledWith(
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
      mockPrisma.regulationType_PL.update.mockResolvedValue({})

      await repo.delete(ANY_ID, ctx)

      expect(mockPrisma.regulationType_PL.update).toHaveBeenCalledWith(
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
