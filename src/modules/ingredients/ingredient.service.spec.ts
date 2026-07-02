import { InternalServerErrorException } from '@nestjs/common'
import {
  EntityLockedError,
  EntityNotLockedError,
} from '@shared/errors/entity-state.errors'
import { IngredientService } from './ingredient.service'
import { Ingredient_TE } from './ingredient.entity'
import { IngredientNotFoundError } from './ingredient.errors'
import { IngredientFunctionType } from '@prisma/client'
import { SystemState } from '@shared/behaviours/lockable'
import { Id } from '@shared/value-objects'

describe('IngredientService', () => {
  let service: IngredientService
  let repository: any

  /** Minimal required props for Ingredient_TE.create */
  const defaultCreateProps = {
    code: 'ING-001',
    internalName: 'Test Ingredient',
    ingredientFunction: IngredientFunctionType.INGREDIENT,
    externalCode: null,
    commercialName: null,
    saleDenomination: null,
    functionalGroupId: null,
    notes: null,
    manufacturerId: null,
    supplierId: null,
    technicalSourceId: null,
    usageIndication: null,
    ingredientsListDesc: null,
    hasRtiqPiq: false,
    gmoIngredient: null,
    gmoDonorSpecies: null,
    gmoPercentage: null,
    irradiatedIngredient: null,
    flavorOriginType: null,
    colorantOriginType: null,
    containsAddedSugars: false,
    containsIngredientWithAddedSugars: false,
    containsNaturallyOccurringSugarSubstitutes: false,
    usesProcessingThatIncreasesSugars: false,
    containsAddedFatsOrOils: false,
    containsButterOrMargarine: false,
    containsDairyCream: false,
    containsIngredientsWithFatsOrCream: false,
    pac: null,
    pod: null,
    totalSolids: null,
    ashContent: null,
  }

  const tenantCtx = {
    userId: 'user-1',
    scope: 'TENANT' as any,
    tenantId: 'tenant-1',
    roles: ['ADMIN'],
  }

  const platformCtx = {
    userId: 'admin',
    scope: 'PLATFORM' as any,
    roles: ['ADMIN'],
    impersonatedTenantId: null,
  }

  /** Build a persisted Ingredient_TE fixture */
  function createIngredient(overrides: Record<string, any> = {}): Ingredient_TE {
    return Ingredient_TE.create({
      ...defaultCreateProps,
      tenantId: 'tenant-1',
      ...overrides,
    })
  }

  /** Build a rehydrated Ingredient_TE (e.g. in LOCKED state) */
  function rehydrateIngredient(overrides: Record<string, any> = {}): Ingredient_TE {
    const fresh = createIngredient()
    return Ingredient_TE.rehydrate({
      id: Id.from(fresh.id.value),
      tenantId: fresh.tenantId,
      code: fresh.code,
      internalName: fresh.internalName,
      ingredientFunction: fresh.ingredientFunction,
      externalCode: fresh.externalCode,
      commercialName: fresh.commercialName,
      saleDenomination: fresh.saleDenomination,
      functionalGroupId: fresh.functionalGroupId,
      notes: fresh.notes,
      manufacturerId: fresh.manufacturerId,
      supplierId: fresh.supplierId,
      technicalSourceId: fresh.technicalSourceId,
      usageIndication: fresh.usageIndication,
      ingredientsListDesc: fresh.ingredientsListDesc,
      hasRtiqPiq: fresh.hasRtiqPiq,
      gmoIngredient: fresh.gmoIngredient,
      gmoDonorSpecies: fresh.gmoDonorSpecies,
      gmoPercentage: fresh.gmoPercentage,
      irradiatedIngredient: fresh.irradiatedIngredient,
      flavorOriginType: fresh.flavorOriginType,
      colorantOriginType: fresh.colorantOriginType,
      containsAddedSugars: fresh.containsAddedSugars,
      containsIngredientWithAddedSugars: fresh.containsIngredientWithAddedSugars,
      containsNaturallyOccurringSugarSubstitutes: fresh.containsNaturallyOccurringSugarSubstitutes,
      usesProcessingThatIncreasesSugars: fresh.usesProcessingThatIncreasesSugars,
      containsAddedFatsOrOils: fresh.containsAddedFatsOrOils,
      containsButterOrMargarine: fresh.containsButterOrMargarine,
      containsDairyCream: fresh.containsDairyCream,
      containsIngredientsWithFatsOrCream: fresh.containsIngredientsWithFatsOrCream,
      pac: fresh.pac,
      pod: fresh.pod,
      totalSolids: fresh.totalSolids,
      ashContent: fresh.ashContent,
      systemState: SystemState.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    })
  }

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
    }
    service = new IngredientService(repository)
  })

  // --------------- create ---------------

  describe('create', () => {
    it('should resolve tenantId from ctx, create entity, and save', async () => {
      const saved = createIngredient()
      repository.save.mockResolvedValue(saved)

      const result = await service.create(
        { ...defaultCreateProps },
        tenantCtx,
      )

      expect(result.tenantId).toBe('tenant-1')
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _props: expect.objectContaining({ tenantId: 'tenant-1' }),
        }),
        tenantCtx,
      )
    })

    it('should throw InternalServerErrorException when ctx has no tenantId', async () => {
      await expect(
        service.create({ ...defaultCreateProps }, platformCtx),
      ).rejects.toThrow(InternalServerErrorException)
    })
  })

  // --------------- findById ---------------

  describe('findById', () => {
    it('should return ingredient when found', async () => {
      const ingredient = createIngredient()
      repository.findById.mockResolvedValue(ingredient)

      const result = await service.findById(ingredient.id.value, tenantCtx)

      expect(repository.findById).toHaveBeenCalledWith(ingredient.id.value, tenantCtx)
      expect(result).toBe(ingredient)
    })

    it('should throw IngredientNotFoundError when not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.findById('nonexistent', tenantCtx)).rejects.toThrow(
        IngredientNotFoundError,
      )
    })
  })

  // --------------- findAll ---------------

  describe('findAll', () => {
    it('should return list of ingredients', async () => {
      const list = [createIngredient()]
      repository.findAll.mockResolvedValue(list)

      const filter = { code: 'ING-001' }
      const result = await service.findAll(filter, tenantCtx)

      expect(repository.findAll).toHaveBeenCalledWith(filter, tenantCtx)
      expect(result).toHaveLength(1)
    })
  })

  // --------------- delete ---------------

  describe('delete', () => {
    it('should find ingredient, call entity.delete(), and save', async () => {
      const ingredient = createIngredient()
      repository.findById.mockResolvedValue(ingredient)
      repository.save.mockResolvedValue(ingredient)

      await service.delete(ingredient.id.value, tenantCtx)

      expect(repository.findById).toHaveBeenCalledWith(ingredient.id.value, tenantCtx)
      expect(repository.save).toHaveBeenCalled()
    })

    it('should throw IngredientNotFoundError when ingredient not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.delete('nonexistent', tenantCtx)).rejects.toThrow(
        IngredientNotFoundError,
      )
    })
  })

  // --------------- activate ---------------

  describe('activate', () => {
    it('should find ingredient, activate, and save', async () => {
      const ingredient = rehydrateIngredient({ systemState: SystemState.LOCKED })
      const unlocked = rehydrateIngredient({
        systemState: SystemState.ACTIVE,
      })
      repository.findById.mockResolvedValue(ingredient)
      repository.save.mockResolvedValue(unlocked)

      // unlock first so we can activate
      const unlocked_entity = ingredient
      unlocked_entity['unlock']()
      repository.findById.mockResolvedValue(unlocked_entity)
      repository.save.mockResolvedValue(unlocked_entity)

      const result = await service.activate(unlocked_entity.id.value, tenantCtx)

      expect(repository.save).toHaveBeenCalled()
      expect(result.systemState).toBe(SystemState.ACTIVE)
    })

    it('should throw EntityLockedError when ingredient is LOCKED', async () => {
      const ingredient = rehydrateIngredient({ systemState: SystemState.LOCKED })
      repository.findById.mockResolvedValue(ingredient)

      await expect(service.activate(ingredient.id.value, tenantCtx)).rejects.toThrow(
        EntityLockedError,
      )
    })
  })

  // --------------- lock ---------------

  describe('lock', () => {
    it('should find ingredient, lock, and save', async () => {
      const ingredient = createIngredient()
      repository.findById.mockResolvedValue(ingredient)
      repository.save.mockImplementation((entity: any) => Promise.resolve(entity))

      const result = await service.lock(ingredient.id.value, tenantCtx)

      expect(repository.save).toHaveBeenCalled()
      expect(result.systemState).toBe(SystemState.LOCKED)
    })
  })

  // --------------- unlock ---------------

  describe('unlock', () => {
    it('should find ingredient, unlock, and save', async () => {
      const ingredient = rehydrateIngredient({ systemState: SystemState.LOCKED })
      repository.findById.mockResolvedValue(ingredient)
      repository.save.mockResolvedValue(ingredient)

      const result = await service.unlock(ingredient.id.value, tenantCtx)

      expect(repository.save).toHaveBeenCalled()
    })

    it('should throw EntityNotLockedError when ingredient is ACTIVE', async () => {
      const ingredient = createIngredient()
      repository.findById.mockResolvedValue(ingredient)

      await expect(service.unlock(ingredient.id.value, tenantCtx)).rejects.toThrow(
        EntityNotLockedError,
      )
    })
  })
})
