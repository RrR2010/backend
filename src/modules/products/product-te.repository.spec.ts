/**
 * Product_TE Repository Tests
 *
 * Tenant-scoped (TE) repository — tenantId filtering applied.
 * Tests the PrismaProductRepository CRUD operations and mapper.
 */

import { ForbiddenException } from '@nestjs/common'
import { SystemState } from '@shared/behaviours/lockable'
import { createTenantContext, createPlatformContext } from '../../test-utils'
import { ProductStatus } from '@prisma/client'

import { Product_TE } from './product.entity'
import { PrismaProductRepository } from './product.repository'

const ANY_ID = '550e8400-e29b-41d4-a716-446655440000'
const TENANT_ID = 'test-tenant-id'
const ctx = createTenantContext()
const platformCtx = createPlatformContext()

function createProductEntity(overrides: Partial<Record<string, unknown>> = {}) {
  return Product_TE.create({
    tenantId: (overrides.tenantId as string) ?? TENANT_ID,
    internalName: (overrides.internalName as string) ?? 'Test Product',
    code: (overrides.code as string) ?? 'PROD-001',
  })
}

function createMockPrismaProductTE(
  overrides: Partial<Record<string, unknown>> = {},
) {
  return {
    id: (overrides.id as string) ?? ANY_ID,
    createdAt: (overrides.createdAt as Date) ?? new Date(),
    updatedAt: (overrides.updatedAt as Date) ?? new Date(),
    systemState: (overrides.systemState as string) ?? 'ACTIVE',
    tenantId: (overrides.tenantId as string) ?? TENANT_ID,
    internalName: (overrides.internalName as string) ?? 'Test Product',
    code: (overrides.code as string) ?? 'PROD-001',
    externalCode: (overrides.externalCode as string | null) ?? null,
    displayName: (overrides.displayName as string | null) ?? null,
    status: (overrides.status as string) ?? 'DRAFT',
    commercialName: (overrides.commercialName as string | null) ?? null,
    saleDenomination: (overrides.saleDenomination as string | null) ?? null,
    productType: (overrides.productType as string | null) ?? null,
    notes: (overrides.notes as string | null) ?? null,
    barcodeGtin: (overrides.barcodeGtin as string | null) ?? null,
    packagingType: (overrides.packagingType as string | null) ?? null,
    batchCode: (overrides.batchCode as string | null) ?? null,
    declaredWeight: (overrides.declaredWeight as any) ?? null,
    declaredVolume: (overrides.declaredVolume as any) ?? null,
    shelfLifeDays: (overrides.shelfLifeDays as number | null) ?? null,
    storageConditions: (overrides.storageConditions as string | null) ?? null,
    productFamilyId: (overrides.productFamilyId as string | null) ?? null,
    commercialLineId: (overrides.commercialLineId as string | null) ?? null,
  }
}

describe('PrismaProductRepository', () => {
  let mockPrisma: any
  let repo: PrismaProductRepository

  beforeEach(() => {
    mockPrisma = {
      product_TE: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
    }
    repo = new PrismaProductRepository(mockPrisma as any)
  })

  // ============================================================
  // save
  // ============================================================
  describe('save', () => {
    it('should upsert entity and return it', async () => {
      mockPrisma.product_TE.upsert.mockResolvedValue({})
      const entity = createProductEntity({ internalName: 'Chocolate Ice Cream' })

      const result = await repo.save(entity, ctx)

      expect(mockPrisma.product_TE.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: entity.id.value },
          update: expect.objectContaining({ internalName: 'Chocolate Ice Cream' }),
          create: expect.objectContaining({ internalName: 'Chocolate Ice Cream' }),
        }),
      )
      expect(result).toBe(entity)
    })

    it('should throw ForbiddenException when saving cross-tenant entity', async () => {
      const entity = createProductEntity({
        tenantId: 'other-tenant',
        internalName: 'Cross-tenant',
      })

      await expect(repo.save(entity, ctx)).rejects.toThrow(ForbiddenException)
    })

    it('should persist all domain properties (toPersistence)', async () => {
      mockPrisma.product_TE.upsert.mockResolvedValue({})
      const entity = createProductEntity({
        internalName: 'Strawberry Yogurt',
        code: 'YOG-001',
        displayName: 'Strawberry Yogurt 150g',
      })

      await repo.save(entity, ctx)

      const [args] = mockPrisma.product_TE.upsert.mock.calls[0]
      expect(args.create).toMatchObject({
        id: entity.id.value,
        internalName: 'Strawberry Yogurt',
        code: 'YOG-001',
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
      mockPrisma.product_TE.findUnique.mockResolvedValue(
        createMockPrismaProductTE({ internalName: 'Vanilla Ice Cream' }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).not.toBeNull()
      expect(result!.internalName).toBe('Vanilla Ice Cream')
      expect(result!.id.value).toBe(ANY_ID)
      expect(result!.tenantId).toBe(TENANT_ID)
    })

    it('should return null when not found', async () => {
      mockPrisma.product_TE.findUnique.mockResolvedValue(null)

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })

    it('should return null when entity is DELETED', async () => {
      mockPrisma.product_TE.findUnique.mockResolvedValue(
        createMockPrismaProductTE({ systemState: 'DELETED' }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })

    it('should filter by tenantId for tenant-scoped context', async () => {
      const whereSpy = jest.fn()
      mockPrisma.product_TE.findUnique.mockImplementation(
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

    it('should return entity for platform context without tenantId filter', async () => {
      mockPrisma.product_TE.findUnique.mockResolvedValue(
        createMockPrismaProductTE({ internalName: 'Platform Product' }),
      )

      const result = await repo.findById(ANY_ID, platformCtx)

      expect(result).not.toBeNull()
      expect(result!.internalName).toBe('Platform Product')
    })
  })

  // ============================================================
  // findAll
  // ============================================================
  describe('findAll', () => {
    it('should return all active entities filtered by tenantId', async () => {
      mockPrisma.product_TE.findMany.mockResolvedValue([
        createMockPrismaProductTE({
          id: '550e8400-e29b-41d4-a716-446655440100',
          internalName: 'Product A',
        }),
        createMockPrismaProductTE({
          id: '550e8400-e29b-41d4-a716-446655440101',
          internalName: 'Product B',
        }),
      ])

      const result = await repo.findAll({}, ctx)

      expect(result).toHaveLength(2)
      expect(result[0]!.internalName).toBe('Product A')
      expect(result[1]!.internalName).toBe('Product B')
    })

    it('should apply pagination defaults (skip=0, take=100)', async () => {
      const argsSpy = jest.fn()
      mockPrisma.product_TE.findMany.mockImplementation(
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

    it('should filter by status', async () => {
      const whereSpy = jest.fn()
      mockPrisma.product_TE.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({ status: 'ACTIVE' }, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'ACTIVE' }),
      )
    })

    it('should exclude DELETED entities', async () => {
      const whereSpy = jest.fn()
      mockPrisma.product_TE.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({}, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          systemState: 'ACTIVE',
        }),
      )
    })

    it('should not apply tenantId filter for platform context', async () => {
      const whereSpy = jest.fn()
      mockPrisma.product_TE.findMany.mockImplementation(
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

    it('should filter by tenantId', async () => {
      const whereSpy = jest.fn()
      mockPrisma.product_TE.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({ tenantId: TENANT_ID }, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: TENANT_ID }),
      )
    })
  })

  // ============================================================
  // delete
  // ============================================================
  describe('delete', () => {
    it('should soft-delete by updating systemState to DELETED with tenantId filter', async () => {
      mockPrisma.product_TE.update.mockResolvedValue({})

      await repo.delete(ANY_ID, ctx)

      expect(mockPrisma.product_TE.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: ANY_ID, tenantId: TENANT_ID },
          data: expect.objectContaining({
            systemState: 'DELETED',
          }),
        }),
      )
    })

    it('should not apply tenantId filter for platform context', async () => {
      mockPrisma.product_TE.update.mockResolvedValue({})

      await repo.delete(ANY_ID, platformCtx)

      expect(mockPrisma.product_TE.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: ANY_ID },
        }),
      )
    })
  })
})
