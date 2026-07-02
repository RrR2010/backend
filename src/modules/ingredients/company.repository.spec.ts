/**
 * Company_TE Repository Tests
 *
 * Tenant-scoped (TE) repository — tenantId filtering applied.
 * Tests the PrismaCompany_TERepository CRUD operations and mapper.
 */

import { ForbiddenException } from '@nestjs/common'
import { SystemState } from '@shared/behaviours/lockable'
import { createTenantContext, createPlatformContext } from '../../test-utils'

import { Company_TE } from './company.entity'
import { PrismaCompany_TERepository } from './company.repository'

const ANY_ID = '550e8400-e29b-41d4-a716-446655440000'
const TENANT_ID = 'test-tenant-id'
const ctx = createTenantContext()
const platformCtx = createPlatformContext()

function createCompanyEntity(overrides: Partial<Record<string, unknown>> = {}) {
  return Company_TE.create({
    tenantId: (overrides.tenantId as string) ?? TENANT_ID,
    name: (overrides.name as string) ?? 'Test Company',
    type: (overrides.type as string) ?? 'MANUFACTURER',
    contactInfo: (overrides.contactInfo as string | null) ?? null,
    taxId: (overrides.taxId as string | null) ?? null,
  })
}

function createMockPrismaCompanyTE(
  overrides: Partial<Record<string, unknown>> = {},
) {
  return {
    id: (overrides.id as string) ?? ANY_ID,
    createdAt: (overrides.createdAt as Date) ?? new Date(),
    updatedAt: (overrides.updatedAt as Date) ?? new Date(),
    systemState: (overrides.systemState as string) ?? 'ACTIVE',
    tenantId: (overrides.tenantId as string) ?? TENANT_ID,
    name: (overrides.name as string) ?? 'Test Company',
    type: (overrides.type as string) ?? 'MANUFACTURER',
    contactInfo: (overrides.contactInfo as string | null) ?? null,
    taxId: (overrides.taxId as string | null) ?? null,
  }
}

describe('PrismaCompany_TERepository', () => {
  let mockPrisma: any
  let repo: PrismaCompany_TERepository

  beforeEach(() => {
    mockPrisma = {
      company_TE: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
    }
    repo = new PrismaCompany_TERepository(mockPrisma as any)
  })

  // ============================================================
  // save
  // ============================================================
  describe('save', () => {
    it('should upsert entity and return it', async () => {
      mockPrisma.company_TE.upsert.mockResolvedValue({})
      const entity = createCompanyEntity({ name: 'Supplier A' })

      const result = await repo.save(entity, ctx)

      expect(mockPrisma.company_TE.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: entity.id.value },
          update: expect.objectContaining({ name: 'Supplier A' }),
          create: expect.objectContaining({ name: 'Supplier A' }),
        }),
      )
      expect(result).toBe(entity)
    })

    it('should throw ForbiddenException when saving cross-tenant entity', async () => {
      const entity = createCompanyEntity({
        tenantId: 'other-tenant',
        name: 'Cross-tenant',
      })

      await expect(repo.save(entity, ctx)).rejects.toThrow(ForbiddenException)
    })

    it('should persist all domain properties (toPersistence)', async () => {
      mockPrisma.company_TE.upsert.mockResolvedValue({})
      const entity = createCompanyEntity({
        name: 'ACME Corp',
        type: 'SUPPLIER',
        contactInfo: 'contact@acme.com',
        taxId: '12.345.678/0001-90',
      })

      await repo.save(entity, ctx)

      const [args] = mockPrisma.company_TE.upsert.mock.calls[0]
      expect(args.create).toMatchObject({
        id: entity.id.value,
        name: 'ACME Corp',
        type: 'SUPPLIER',
        contactInfo: 'contact@acme.com',
        taxId: '12.345.678/0001-90',
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
      mockPrisma.company_TE.findUnique.mockResolvedValue(
        createMockPrismaCompanyTE({ name: 'Big Supplier' }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).not.toBeNull()
      expect(result!.name).toBe('Big Supplier')
      expect(result!.id.value).toBe(ANY_ID)
      expect(result!.tenantId).toBe(TENANT_ID)
    })

    it('should return null when not found', async () => {
      mockPrisma.company_TE.findUnique.mockResolvedValue(null)

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })

    it('should return null when entity is DELETED', async () => {
      mockPrisma.company_TE.findUnique.mockResolvedValue(
        createMockPrismaCompanyTE({ systemState: 'DELETED' }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })

    it('should filter by tenantId for tenant-scoped context', async () => {
      const whereSpy = jest.fn()
      mockPrisma.company_TE.findUnique.mockImplementation(
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
      mockPrisma.company_TE.findMany.mockResolvedValue([
        createMockPrismaCompanyTE({
          id: '550e8400-e29b-41d4-a716-446655440100',
          name: 'Company A',
        }),
        createMockPrismaCompanyTE({
          id: '550e8400-e29b-41d4-a716-446655440101',
          name: 'Company B',
        }),
      ])

      const result = await repo.findAll({}, ctx)

      expect(result).toHaveLength(2)
      expect(result[0]!.name).toBe('Company A')
      expect(result[1]!.name).toBe('Company B')
    })

    it('should apply pagination defaults (skip=0, take=100)', async () => {
      const argsSpy = jest.fn()
      mockPrisma.company_TE.findMany.mockImplementation(
        (args: { skip?: number; take?: number }) => {
          argsSpy({ skip: args.skip, take: args.take })
          return Promise.resolve([])
        },
      )

      await repo.findAll({}, ctx)

      expect(argsSpy).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 100 }),
      )
    })

    it('should filter by name', async () => {
      const whereSpy = jest.fn()
      mockPrisma.company_TE.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({ name: 'ACME' }, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: { contains: 'ACME', mode: 'insensitive' },
        }),
      )
    })

    it('should filter by type', async () => {
      const whereSpy = jest.fn()
      mockPrisma.company_TE.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({ type: 'SUPPLIER' }, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: { contains: 'SUPPLIER', mode: 'insensitive' },
        }),
      )
    })

    it('should exclude DELETED entities for tenant context', async () => {
      const whereSpy = jest.fn()
      mockPrisma.company_TE.findMany.mockImplementation(
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
      mockPrisma.company_TE.findMany.mockImplementation(
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
      mockPrisma.company_TE.update.mockResolvedValue({})

      await repo.delete(ANY_ID, ctx)

      expect(mockPrisma.company_TE.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: ANY_ID, tenantId: TENANT_ID },
          data: expect.objectContaining({
            systemState: SystemState.DELETED,
          }),
        }),
      )
    })

    it('should not apply tenantId filter for platform context', async () => {
      mockPrisma.company_TE.update.mockResolvedValue({})

      await repo.delete(ANY_ID, platformCtx)

      expect(mockPrisma.company_TE.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: ANY_ID },
        }),
      )
    })
  })
})
