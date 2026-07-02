/**
 * T-092a: Ingredient_TE full CRUD with children
 *
 * Integration test: Controller → Service → Repository (mocked PrismaService)
 *
 * Scenarios:
 * 1. Create Ingredient_TE with all fields via controller
 * 2. Add child entities via their services (allergen, nutrient, flag, cost)
 * 3. Verify children were persisted via Prisma mock assertions
 * 4. Delete Ingredient_TE (soft delete via controller)
 */

import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '@shared/prisma/prisma.service'
import { IngredientsController } from '@ingredients/ingredient.controller'
import { IngredientService } from '@ingredients/ingredient.service'
import {
  IngredientRepository,
  PrismaIngredient_TERepository,
} from '@ingredients/ingredient.repository'
import { IngredientAllergen_TEService } from '@ingredients/ingredient-allergen-te.service'
import {
  IngredientAllergen_TE_Repository,
  PrismaIngredientAllergen_TE_Repository,
} from '@ingredients/ingredient-allergen-te.repository'
import { IngredientNutrient_TEService } from '@ingredients/ingredient-nutrient-te.service'
import {
  IngredientNutrient_TE_Repository,
  PrismaIngredientNutrient_TE_Repository,
} from '@ingredients/ingredient-nutrient-te.repository'
import { IngredientFlag_TEService } from '@ingredients/ingredient-flag-te.service'
import {
  IngredientFlag_TE_Repository,
  PrismaIngredientFlag_TE_Repository,
} from '@ingredients/ingredient-flag-te.repository'
import { IngredientCost_TEService } from '@ingredients/ingredient-cost-te.service'
import {
  IngredientCost_TE_Repository,
  PrismaIngredientCost_TE_Repository,
} from '@ingredients/ingredient-cost-te.repository'
import { createTenantContext } from '../../src/test-utils'
import { SystemState } from '@shared/behaviours/lockable'

describe('T-092a: Ingredient_TE full CRUD with children', () => {
  let ingredientController: IngredientsController
  let allergenService: IngredientAllergen_TEService
  let nutrientService: IngredientNutrient_TEService
  let flagService: IngredientFlag_TEService
  let costService: IngredientCost_TEService
  let prismaMock: {
    ingredient_TE: { findUnique: jest.Mock; findMany: jest.Mock; upsert: jest.Mock; update: jest.Mock }
    ingredientAllergen_TE: { findUnique: jest.Mock; findMany: jest.Mock; upsert: jest.Mock; delete: jest.Mock }
    ingredientNutrient_TE: { findUnique: jest.Mock; findMany: jest.Mock; upsert: jest.Mock; delete: jest.Mock }
    ingredientFlag_TE: { findUnique: jest.Mock; findMany: jest.Mock; upsert: jest.Mock; update: jest.Mock }
    ingredientCost_TE: { findUnique: jest.Mock; findMany: jest.Mock; upsert: jest.Mock; update: jest.Mock }
  }

  const tenantCtx = createTenantContext()
  const mockRequest = { context: tenantCtx } as any

  beforeEach(async () => {
    prismaMock = {
      ingredient_TE: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn().mockImplementation((args: any) =>
          Promise.resolve({ id: args.where.id, ...args.create }),
        ),
        update: jest.fn().mockResolvedValue({}),
      },
      ingredientAllergen_TE: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn().mockImplementation((args: any) =>
          Promise.resolve({ id: args.where.id, ...args.create }),
        ),
        delete: jest.fn().mockResolvedValue({}),
      },
      ingredientNutrient_TE: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn().mockImplementation((args: any) =>
          Promise.resolve({ id: args.where.id, ...args.create }),
        ),
        delete: jest.fn().mockResolvedValue({}),
      },
      ingredientFlag_TE: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn().mockImplementation((args: any) =>
          Promise.resolve({ id: args.where.id, ...args.create }),
        ),
        update: jest.fn().mockResolvedValue({}),
      },
      ingredientCost_TE: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn().mockImplementation((args: any) =>
          Promise.resolve({ id: args.where.id, ...args.create }),
        ),
        update: jest.fn().mockResolvedValue({}),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngredientsController],
      providers: [
        // Ingredient
        IngredientService,
        PrismaIngredient_TERepository,
        { provide: IngredientRepository, useExisting: PrismaIngredient_TERepository },
        // Allergen
        IngredientAllergen_TEService,
        PrismaIngredientAllergen_TE_Repository,
        {
          provide: IngredientAllergen_TE_Repository,
          useExisting: PrismaIngredientAllergen_TE_Repository,
        },
        // Nutrient
        IngredientNutrient_TEService,
        PrismaIngredientNutrient_TE_Repository,
        {
          provide: IngredientNutrient_TE_Repository,
          useExisting: PrismaIngredientNutrient_TE_Repository,
        },
        // Flag
        IngredientFlag_TEService,
        PrismaIngredientFlag_TE_Repository,
        {
          provide: IngredientFlag_TE_Repository,
          useExisting: PrismaIngredientFlag_TE_Repository,
        },
        // Cost
        IngredientCost_TEService,
        PrismaIngredientCost_TE_Repository,
        {
          provide: IngredientCost_TE_Repository,
          useExisting: PrismaIngredientCost_TE_Repository,
        },
        // Mock Prisma
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile()

    ingredientController = module.get(IngredientsController)
    allergenService = module.get(IngredientAllergen_TEService)
    nutrientService = module.get(IngredientNutrient_TEService)
    flagService = module.get(IngredientFlag_TEService)
    costService = module.get(IngredientCost_TEService)
  })

  // ---------------------------------------------------------------
  // 1. Create Ingredient_TE with all fields
  // ---------------------------------------------------------------
  it('should create Ingredient_TE with all fields via controller', async () => {
    // Arrange
    const dto = {
      code: 'ING-001',
      externalCode: 'EXT-001',
      internalName: 'Test Ingredient',
      commercialName: 'Commercial Name',
      saleDenomination: 'Sale Name',
      ingredientFunction: 'INGREDIENT' as const,
      notes: 'Test notes',
      usageIndication: 'Usage indication text',
      ingredientsListDesc: 'Ingredient list description',
      // Regulatory profile
      hasRtiqPiq: true,
      gmoIngredient: 'NON_GMO',
      irradiatedIngredient: 'NOT_IRRADIATED',
      // Labeling profile
      containsAddedSugars: false,
      containsIngredientWithAddedSugars: false,
      containsNaturallyOccurringSugarSubstitutes: false,
      usesProcessingThatIncreasesSugars: false,
      containsAddedFatsOrOils: false,
      containsButterOrMargarine: false,
      containsDairyCream: false,
      containsIngredientsWithFatsOrCream: false,
      // Technical profile
      pac: 2.5,
      pod: 1.8,
      totalSolids: 95,
      ashContent: 0.5,
    }

    // Act
    const result = await ingredientController.create(dto, mockRequest)

    // Assert — response DTO
    expect(result).toBeDefined()
    expect(result.id).toBeDefined()
    expect(result.code).toBe('ING-001')
    expect(result.externalCode).toBe('EXT-001')
    expect(result.internalName).toBe('Test Ingredient')
    expect(result.commercialName).toBe('Commercial Name')
    expect(result.ingredientFunction).toBe('INGREDIENT')
    expect(result.hasRtiqPiq).toBe(true)

    // Assert — Prisma was called with correct mapped data
    expect(prismaMock.ingredient_TE.upsert).toHaveBeenCalledTimes(1)
    const upsertCall = prismaMock.ingredient_TE.upsert.mock.calls[0][0]
    expect(upsertCall.create).toMatchObject({
      code: 'ING-001',
      externalCode: 'EXT-001',
      internalName: 'Test Ingredient',
      commercialName: 'Commercial Name',
      ingredientFunction: 'INGREDIENT',
      hasRtiqPiq: true,
      pac: 2.5,
      tenantId: tenantCtx.tenantId,
    })
  })

  // ---------------------------------------------------------------
  // 2. Add child entities
  // ---------------------------------------------------------------
  it('should add IngredientAllergen_TE, IngredientNutrient_TE, IngredientFlag_TE, and IngredientCost_TE', async () => {
    // Arrange — create the ingredient
    const ingredient = await ingredientController.create(
      {
        code: 'ING-CHILD-001',
        internalName: 'Children Ingredient',
        ingredientFunction: 'INGREDIENT' as const,
      },
      mockRequest,
    )
    const ingredientId = ingredient.id

    // Act — create Allergen junction
    const allergen = await allergenService.create(
      {
        ingredientId,
        allergenId: 'allergen-pl-1',
        relationType: 'CONTAINS' as any,
      },
      tenantCtx,
    )

    // Act — create Nutrient junction
    const nutrient = await nutrientService.create(
      {
        ingredientId,
        nutrientId: 'nutrient-pl-1',
        value: 12.5,
        sourceId: null,
      },
      tenantCtx,
    )

    // Act — create Flag junction
    const flag = await flagService.create(
      {
        ingredientId,
        flagId: 'flag-pl-1',
        flagValue: true,
        notes: 'Test flag note',
      },
      tenantCtx,
    )

    // Act — create Cost record
    const cost = await costService.create(
      {
        ingredientId,
        unitPrice: 5.99,
        currencyCode: 'BRL',
        unitOfMeasureId: 'uom-1',
        effectiveDate: new Date('2025-01-01'),
        supplierId: null,
        notes: null,
      },
      tenantCtx,
    )

    // Assert — Allergen
    expect(allergen).toBeDefined()
    expect(allergen.ingredientId).toBe(ingredientId)
    expect(allergen.allergenId).toBe('allergen-pl-1')
    expect(allergen.relationType).toBe('CONTAINS')
    expect(prismaMock.ingredientAllergen_TE.upsert).toHaveBeenCalled()
    const allergenCall =
      prismaMock.ingredientAllergen_TE.upsert.mock.calls[0][0]
    expect(allergenCall.create).toMatchObject({
      ingredientId,
      allergenId: 'allergen-pl-1',
      relationType: 'CONTAINS',
      tenantId: tenantCtx.tenantId,
    })

    // Assert — Nutrient
    expect(nutrient).toBeDefined()
    expect(nutrient.ingredientId).toBe(ingredientId)
    expect(nutrient.nutrientId).toBe('nutrient-pl-1')
    expect(nutrient.value).toBe(12.5)
    expect(prismaMock.ingredientNutrient_TE.upsert).toHaveBeenCalled()
    const nutrientCall =
      prismaMock.ingredientNutrient_TE.upsert.mock.calls[0][0]
    expect(nutrientCall.create).toMatchObject({
      ingredientId,
      nutrientId: 'nutrient-pl-1',
      tenantId: tenantCtx.tenantId,
    })

    // Assert — Flag
    expect(flag).toBeDefined()
    expect(flag.ingredientId).toBe(ingredientId)
    expect(flag.flagId).toBe('flag-pl-1')
    expect(flag.flagValue).toBe(true)
    expect(prismaMock.ingredientFlag_TE.upsert).toHaveBeenCalled()
    const flagCall = prismaMock.ingredientFlag_TE.upsert.mock.calls[0][0]
    expect(flagCall.create).toMatchObject({
      ingredientId,
      flagId: 'flag-pl-1',
      flagValue: true,
      tenantId: tenantCtx.tenantId,
    })

    // Assert — Cost
    expect(cost).toBeDefined()
    expect(cost.ingredientId).toBe(ingredientId)
    expect(cost.unitPrice).toBe(5.99)
    expect(cost.currencyCode).toBe('BRL')
    expect(prismaMock.ingredientCost_TE.upsert).toHaveBeenCalled()
    const costCall = prismaMock.ingredientCost_TE.upsert.mock.calls[0][0]
    // unitPrice is stored as Prisma.Decimal in persistence; check string representation
    expect(costCall.create.unitPrice.toString()).toBe('5.99')
    expect(costCall.create).toMatchObject({
      ingredientId,
      currencyCode: 'BRL',
      tenantId: tenantCtx.tenantId,
    })
  })

  // ---------------------------------------------------------------
  // 3. Verify children persisted (read back via repository)
  // ---------------------------------------------------------------
  it('should retrieve children by ingredientId', async () => {
    // Arrange — create ingredient
    const ingredient = await ingredientController.create(
      {
        code: 'ING-FIND-001',
        internalName: 'Find Children',
        ingredientFunction: 'INGREDIENT' as const,
      },
      mockRequest,
    )
    const ingredientId = ingredient.id

    // Create child records
    await allergenService.create(
      { ingredientId, allergenId: 'a-1', relationType: 'CONTAINS' as any },
      tenantCtx,
    )
    await nutrientService.create(
      { ingredientId, nutrientId: 'n-1', value: 10, sourceId: null },
      tenantCtx,
    )
    await flagService.create(
      { ingredientId, flagId: 'f-1', flagValue: true, notes: null },
      tenantCtx,
    )
    await costService.create(
      {
        ingredientId,
        unitPrice: 3.0,
        currencyCode: 'USD',
        unitOfMeasureId: 'uom-kg',
        effectiveDate: new Date(),
        supplierId: null,
        notes: null,
      },
      tenantCtx,
    )

    // Mock findMany to return records (IDs must be valid UUIDs)
    const now = new Date()
    const allergenId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    const nutrientId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
    const flagId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
    const costId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
    prismaMock.ingredientAllergen_TE.findMany.mockResolvedValue([
      { id: allergenId, tenantId: tenantCtx.tenantId, ingredientId, allergenId, relationType: 'CONTAINS', createdAt: now, updatedAt: now },
    ])
    prismaMock.ingredientNutrient_TE.findMany.mockResolvedValue([
      { id: nutrientId, tenantId: tenantCtx.tenantId, ingredientId, nutrientId, value: { toNumber: () => 10 }, sourceId: null, createdAt: now, updatedAt: now },
    ])
    prismaMock.ingredientFlag_TE.findMany.mockResolvedValue([
      { id: flagId, tenantId: tenantCtx.tenantId, ingredientId, flagId, flagValue: true, notes: null, systemState: 'ACTIVE', createdAt: now, updatedAt: now },
    ])
    prismaMock.ingredientCost_TE.findMany.mockResolvedValue([
      { id: costId, tenantId: tenantCtx.tenantId, ingredientId, unitPrice: { toNumber: () => 3.0 }, currencyCode: 'USD', unitOfMeasureId: 'uom-kg', effectiveDate: now, supplierId: null, notes: null, systemState: 'ACTIVE', createdAt: now, updatedAt: now },
    ])

    // Act
    const allergens = await allergenService.findByIngredientId(ingredientId, tenantCtx)
    const nutrients = await nutrientService.findByIngredientId(ingredientId, tenantCtx)
    const flags = await flagService.findByIngredientId(ingredientId, tenantCtx)
    const costs = await costService.findByIngredientId(ingredientId, tenantCtx)

    // Assert
    expect(allergens).toHaveLength(1)
    expect(allergens[0]!.allergenId).toBe(allergenId)

    expect(nutrients).toHaveLength(1)
    expect(nutrients[0]!.nutrientId).toBe(nutrientId)
    expect(nutrients[0]!.value).toBe(10)

    expect(flags).toHaveLength(1)
    expect(flags[0]!.flagId).toBe(flagId)
    expect(flags[0]!.flagValue).toBe(true)

    expect(costs).toHaveLength(1)
    expect(costs[0]!.unitPrice).toBe(3.0)
    expect(costs[0]!.currencyCode).toBe('USD')
  })

  // ---------------------------------------------------------------
  // 4. Delete Ingredient_TE (soft delete)
  // ---------------------------------------------------------------
  it('should soft-delete Ingredient_TE via controller', async () => {
    // Arrange — create ingredient
    const ingredient = await ingredientController.create(
      {
        code: 'ING-DEL-001',
        internalName: 'To Be Deleted',
        ingredientFunction: 'INGREDIENT' as const,
      },
      mockRequest,
    )
    const ingredientId = ingredient.id

    // Mock findById to return the ingredient for the delete lookup
    prismaMock.ingredient_TE.findUnique.mockResolvedValue({
      id: ingredientId,
      tenantId: tenantCtx.tenantId,
      systemState: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Act
    await ingredientController.delete(ingredientId, mockRequest)

    // Assert — Prisma update called with DELETED systemState
    // The delete flow: controller → service.findById → repo.findById → ingredient.delete() → repo.save → prisma.upsert
    // service.findById calls repo.findById which uses prisma.ingredient_TE.findUnique
    // The repo adds tenantId to the where clause for tenant-scoped contexts
    expect(prismaMock.ingredient_TE.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: ingredientId, tenantId: tenantCtx.tenantId } }),
    )

    // The upsert (second call after the create upsert) should have systemState = DELETED
    expect(prismaMock.ingredient_TE.upsert).toHaveBeenCalledTimes(2)
    const deleteUpsert = prismaMock.ingredient_TE.upsert.mock.calls[1][0]
    expect(deleteUpsert.create).toMatchObject({
      systemState: SystemState.DELETED,
    })
  })
})
