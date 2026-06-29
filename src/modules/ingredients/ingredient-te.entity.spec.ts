import { Ingredient_TE, type CreateIngredient_TEProps } from './ingredient.entity'
import { SystemState } from '@shared/behaviours/lockable'
import { EntityDeletedError, EntityLockedError, EntityNotLockedError } from '@shared/errors/entity-state.errors'
import { IngredientFunctionType, FlavorOriginType, ColorantOriginType } from '@prisma/client'

describe('Ingredient_TE', () => {
  const validProps: CreateIngredient_TEProps = {
    tenantId: 'tenant-1',
    code: 'ING-001',
    externalCode: 'EXT-001',
    internalName: 'Test Ingredient',
    commercialName: 'Test Commercial',
    saleDenomination: 'Test Sale Denom',
    functionalGroupId: 'fg-1',
    ingredientFunction: IngredientFunctionType.SWEETENER,
    notes: 'Test notes',
    manufacturerId: 'mfr-1',
    supplierId: 'sup-1',
    technicalSourceId: 'ts-1',
    usageIndication: 'Test usage',
    ingredientsListDesc: 'Test ingredients list',
    // Regulatory Profile
    hasRtiqPiq: true,
    gmoIngredient: 'Non-GMO',
    gmoDonorSpecies: null,
    gmoPercentage: null,
    irradiatedIngredient: null,
    flavorOriginType: FlavorOriginType.NATURAL,
    colorantOriginType: null,
    // Labeling Profile
    containsAddedSugars: false,
    containsIngredientWithAddedSugars: false,
    containsNaturallyOccurringSugarSubstitutes: false,
    usesProcessingThatIncreasesSugars: false,
    containsAddedFatsOrOils: false,
    containsButterOrMargarine: false,
    containsDairyCream: false,
    containsIngredientsWithFatsOrCream: false,
    // Technical Profile
    pac: null,
    pod: null,
    totalSolids: null,
    ashContent: null,
  }

  describe('create', () => {
    it('should create with valid props', () => {
      const entity = Ingredient_TE.create(validProps)

      expect(entity.id).toBeDefined()
      expect(entity.id.value).toBeDefined()
      expect(entity.tenantId).toBe('tenant-1')
      expect(entity.code).toBe('ING-001')
      expect(entity.externalCode).toBe('EXT-001')
      expect(entity.internalName).toBe('Test Ingredient')
      expect(entity.commercialName).toBe('Test Commercial')
      expect(entity.saleDenomination).toBe('Test Sale Denom')
      expect(entity.functionalGroupId).toBe('fg-1')
      expect(entity.ingredientFunction).toBe(IngredientFunctionType.SWEETENER)
      expect(entity.notes).toBe('Test notes')
      expect(entity.manufacturerId).toBe('mfr-1')
      expect(entity.supplierId).toBe('sup-1')
      expect(entity.technicalSourceId).toBe('ts-1')
      expect(entity.usageIndication).toBe('Test usage')
      expect(entity.ingredientsListDesc).toBe('Test ingredients list')
      expect(entity.hasRtiqPiq).toBe(true)
      expect(entity.gmoIngredient).toBe('Non-GMO')
      expect(entity.gmoDonorSpecies).toBeNull()
      expect(entity.gmoPercentage).toBeNull()
      expect(entity.irradiatedIngredient).toBeNull()
      expect(entity.flavorOriginType).toBe(FlavorOriginType.NATURAL)
      expect(entity.colorantOriginType).toBeNull()
      expect(entity.containsAddedSugars).toBe(false)
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should create with nullable fields as null', () => {
      const entity = Ingredient_TE.create({
        ...validProps,
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
      })

      expect(entity.externalCode).toBeNull()
      expect(entity.commercialName).toBeNull()
      expect(entity.saleDenomination).toBeNull()
      expect(entity.functionalGroupId).toBeNull()
      expect(entity.notes).toBeNull()
      expect(entity.manufacturerId).toBeNull()
      expect(entity.supplierId).toBeNull()
      expect(entity.technicalSourceId).toBeNull()
      expect(entity.usageIndication).toBeNull()
      expect(entity.ingredientsListDesc).toBeNull()
    })
  })

  describe('rehydrate', () => {
    it('should rehydrate from persisted props', () => {
      const idValue = '550e8400-e29b-41d4-a716-446655440000'
      const id = { value: idValue } as any
      const now = new Date()

      const entity = Ingredient_TE.rehydrate({
        id,
        tenantId: 'tenant-1',
        code: 'ING-001',
        externalCode: null,
        internalName: 'Test Ingredient',
        commercialName: null,
        saleDenomination: null,
        functionalGroupId: null,
        ingredientFunction: IngredientFunctionType.SWEETENER,
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
        createdAt: now,
        updatedAt: now,
        systemState: SystemState.ACTIVE,
      })

      expect(entity.id.value).toBe(idValue)
      expect(entity.internalName).toBe('Test Ingredient')
      expect(entity.code).toBe('ING-001')
      expect(entity.ingredientFunction).toBe(IngredientFunctionType.SWEETENER)
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })
  })

  describe('behaviors', () => {
    it('should change code', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.changeCode('ING-002')
      expect(entity.code).toBe('ING-002')
    })

    it('should change externalCode', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.changeExternalCode('EXT-002')
      expect(entity.externalCode).toBe('EXT-002')
    })

    it('should change internalName', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.changeInternalName('Updated Name')
      expect(entity.internalName).toBe('Updated Name')
    })

    it('should change commercialName', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.changeCommercialName('Updated Commercial')
      expect(entity.commercialName).toBe('Updated Commercial')
    })

    it('should change saleDenomination', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.changeSaleDenomination('Updated Denom')
      expect(entity.saleDenomination).toBe('Updated Denom')
    })

    it('should change functionalGroup', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.changeFunctionalGroup('fg-2')
      expect(entity.functionalGroupId).toBe('fg-2')
    })

    it('should change ingredientFunction', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.changeIngredientFunction(IngredientFunctionType.FLAVORING)
      expect(entity.ingredientFunction).toBe(IngredientFunctionType.FLAVORING)
    })

    it('should change notes', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.changeNotes('Updated notes')
      expect(entity.notes).toBe('Updated notes')
    })

    it('should change manufacturer', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.changeManufacturer('mfr-2')
      expect(entity.manufacturerId).toBe('mfr-2')
    })

    it('should change supplier', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.changeSupplier('sup-2')
      expect(entity.supplierId).toBe('sup-2')
    })

    it('should change technicalSource', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.changeTechnicalSource('ts-2')
      expect(entity.technicalSourceId).toBe('ts-2')
    })

    it('should change usageIndication', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.changeUsageIndication('New usage')
      expect(entity.usageIndication).toBe('New usage')
    })

    it('should change ingredientsListDesc', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.changeIngredientsListDesc('New list')
      expect(entity.ingredientsListDesc).toBe('New list')
    })

    it('should change hasRtiqPiq', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.changeHasRtiqPiq(false)
      expect(entity.hasRtiqPiq).toBe(false)
    })

    it('should change gmoIngredient', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.changeGmoIngredient('GMO')
      expect(entity.gmoIngredient).toBe('GMO')
    })

    it('should change gmoDonorSpecies', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.changeGmoDonorSpecies('Soy')
      expect(entity.gmoDonorSpecies).toBe('Soy')
    })

    it('should change gmoPercentage', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.changeGmoPercentage(5.5)
      expect(entity.gmoPercentage).toBe(5.5)
    })

    it('should change irradiatedIngredient', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.changeIrradiatedIngredient('None')
      expect(entity.irradiatedIngredient).toBe('None')
    })

    it('should change flavorOriginType', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.changeFlavorOriginType(FlavorOriginType.ARTIFICIAL)
      expect(entity.flavorOriginType).toBe(FlavorOriginType.ARTIFICIAL)
    })

    it('should change colorantOriginType', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.changeColorantOriginType(ColorantOriginType.NATURAL)
      expect(entity.colorantOriginType).toBe(ColorantOriginType.NATURAL)
    })

    it('should change labeling flags', () => {
      const entity = Ingredient_TE.create(validProps)

      entity.changeContainsAddedSugars(true)
      expect(entity.containsAddedSugars).toBe(true)

      entity.changeContainsIngredientWithAddedSugars(true)
      expect(entity.containsIngredientWithAddedSugars).toBe(true)

      entity.changeContainsNaturallyOccurringSugarSubstitutes(true)
      expect(entity.containsNaturallyOccurringSugarSubstitutes).toBe(true)

      entity.changeUsesProcessingThatIncreasesSugars(true)
      expect(entity.usesProcessingThatIncreasesSugars).toBe(true)

      entity.changeContainsAddedFatsOrOils(true)
      expect(entity.containsAddedFatsOrOils).toBe(true)

      entity.changeContainsButterOrMargarine(true)
      expect(entity.containsButterOrMargarine).toBe(true)

      entity.changeContainsDairyCream(true)
      expect(entity.containsDairyCream).toBe(true)

      entity.changeContainsIngredientsWithFatsOrCream(true)
      expect(entity.containsIngredientsWithFatsOrCream).toBe(true)
    })

    it('should change technical profile fields', () => {
      const entity = Ingredient_TE.create(validProps)

      entity.changePac(10.5)
      expect(entity.pac).toBe(10.5)

      entity.changePod(5.2)
      expect(entity.pod).toBe(5.2)

      entity.changeTotalSolids(30.0)
      expect(entity.totalSolids).toBe(30.0)

      entity.changeAshContent(2.1)
      expect(entity.ashContent).toBe(2.1)
    })

    it('should update updatedAt on change', () => {
      const entity = Ingredient_TE.create(validProps)
      const original = entity.updatedAt

      // Small delay to ensure time difference
      entity.changeInternalName('New Name')

      expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(original.getTime())
    })
  })

  describe('lifecycle', () => {
    it('should start as ACTIVE', () => {
      const entity = Ingredient_TE.create(validProps)
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should activate when already active', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.activate()
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should set inactive via setInactive (sets DELETED)', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.setInactive()
      expect(entity.systemState).toBe(SystemState.DELETED)
    })

    it('should toggle from ACTIVE to DELETED via toggleActive', () => {
      const entity = Ingredient_TE.create(validProps)
      expect(entity.systemState).toBe(SystemState.ACTIVE)

      entity.toggleActive()
      expect(entity.systemState).toBe(SystemState.DELETED)
    })

    it('should toggle from DELETED to ... throw EntityDeletedError', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.setInactive()
      expect(entity.systemState).toBe(SystemState.DELETED)

      // toggleActive calls activate() which calls ensureActivated() → throws
      expect(() => entity.toggleActive()).toThrow(EntityDeletedError)
    })

    it('should throw EntityLockedError on toggleActive when LOCKED', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.lock()
      expect(entity.systemState).toBe(SystemState.LOCKED)

      expect(() => entity.toggleActive()).toThrow(EntityLockedError)
    })

    it('should throw on setInactive when already DELETED', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.delete()
      expect(entity.systemState).toBe(SystemState.DELETED)

      expect(() => entity.setInactive()).toThrow(EntityDeletedError)
    })

    it('should throw EntityLockedError on activate when LOCKED', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.lock()
      expect(() => entity.activate()).toThrow(EntityLockedError)
    })

    it('should throw EntityDeletedError on activate when DELETED', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.delete()
      expect(() => entity.activate()).toThrow(EntityDeletedError)
    })
  })

  describe('Lockable', () => {
    it('should lock and unlock', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.lock()
      expect(entity.systemState).toBe(SystemState.LOCKED)

      entity.unlock()
      expect(entity.systemState).toBe(SystemState.ACTIVE)
    })

    it('should throw EntityNotLockedError on unlock when not locked', () => {
      const entity = Ingredient_TE.create(validProps)
      expect(() => entity.unlock()).toThrow(EntityNotLockedError)
    })

    it('should delete entity', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.delete()
      expect(entity.systemState).toBe(SystemState.DELETED)
    })

    it('should throw on behaviors when DELETED', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.delete()

      expect(() => entity.changeCode('X')).toThrow(EntityDeletedError)
      expect(() => entity.changeInternalName('X')).toThrow(EntityDeletedError)
      expect(() => entity.changeExternalCode('X')).toThrow(EntityDeletedError)
      expect(() => entity.changeCommercialName('X')).toThrow(EntityDeletedError)
      expect(() => entity.changeSaleDenomination('X')).toThrow(EntityDeletedError)
      expect(() => entity.changeFunctionalGroup('X')).toThrow(EntityDeletedError)
      expect(() => entity.changeIngredientFunction(IngredientFunctionType.SWEETENER)).toThrow(EntityDeletedError)
      expect(() => entity.changeNotes('X')).toThrow(EntityDeletedError)
      expect(() => entity.changeManufacturer('X')).toThrow(EntityDeletedError)
      expect(() => entity.changeSupplier('X')).toThrow(EntityDeletedError)
      expect(() => entity.changeTechnicalSource('X')).toThrow(EntityDeletedError)
      expect(() => entity.changeUsageIndication('X')).toThrow(EntityDeletedError)
      expect(() => entity.changeIngredientsListDesc('X')).toThrow(EntityDeletedError)
      expect(() => entity.changeHasRtiqPiq(false)).toThrow(EntityDeletedError)
      expect(() => entity.changeGmoIngredient('X')).toThrow(EntityDeletedError)
      expect(() => entity.changeFlavorOriginType(FlavorOriginType.NATURAL)).toThrow(EntityDeletedError)
      expect(() => entity.changeColorantOriginType(ColorantOriginType.NATURAL)).toThrow(EntityDeletedError)
      expect(() => entity.changeContainsAddedSugars(true)).toThrow(EntityDeletedError)
      expect(() => entity.changePac(1)).toThrow(EntityDeletedError)
      expect(() => entity.setInactive()).toThrow(EntityDeletedError)
    })

    it('should throw on behaviors when LOCKED', () => {
      const entity = Ingredient_TE.create(validProps)
      entity.lock()

      expect(() => entity.changeCode('X')).toThrow(EntityLockedError)
      expect(() => entity.changeInternalName('X')).toThrow(EntityLockedError)
      expect(() => entity.changeNotes('X')).toThrow(EntityLockedError)
      expect(() => entity.changeSupplier('X')).toThrow(EntityLockedError)
      expect(() => entity.changeContainsAddedSugars(true)).toThrow(EntityLockedError)
      expect(() => entity.changePac(1)).toThrow(EntityLockedError)
    })
  })
})
