/**
 * FunctionalGroup_TE Repository Tests
 *
 * Tenant-scoped (TE) repository — tenantId filtering applied.
 * Tests the PrismaFunctionalGroup_TERepository CRUD operations and mapper.
 */

import { ForbiddenException } from '@nestjs/common'
import { SystemState } from '@shared/behaviours/lockable'
import { createTenantContext, createPlatformContext } from '../../test-utils'

import { FunctionalGroup_TE } from './functional-group.entity'
import { PrismaFunctionalGroup_TERepository } from './functional-group.repository'

const ANY_ID = '550e8400-e29b-41d4-a716-446655440000'
const TENANT_ID = 'test-tenant-id'
const ctx = createTenantContext()
const platformCtx = createPlatformContext()

function createFunctionalGroupEntity(overrides: Partial<Record<string, unknown>> = {}) {
  return FunctionalGroup_TE.create({
    tenantId: (overrides.tenantId as string) ?? TENANT_ID,
    name: (overrides.name as string) ?? 'Test Group',
    code: (overrides.code as string | null) ?? null,
    sortOrder: (overrides.sortOrder as number) ?? 0,
    isActive: (overrides.isActive as boolean) ?? true,
  })
}

function createMockPrismaFunctionalGroupTE(
  overrides: Partial<Record<string, unknown>> = {},
) {
  return {
    id: (overrides.id as string) ?? ANY_ID,
    createdAt: (overrides.createdAt as Date) ?? new Date(),
    updatedAt: (overrides.updatedAt as Date) ?? new Date(),
    systemState: (overrides.systemState as string) ?? 'ACTIVE',
    tenantId: (overrides.tenantId as string) ?? TENANT_ID,
    name: (overrides.name as string) ?? 'Test Group',
    code: (overrides.code as string | null) ?? null,
    sortOrder: (overrides.sortOrder as number) ?? 0,
    isActive: (overrides.isActive as boolean) ?? true,
  }
}

describe('PrismaFunctionalGroup_TERepository', () => {
  let mockPrisma: any
  let repo: PrismaFunctionalGroup_TERepository

  beforeEach(() => {
    mockPrisma = {
      functionalGroup_TE: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
    }
    repo = new PrismaFunctionalGroup_TERepository(mockPrisma as any)
  })

  // ============================================================
  // save
  // ============================================================
  describe('save', () => {
    it('should upsert entity and return it', async () => {
      mockPrisma.functionalGroup_TE.upsert.mockResolvedValue({})
      const entity = createFunctionalGroupEntity({ name: 'Hydrocolloids' })

      const result = await repo.save(entity, ctx)

      expect(mockPrisma.functionalGroup_TE.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: entity.id.value },
          update: expect.objectContaining({ name: 'Hydrocolloids' }),
          create: expect.objectContaining({ name: 'Hydrocolloids' }),
        }),
      )
      expect(result).toBe(entity)
    })

    it('should throw ForbiddenException when saving cross-tenant entity', async () => {
      const entity = createFunctionalGroupEntity({
        tenantId: 'other-tenant',
        name: 'Cross-tenant',
      })

      await expect(repo.save(entity, ctx)).rejects.toThrow(ForbiddenException)
    })

    it('should persist all domain properties (toPersistence)', async () => {
      mockPrisma.functionalGroup_TE.upsert.mockResolvedValue({})
      const entity = createFunctionalGroupEntity({
        name: 'Stabilizers',
        code: 'STB-01',
        sortOrder: 5,
        isActive: true,
      })

      await repo.save(entity, ctx)

      const [args] = mockPrisma.functionalGroup_TE.upsert.mock.calls[0]
      expect(args.create).toMatchObject({
        id: entity.id.value,
        name: 'Stabilizers',
        code: 'STB-01',
        sortOrder: 5,
        isActive: true,
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
      mockPrisma.functionalGroup_TE.findUnique.mockResolvedValue(
        createMockPrismaFunctionalGroupTE({ name: 'Sweeteners' }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).not.toBeNull()
      expect(result!.name).toBe('Sweeteners')
      expect(result!.id.value).toBe(ANY_ID)
      expect(result!.tenantId).toBe(TENANT_ID)
    })

    it('should return null when not found', async () => {
      mockPrisma.functionalGroup_TE.findUnique.mockResolvedValue(null)

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })

    it('should return null when entity is DELETED', async () => {
      mockPrisma.functionalGroup_TE.findUnique.mockResolvedValue(
        createMockPrismaFunctionalGroupTE({ systemState: 'DELETED' }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })

    it('should filter by tenantId for tenant-scoped context', async () => {
      const whereSpy = jest.fn()
      mockPrisma.functionalGroup_TE.findUnique.mockImplementation(
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
      mockPrisma.functionalGroup_TE.findMany.mockResolvedValue([
        createMockPrismaFunctionalGroupTE({
          id: '550e8400-e29b-41d4-a716-446655440100',
          name: 'Group A',
        }),
        createMockPrismaFunctionalGroupTE({
          id: '550e8400-e29b-41d4-a716-446655440101',
          name: 'Group B',
        }),
      ])

      const result = await repo.findAll({}, ctx)

      expect(result).toHaveLength(2)
      expect(result[0]!.name).toBe('Group A')
      expect(result[1]!.name).toBe('Group B')
    })

    it('should apply pagination defaults (skip=0, take=50)', async () => {
      const argsSpy = jest.fn()
      mockPrisma.functionalGroup_TE.findMany.mockImplementation(
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

    it('should filter by name', async () => {
      const whereSpy = jest.fn()
      mockPrisma.functionalGroup_TE.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({ name: 'Sweet' }, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: { contains: 'Sweet', mode: 'insensitive' },
        }),
      )
    })

    it('should filter by isActive flag', async () => {
      const whereSpy = jest.fn()
      mockPrisma.functionalGroup_TE.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({ isActive: true }, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true }),
      )
    })

    it('should exclude DELETED entities for tenant context', async () => {
      const whereSpy = jest.fn()
      mockPrisma.functionalGroup_TE.findMany.mockImplementation(
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
      mockPrisma.functionalGroup_TE.findMany.mockImplementation(
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
      mockPrisma.functionalGroup_TE.update.mockResolvedValue({})

      await repo.delete(ANY_ID, ctx)

      expect(mockPrisma.functionalGroup_TE.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: ANY_ID, tenantId: TENANT_ID },
          data: expect.objectContaining({
            systemState: SystemState.DELETED,
          }),
        }),
      )
    })

    it('should not apply tenantId filter for platform context', async () => {
      mockPrisma.functionalGroup_TE.update.mockResolvedValue({})

      await repo.delete(ANY_ID, platformCtx)

      expect(mockPrisma.functionalGroup_TE.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: ANY_ID },
        }),
      )
    })
  })
})
