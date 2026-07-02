/**
 * Ingredient_TE Repository Tests
 *
 * Tenant-scoped (TE) repository — tenantId filtering applied.
 * Tests the PrismaIngredient_TERepository CRUD operations and mapper.
 */

import { ForbiddenException } from '@nestjs/common'
import { SystemState } from '@shared/behaviours/lockable'
import { createTenantContext, createPlatformContext } from '../../test-utils'
import { IngredientFunctionType } from '@prisma/client'

import { Ingredient_TE } from './ingredient.entity'
import { PrismaIngredient_TERepository } from './ingredient.repository'

const ANY_ID = '550e8400-e29b-41d4-a716-446655440000'
const TENANT_ID = 'test-tenant-id'
const ctx = createTenantContext()
const platformCtx = createPlatformContext()

function createIngredientEntity(overrides: Partial<Record<string, unknown>> = {}) {
  return Ingredient_TE.create({
    tenantId: (overrides.tenantId as string) ?? TENANT_ID,
    code: (overrides.code as string) ?? 'ING-001',
    externalCode: (overrides.externalCode as string | null) ?? null,
    internalName: (overrides.internalName as string) ?? 'Test Ingredient',
    commercialName: (overrides.commercialName as string | null) ?? null,
    saleDenomination: (overrides.saleDenomination as string | null) ?? null,
    functionalGroupId: (overrides.functionalGroupId as string | null) ?? null,
    ingredientFunction: (overrides.ingredientFunction as IngredientFunctionType) ?? IngredientFunctionType.INGREDIENT,
    notes: (overrides.notes as string | null) ?? null,
    manufacturerId: (overrides.manufacturerId as string | null) ?? null,
    supplierId: (overrides.supplierId as string | null) ?? null,
    technicalSourceId: (overrides.technicalSourceId as string | null) ?? null,
    usageIndication: (overrides.usageIndication as string | null) ?? null,
    ingredientsListDesc: (overrides.ingredientsListDesc as string | null) ?? null,

    // Regulatory Profile
    hasRtiqPiq: (overrides.hasRtiqPiq as boolean) ?? false,
    gmoIngredient: (overrides.gmoIngredient as string | null) ?? null,
    gmoDonorSpecies: (overrides.gmoDonorSpecies as string | null) ?? null,
    gmoPercentage: (overrides.gmoPercentage as number | null) ?? null,
    irradiatedIngredient: (overrides.irradiatedIngredient as string | null) ?? null,
    flavorOriginType: (overrides.flavorOriginType as string | null) ?? null,
    colorantOriginType: (overrides.colorantOriginType as string | null) ?? null,

    // Labeling Profile
    containsAddedSugars: (overrides.containsAddedSugars as boolean) ?? false,
    containsIngredientWithAddedSugars: (overrides.containsIngredientWithAddedSugars as boolean) ?? false,
    containsNaturallyOccurringSugarSubstitutes: (overrides.containsNaturallyOccurringSugarSubstitutes as boolean) ?? false,
    usesProcessingThatIncreasesSugars: (overrides.usesProcessingThatIncreasesSugars as boolean) ?? false,
    containsAddedFatsOrOils: (overrides.containsAddedFatsOrOils as boolean) ?? false,
    containsButterOrMargarine: (overrides.containsButterOrMargarine as boolean) ?? false,
    containsDairyCream: (overrides.containsDairyCream as boolean) ?? false,
    containsIngredientsWithFatsOrCream: (overrides.containsIngredientsWithFatsOrCream as boolean) ?? false,

    // Technical Profile
    pac: (overrides.pac as number | null) ?? null,
    pod: (overrides.pod as number | null) ?? null,
    totalSolids: (overrides.totalSolids as number | null) ?? null,
    ashContent: (overrides.ashContent as number | null) ?? null,
  })
}

function createMockPrismaIngredientTE(
  overrides: Partial<Record<string, unknown>> = {},
) {
  return {
    id: (overrides.id as string) ?? ANY_ID,
    createdAt: (overrides.createdAt as Date) ?? new Date(),
    updatedAt: (overrides.updatedAt as Date) ?? new Date(),
    systemState: (overrides.systemState as string) ?? 'ACTIVE',
    tenantId: (overrides.tenantId as string) ?? TENANT_ID,
    code: (overrides.code as string) ?? 'ING-001',
    externalCode: (overrides.externalCode as string | null) ?? null,
    internalName: (overrides.internalName as string) ?? 'Test Ingredient',
    commercialName: (overrides.commercialName as string | null) ?? null,
    saleDenomination: (overrides.saleDenomination as string | null) ?? null,
    functionalGroupId: (overrides.functionalGroupId as string | null) ?? null,
    ingredientFunction: (overrides.ingredientFunction as IngredientFunctionType) ?? IngredientFunctionType.INGREDIENT,
    notes: (overrides.notes as string | null) ?? null,
    manufacturerId: (overrides.manufacturerId as string | null) ?? null,
    supplierId: (overrides.supplierId as string | null) ?? null,
    technicalSourceId: (overrides.technicalSourceId as string | null) ?? null,
    usageIndication: (overrides.usageIndication as string | null) ?? null,
    ingredientsListDesc: (overrides.ingredientsListDesc as string | null) ?? null,
    hasRtiqPiq: (overrides.hasRtiqPiq as boolean) ?? false,
    gmoIngredient: (overrides.gmoIngredient as string | null) ?? null,
    gmoDonorSpecies: (overrides.gmoDonorSpecies as string | null) ?? null,
    gmoPercentage: (overrides.gmoPercentage as any) ?? null,
    irradiatedIngredient: (overrides.irradiatedIngredient as string | null) ?? null,
    flavorOriginType: (overrides.flavorOriginType as string | null) ?? null,
    colorantOriginType: (overrides.colorantOriginType as string | null) ?? null,
    containsAddedSugars: (overrides.containsAddedSugars as boolean) ?? false,
    containsIngredientWithAddedSugars: (overrides.containsIngredientWithAddedSugars as boolean) ?? false,
    containsNaturallyOccurringSugarSubstitutes: (overrides.containsNaturallyOccurringSugarSubstitutes as boolean) ?? false,
    usesProcessingThatIncreasesSugars: (overrides.usesProcessingThatIncreasesSugars as boolean) ?? false,
    containsAddedFatsOrOils: (overrides.containsAddedFatsOrOils as boolean) ?? false,
    containsButterOrMargarine: (overrides.containsButterOrMargarine as boolean) ?? false,
    containsDairyCream: (overrides.containsDairyCream as boolean) ?? false,
    containsIngredientsWithFatsOrCream: (overrides.containsIngredientsWithFatsOrCream as boolean) ?? false,
    pac: (overrides.pac as any) ?? null,
    pod: (overrides.pod as any) ?? null,
    totalSolids: (overrides.totalSolids as any) ?? null,
    ashContent: (overrides.ashContent as any) ?? null,
  }
}

describe('PrismaIngredient_TERepository', () => {
  let mockPrisma: any
  let repo: PrismaIngredient_TERepository

  beforeEach(() => {
    mockPrisma = {
      ingredient_TE: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
    }
    repo = new PrismaIngredient_TERepository(mockPrisma as any)
  })

  // ============================================================
  // save
  // ============================================================
  describe('save', () => {
    it('should upsert entity with tenantId filter and return it', async () => {
      mockPrisma.ingredient_TE.upsert.mockResolvedValue({})
      const entity = createIngredientEntity({ internalName: 'Sugar' })

      const result = await repo.save(entity, ctx)

      expect(mockPrisma.ingredient_TE.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: entity.id.value },
          update: expect.objectContaining({ internalName: 'Sugar' }),
          create: expect.objectContaining({ internalName: 'Sugar' }),
        }),
      )
      expect(result).toBe(entity)
    })

    it('should throw ForbiddenException when saving cross-tenant entity', async () => {
      const entity = createIngredientEntity({
        tenantId: 'other-tenant',
        internalName: 'Cross-tenant',
      })

      await expect(repo.save(entity, ctx)).rejects.toThrow(ForbiddenException)
    })

    it('should persist all domain properties (toPersistence)', async () => {
      mockPrisma.ingredient_TE.upsert.mockResolvedValue({})
      const entity = createIngredientEntity({
        code: 'ING-002',
        internalName: 'Glucose Syrup',
        ingredientFunction: IngredientFunctionType.INGREDIENT,
      })

      await repo.save(entity, ctx)

      const [args] = mockPrisma.ingredient_TE.upsert.mock.calls[0]
      expect(args.create).toMatchObject({
        id: entity.id.value,
        code: 'ING-002',
        internalName: 'Glucose Syrup',
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
      mockPrisma.ingredient_TE.findUnique.mockResolvedValue(
        createMockPrismaIngredientTE({ internalName: 'Soy Lecithin' }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).not.toBeNull()
      expect(result!.internalName).toBe('Soy Lecithin')
      expect(result!.id.value).toBe(ANY_ID)
      expect(result!.tenantId).toBe(TENANT_ID)
    })

    it('should return null when not found', async () => {
      mockPrisma.ingredient_TE.findUnique.mockResolvedValue(null)

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })

    it('should return null when entity is DELETED', async () => {
      mockPrisma.ingredient_TE.findUnique.mockResolvedValue(
        createMockPrismaIngredientTE({ systemState: 'DELETED' }),
      )

      const result = await repo.findById(ANY_ID, ctx)

      expect(result).toBeNull()
    })

    it('should filter by tenantId for tenant-scoped context', async () => {
      const whereSpy = jest.fn()
      mockPrisma.ingredient_TE.findUnique.mockImplementation(
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
      mockPrisma.ingredient_TE.findUnique.mockResolvedValue(
        createMockPrismaIngredientTE({ internalName: 'Platform Access' }),
      )

      const result = await repo.findById(ANY_ID, platformCtx)

      expect(result).not.toBeNull()
      expect(result!.internalName).toBe('Platform Access')
    })
  })

  // ============================================================
  // findAll
  // ============================================================
  describe('findAll', () => {
    it('should return all active entities filtered by tenantId', async () => {
      mockPrisma.ingredient_TE.findMany.mockResolvedValue([
        createMockPrismaIngredientTE({
          id: '550e8400-e29b-41d4-a716-446655440100',
          internalName: 'Ingredient A',
        }),
        createMockPrismaIngredientTE({
          id: '550e8400-e29b-41d4-a716-446655440101',
          internalName: 'Ingredient B',
        }),
      ])

      const result = await repo.findAll({}, ctx)

      expect(result).toHaveLength(2)
      expect(result[0]!.internalName).toBe('Ingredient A')
      expect(result[1]!.internalName).toBe('Ingredient B')
    })

    it('should apply pagination defaults (skip=0, take=100)', async () => {
      const argsSpy = jest.fn()
      mockPrisma.ingredient_TE.findMany.mockImplementation(
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

    it('should filter by internalName', async () => {
      const whereSpy = jest.fn()
      mockPrisma.ingredient_TE.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({ internalName: 'Sugar' }, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          internalName: { contains: 'Sugar', mode: 'insensitive' },
        }),
      )
    })

    it('should exclude DELETED entities for tenant context', async () => {
      const whereSpy = jest.fn()
      mockPrisma.ingredient_TE.findMany.mockImplementation(
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
      mockPrisma.ingredient_TE.findMany.mockImplementation(
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

    it('should filter by ingredientFunction', async () => {
      const whereSpy = jest.fn()
      mockPrisma.ingredient_TE.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({ ingredientFunction: IngredientFunctionType.INGREDIENT }, ctx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ingredientFunction: IngredientFunctionType.INGREDIENT,
        }),
      )
    })

    it('should filter by systemState when provided for platform context', async () => {
      const whereSpy = jest.fn()
      mockPrisma.ingredient_TE.findMany.mockImplementation(
        (args: { where: Record<string, unknown> }) => {
          whereSpy(args.where)
          return Promise.resolve([])
        },
      )

      await repo.findAll({ systemState: SystemState.LOCKED }, platformCtx)

      expect(whereSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          systemState: SystemState.LOCKED,
        }),
      )
    })
  })

  // ============================================================
  // delete
  // ============================================================
  describe('delete', () => {
    it('should soft-delete by updating systemState to DELETED with tenantId filter', async () => {
      mockPrisma.ingredient_TE.update.mockResolvedValue({})

      await repo.delete(ANY_ID, ctx)

      expect(mockPrisma.ingredient_TE.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: ANY_ID, tenantId: TENANT_ID },
          data: expect.objectContaining({
            systemState: SystemState.DELETED,
          }),
        }),
      )
    })

    it('should not apply tenantId filter for platform context', async () => {
      mockPrisma.ingredient_TE.update.mockResolvedValue({})

      await repo.delete(ANY_ID, platformCtx)

      expect(mockPrisma.ingredient_TE.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: ANY_ID },
        }),
      )
    })
  })
})
