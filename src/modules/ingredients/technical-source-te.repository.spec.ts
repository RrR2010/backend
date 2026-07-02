/**
 * TechnicalSource_TE Repository Tests
 *
 * Tenant-scoped (TE) repository — tenantId filtering applied.
 * Tests the PrismaTechnicalSource_TE_Repository CRUD operations and mapper.
 */

import { ForbiddenException } from '@nestjs/common'
import { SystemState } from '@shared/behaviours/lockable'
import { createTenantContext, createPlatformContext } from '../../test-utils'

import { TechnicalSource_TE } from './technical-source-te.entity'
import { PrismaTechnicalSource_TE_Repository } from './technical-source-te.repository'

const ANY_ID = '550e8400-e29b-41d4-a716-446655440000'
const TENANT_ID = 'test-tenant-id'
const ctx = createTenantContext()
const platformCtx = createPlatformContext()

function createTechnicalSourceEntity(overrides: Partial<Record<string, unknown>> = {}) {
  return TechnicalSource_TE.create({
    tenantId: (overrides.tenantId as string) ?? TENANT_ID,
    sourceTypePlId: (overrides.sourceTypePlId as string | null) ?? 'source-pl-id',
    sourceTypeTeId: (overrides.sourceTypeTeId as string | null) ?? null,
    referenceName: (overrides.referenceName as string) ?? 'Test Reference',
    url: (overrides.url as string | null) ?? null,
    documentRef: (overrides.documentRef as string | null) ?? null,
    notes: (overrides.notes as string | null) ?? null,
  })
}

function createMockPrismaTechnicalSourceTE(
  overrides: Partial<Record<string, unknown>> = {},
) {
  return {
    id: (overrides.id as string) ?? ANY_ID,
    createdAt: (overrides.createdAt as Date) ?? new Date(),
    updatedAt: (overrides.updatedAt as Date) ?? new Date(),
    systemState: (overrides.systemState as string) ?? 'ACTIVE',
    tenantId: (overrides.tenantId as string) ?? TENANT_ID,
    sourceTypePlId: (overrides.sourceTypePlId as string | null) ?? 'source-pl-id',
    sourceTypeTeId: (overrides.sourceTypeTeId as string | null) ?? null,
    referenceName: (overrides.referenceName as string) ?? 'Test Reference',
    url: (overrides.url as string | null) ?? null,
    documentRef: (overrides.documentRef as string | null) ?? null,
    notes: (overrides.notes as string | null) ?? null,
  }
}

describe('PrismaTechnicalSource_TE_Repository', () => {
  let mockPrisma: any
  let repo: PrismaTechnicalSource_TE_Repository

  beforeEach(() => {
    mockPrisma = {
      technicalSource_TE: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
    }
    repo = new PrismaTechnicalSource_TE_Repository(mockPrisma as any)
  })

  // ============================================================
  // save
  // ============================================================
  describe('save', () => {
    it('should upsert entity and return it', async () => {
      mockPrisma.technicalSource_TE.upsert.mockResolvedValue({})
      const entity = createTechnicalSourceEntity({ referenceName: 'EU Reg 1169/2011' })

      const result = await repo.save(entity, ctx)

      expect(mockPrisma.technicalSource_TE.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: entity.id.value },
          update: expect.objectContaining({ referenceName: 'EU Reg 1169/2011' }),
          create: expect.objectContaining({ referenceName: 'EU Reg 1169/2011' }),
        }),
      )
      expect(result).toBe(entity)
    })

    it('should throw ForbiddenException when saving cross-tenant entity', async () => {
      const entity = createTechnicalSourceEntity({
        tenantId: 'other-tenant',
        referenceName: 'Cross-tenant',
      })

      await expect(repo.save(entity, ctx)).rejects.toThrow(ForbiddenException)
    })

    it('should persist all domain properties (toPersistence)', async () => {
      mockPrisma.technicalSource_TE.upsert.mockResolvedValue({})
      const entity = createTechnicalSourceEntity({
        referenceName: 'ANVISA RDC 429',
        url: 'https://example.gov/doc',
        documentRef: 'RDC-429-2025',
        notes: 'Important regulation',
      })

      await repo.save(entity, ctx)

      const [args] = mockPrisma.technicalSource_TE.upsert.mock.calls[0]
      expect(args.create).toMatchObject({
        id: entity.id.value,
        referenceName: 'ANVISA RDC 429',
        url: 'https://example.gov/doc',
        documentRef: 'RDC-429-2025',
        notes: 'Important regulation',
        tenantId: TENANT_ID,
        systemState: SystemState.ACTIVE,
      })
    })
  })

  // ============================================================
  // findById
  // ============================================================
  describe('findById', () => {
    it('should return domain entity when found (toDomain)', async () => {
      mockPrisma.technicalSource_TE.findUnique.mockResolvedValue(
        createMockPrismaTechnicalSourceTE({ referenceName: 'Codex Alimentarius' }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).not.toBeNull()
      expect(result!.referenceName).toBe('Codex Alimentarius')
      expect(result!.id.value).toBe(ANY_ID)
      expect(result!.tenantId).toBe(TENANT_ID)
    })

    it('should return null when not found', async () => {
      mockPrisma.technicalSource_TE.findUnique.mockResolvedValue(null)

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })

    it('should return null when entity is DELETED', async () => {
      mockPrisma.technicalSource_TE.findUnique.mockResolvedValue(
        createMockPrismaTechnicalSourceTE({ systemState: 'DELETED' }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })

    it('should filter by tenantId for tenant-scoped context', async () => {
      const whereSpy = jest.fn()
      mockPrisma.technicalSource_TE.findUnique.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve(null)
        },
      )

      await repo.findById(ANY_ID, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: TENANT_ID }),
      )
    })
  })

  // ============================================================
  // findAll
  // ============================================================
  describe('findAll', () => {
    it('should return all active entities filtered by tenantId', async () => {
      mockPrisma.technicalSource_TE.findMany.mockResolvedValue([
        createMockPrismaTechnicalSourceTE({
          id: '550e8400-e29b-41d4-a716-446655440100',
          referenceName: 'Source A',
        }),
        createMockPrismaTechnicalSourceTE({
          id: '550e8400-e29b-41d4-a716-446655440101',
          referenceName: 'Source B',
        }),
      ])

      const result = await repo.findAll({}, ctx)

      expect(result).toHaveLength(2)
      expect(result[0]!.referenceName).toBe('Source A')
      expect(result[1]!.referenceName).toBe('Source B')
    })

    it('should apply pagination defaults (skip=0, take=50)', async () => {
      const argsSpy = jest.fn()
      mockPrisma.technicalSource_TE.findMany.mockImplementation(
        (args: { skip?: number; take?: number }) => {
          argsSpy({ skip: args.skip, take: args.take })
          return Promise.resolve([])
        },
      )

      await repo.findAll({}, ctx)

      expect(argsSpy).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 50 }),
      )
    })

    it('should filter by referenceName', async () => {
      const whereSpy = jest.fn()
      mockPrisma.technicalSource_TE.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({ referenceName: 'Codex' }, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          referenceName: { contains: 'Codex', mode: 'insensitive' },
        }),
      )
    })

    it('should exclude DELETED entities for tenant context', async () => {
      const whereSpy = jest.fn()
      mockPrisma.technicalSource_TE.findMany.mockImplementation(
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

    it('should not apply tenantId filter for platform context', async () => {
      const whereSpy = jest.fn()
      mockPrisma.technicalSource_TE.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({}, platformCtx)

      expect(whereSpy).toHaveBeenCalled()
      const calledWhere = whereSpy.mock.calls[0][0]
      expect(calledWhere).not.toHaveProperty('tenantId')
    })
  })

  // ============================================================
  // delete
  // ============================================================
  describe('delete', () => {
    it('should soft-delete by updating systemState to DELETED with tenantId filter', async () => {
      mockPrisma.technicalSource_TE.update.mockResolvedValue({})

      await repo.delete(ANY_ID, ctx)

      expect(mockPrisma.technicalSource_TE.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: ANY_ID, tenantId: TENANT_ID },
          data: expect.objectContaining({
            systemState: SystemState.DELETED,
          }),
        }),
      )
    })

    it('should not apply tenantId filter for platform context', async () => {
      mockPrisma.technicalSource_TE.update.mockResolvedValue({})

      await repo.delete(ANY_ID, platformCtx)

      expect(mockPrisma.technicalSource_TE.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: ANY_ID },
        }),
      )
    })
  })
})
