import {
  Injectable,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common'
import {
  IngredientRepository,
  IngredientFilter
} from '@ingredients/ingredient.repository'
import {
  Ingredient,
  CreateIngredientProps
} from '@ingredients/ingredient.entity'
import {
  IngredientNotFoundError,
  IngredientAlreadyExistsError
} from '@ingredients/ingredient.errors'
import { RequestContext } from '@authorization/authorization.types'
import { UserScope } from '@users/user.types'
import { Prisma, AllergenRelationType } from '@prisma/client'
import { PrismaService } from '@shared/prisma/prisma.service'
import { Id } from '@shared/value-objects'
import { SaveAllIngredientDto } from '@ingredients/ingredient.dto'
import { AuditLogService } from '@audit-logs/audit-log.service'

@Injectable()
export class IngredientService {
  constructor(
    private readonly repository: IngredientRepository,
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService
  ) {}

  async create(
    props: CreateIngredientProps,
    ctx: RequestContext
  ): Promise<Ingredient> {
    // TODO: zod validate input
    const tenantId =
      ctx.scope === UserScope.TENANT ? ctx.tenantId : props.tenantId
    const ingredient = Ingredient.create({ ...props, tenantId })

    const saved = await this.repository.save(ingredient, ctx)

    // Auto-create empty profiles after ingredient creation
    const now = new Date()
    await this.prisma.$transaction([
      this.prisma.ingredientRegulatoryProfile.create({
        data: {
          id: Id.generate().value,
          ingredientId: ingredient.id.value,
          tenantId,
          createdAt: now,
          updatedAt: now
        }
      }),
      this.prisma.ingredientLabelingProfile.create({
        data: {
          id: Id.generate().value,
          ingredientId: ingredient.id.value,
          tenantId,
          createdAt: now,
          updatedAt: now
        }
      }),
      this.prisma.ingredientTechnicalProfile.create({
        data: {
          id: Id.generate().value,
          ingredientId: ingredient.id.value,
          tenantId,
          createdAt: now,
          updatedAt: now
        }
      })
    ])

    // Log creation
    await this.auditLogService.create(
      {
        entityName: 'Ingredient',
        entityId: ingredient.id.value,
        userId: ctx.userId,
        tenantId,
        ipAddress: null,
        userAgent: null,
        action: 'INGREDIENT_CREATED',
        before: null,
        after: await this.buildSnapshot(ingredient.id.value, tenantId),
        description: 'Criação do ingrediente'
      },
      ctx
    )

    return saved
  }

  async findAll(
    filter: IngredientFilter,
    ctx: RequestContext
  ): Promise<Ingredient[]> {
    return this.repository.findAll(filter, ctx)
  }

  async findById(id: string, ctx: RequestContext): Promise<Ingredient> {
    const ingredient = await this.repository.findById(id, ctx)
    if (!ingredient) {
      throw new IngredientNotFoundError(id)
    }
    return ingredient
  }

  async save(ingredient: Ingredient, ctx: RequestContext): Promise<Ingredient> {
    return this.repository.save(ingredient, ctx)
  }

  async delete(id: string, ctx: RequestContext): Promise<void> {
    const ingredient = await this.findById(id, ctx)
    ingredient.delete()
    await this.repository.save(ingredient, ctx)
  }

  async activate(id: string, ctx: RequestContext): Promise<Ingredient> {
    const ingredient = await this.findById(id, ctx)
    ingredient.activate()
    return this.repository.save(ingredient, ctx)
  }

  async lock(id: string, ctx: RequestContext): Promise<Ingredient> {
    const ingredient = await this.findById(id, ctx)
    ingredient.lock()
    return this.repository.save(ingredient, ctx)
  }

  async unlock(id: string, ctx: RequestContext): Promise<Ingredient> {
    const ingredient = await this.findById(id, ctx)
    ingredient.unlock()
    return this.repository.save(ingredient, ctx)
  }

  async saveAll(
    id: string,
    dto: SaveAllIngredientDto,
    ctx: RequestContext
  ): Promise<Ingredient> {
    if (ctx.scope !== UserScope.TENANT) {
      throw new ForbiddenException(
        'Only tenant users can modify ingredient data'
      )
    }
    const tenantId = ctx.tenantId

    // Snapshot before
    const before = await this.buildSnapshot(id, tenantId)

    // Execute the save transaction
    await this.prisma.$transaction(async (tx) => {
      // Verify ingredient exists
      const ingredient = await tx.ingredient.findUnique({ where: { id } })
      if (!ingredient) throw new NotFoundException('Ingredient not found')

      // Validate referenced entities belong to same tenant
      if (dto.allergens?.added?.length) {
        const allergenIds = dto.allergens.added.map((a) => a.allergenId)
        const existingAllergens = await tx.allergen.findMany({
          where: { id: { in: allergenIds }, tenantId }
        })
        if (existingAllergens.length !== allergenIds.length) {
          throw new NotFoundException(
            'One or more allergens not found in this tenant'
          )
        }
      }
      if (dto.nutrients?.added?.length) {
        const nutrientIds = dto.nutrients.added.map((n) => n.nutrientId)
        const existingNutrients = await tx.nutrient.findMany({
          where: { id: { in: nutrientIds }, tenantId }
        })
        if (existingNutrients.length !== nutrientIds.length) {
          throw new NotFoundException(
            'One or more nutrients not found in this tenant'
          )
        }
      }

      // --- Handle Allergens ---
      if (dto.allergens) {
        if (dto.allergens.removed?.length) {
          await tx.ingredientAllergen.deleteMany({
            where: {
              id: { in: dto.allergens.removed },
              ingredientId: id,
              tenantId
            }
          })
        }
        if (dto.allergens.added?.length) {
          const now = new Date()
          for (const a of dto.allergens.added) {
            await tx.ingredientAllergen.create({
              data: {
                id: Id.generate().value,
                ingredientId: id,
                allergenId: a.allergenId,
                relationType: a.relationType,
                tenantId,
                createdAt: now,
                updatedAt: now
              }
            })
          }
        }
        if (dto.allergens.updated?.length) {
          for (const a of dto.allergens.updated) {
            await tx.ingredientAllergen.updateMany({
              where: { id: a.id, tenantId },
              data: {
                relationType: a.relationType,
                updatedAt: new Date()
              }
            })
          }
        }
      }

      // --- Handle Nutrients ---
      if (dto.nutrients) {
        if (dto.nutrients.removed?.length) {
          await tx.ingredientNutrient.deleteMany({
            where: {
              id: { in: dto.nutrients.removed },
              ingredientId: id,
              tenantId
            }
          })
        }
        if (dto.nutrients.added?.length) {
          const now = new Date()
          for (const n of dto.nutrients.added) {
            await tx.ingredientNutrient.create({
              data: {
                id: Id.generate().value,
                ingredientId: id,
                nutrientId: n.nutrientId,
                value:
                  n.value !== null && n.value !== undefined
                    ? new Prisma.Decimal(n.value)
                    : null,
                tenantId,
                createdAt: now,
                updatedAt: now
              }
            })
          }
        }
        if (dto.nutrients.updated?.length) {
          for (const n of dto.nutrients.updated) {
            await tx.ingredientNutrient.updateMany({
              where: { id: n.id, tenantId },
              data: {
                value:
                  n.value !== null && n.value !== undefined
                    ? new Prisma.Decimal(n.value)
                    : null,
                updatedAt: new Date()
              }
            })
          }
        }
      }

      // --- Handle Profiles (upsert, strip system-managed fields) ---
      if (dto.regulatoryProfile) {
        const {
          id: _id,
          createdAt: _createdAt,
          updatedAt: _updatedAt,
          ingredientId: _ingredientId,
          tenantId: _tenantId,
          systemState: _systemState,
          ...cleanData
        } = dto.regulatoryProfile as any
        await tx.ingredientRegulatoryProfile.upsert({
          where: { ingredientId: id },
          create: {
            ...cleanData,
            ingredientId: id,
            tenantId,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          update: { ...cleanData, updatedAt: new Date() }
        })
      }
      if (dto.labelingProfile) {
        const {
          id: _id,
          createdAt: _createdAt,
          updatedAt: _updatedAt,
          ingredientId: _ingredientId,
          tenantId: _tenantId,
          systemState: _systemState,
          ...cleanData
        } = dto.labelingProfile as any
        await tx.ingredientLabelingProfile.upsert({
          where: { ingredientId: id },
          create: {
            ...cleanData,
            ingredientId: id,
            tenantId,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          update: { ...cleanData, updatedAt: new Date() }
        })
      }
      if (dto.technicalProfile) {
        const {
          id: _id,
          createdAt: _createdAt,
          updatedAt: _updatedAt,
          ingredientId: _ingredientId,
          tenantId: _tenantId,
          systemState: _systemState,
          ...cleanData
        } = dto.technicalProfile as any
        await tx.ingredientTechnicalProfile.upsert({
          where: { ingredientId: id },
          create: {
            ...cleanData,
            ingredientId: id,
            tenantId,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          update: { ...cleanData, updatedAt: new Date() }
        })
      }
    })

    // Snapshot after
    const after = await this.buildSnapshot(id, tenantId)

    // Log the update
    await this.auditLogService.create(
      {
        entityName: 'Ingredient',
        entityId: id,
        userId: ctx.userId,
        tenantId,
        ipAddress: null,
        userAgent: null,
        action: 'INGREDIENT_UPDATED',
        before,
        after,
        description: dto.description ?? null
      },
      ctx
    )

    return this.findById(id, ctx)
  }

  private async buildSnapshot(
    ingredientId: string,
    tenantId: string
  ): Promise<Record<string, unknown>> {
    const [
      ingredient,
      allergens,
      nutrients,
      regulatoryProfile,
      labelingProfile,
      technicalProfile
    ] = await Promise.all([
      this.prisma.ingredient.findUnique({ where: { id: ingredientId } }),
      this.prisma.ingredientAllergen.findMany({
        where: { ingredientId, tenantId },
        include: { allergen: { select: { name: true } } }
      }),
      this.prisma.ingredientNutrient.findMany({
        where: { ingredientId, tenantId },
        include: { nutrient: { select: { name: true, unit: true } } }
      }),
      this.prisma.ingredientRegulatoryProfile.findUnique({
        where: { ingredientId }
      }),
      this.prisma.ingredientLabelingProfile.findUnique({
        where: { ingredientId }
      }),
      this.prisma.ingredientTechnicalProfile.findUnique({
        where: { ingredientId }
      })
    ])

    return {
      ingredient: ingredient
        ? {
            code: ingredient.code,
            internalName: ingredient.internalName,
            commercialName: ingredient.commercialName,
            saleDenomination: ingredient.saleDenomination,
            functionalGroupId: ingredient.functionalGroupId,
            ingredientFunction: ingredient.ingredientFunction,
            notes: ingredient.notes,
            manufacturerId: ingredient.manufacturerId,
            supplierId: ingredient.supplierId,
            technicalSourceId: ingredient.technicalSourceId,
            usageIndication: ingredient.usageIndication,
            ingredientsListDesc: ingredient.ingredientsListDesc
          }
        : null,
      allergens: allergens.map((a) => ({
        id: a.id,
        allergenId: a.allergenId,
        name: a.allergen.name,
        relationType: a.relationType
      })),
      nutrients: nutrients.map((n) => ({
        id: n.id,
        nutrientId: n.nutrientId,
        name: n.nutrient.name,
        unit: n.nutrient.unit,
        value: n.value?.toString() ?? null
      })),
      regulatoryProfile: regulatoryProfile
        ? {
            hasRtiq: regulatoryProfile.hasRtiq,
            isGmo: regulatoryProfile.isGmo,
            gmoIngredient: regulatoryProfile.gmoIngredient,
            gmoDonorSpecies: regulatoryProfile.gmoDonorSpecies,
            gmoPercentage: regulatoryProfile.gmoPercentage?.toString() ?? null,
            isIrradiated: regulatoryProfile.isIrradiated,
            irradiatedIngredient: regulatoryProfile.irradiatedIngredient,
            containsLactose: regulatoryProfile.containsLactose,
            containsGluten: regulatoryProfile.containsGluten,
            containsAspartame: regulatoryProfile.containsAspartame,
            flavorOriginType: regulatoryProfile.flavorOriginType,
            colorantOriginType: regulatoryProfile.colorantOriginType
          }
        : null,
      labelingProfile: labelingProfile
        ? {
            containsAddedSugars: labelingProfile.containsAddedSugars,
            containsIngredientWithAddedSugars:
              labelingProfile.containsIngredientWithAddedSugars,
            containsNaturallyOccurringSugarSubstitutes:
              labelingProfile.containsNaturallyOccurringSugarSubstitutes,
            usesProcessingThatIncreasesSugars:
              labelingProfile.usesProcessingThatIncreasesSugars,
            containsAddedFatsOrOils: labelingProfile.containsAddedFatsOrOils,
            containsButterOrMargarine:
              labelingProfile.containsButterOrMargarine,
            containsDairyCream: labelingProfile.containsDairyCream,
            containsIngredientsWithFatsOrCream:
              labelingProfile.containsIngredientsWithFatsOrCream
          }
        : null,
      technicalProfile: technicalProfile
        ? {
            pac: technicalProfile.pac?.toString() ?? null,
            pod: technicalProfile.pod?.toString() ?? null,
            totalSolids: technicalProfile.totalSolids?.toString() ?? null,
            ashContent: technicalProfile.ashContent?.toString() ?? null
          }
        : null
    }
  }
}
