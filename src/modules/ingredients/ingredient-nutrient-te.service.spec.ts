import { NotFoundException, InternalServerErrorException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { IngredientNutrient_TEService } from './ingredient-nutrient-te.service'
import { IngredientNutrient_TE } from './ingredient-nutrient-te.entity'
import { UserScope } from '@users/user.types'
import type { RequestContext } from '@authorization/authorization.types'

describe('IngredientNutrient_TEService', () => {
  let service: IngredientNutrient_TEService
  let repository: any

  const tenantCtx: RequestContext = {
    userId: 'user-1',
    scope: UserScope.TENANT,
    tenantId: 'tenant-1',
    roles: ['ADMIN'],
  }

  const platformCtx: RequestContext = {
    userId: 'admin',
    scope: UserScope.PLATFORM,
    roles: ['ADMIN'],
    impersonatedTenantId: null,
  }

  const defaultCreateProps = {
    ingredientId: 'ingredient-1',
    nutrientId: 'nutrient-1',
    value: 10.5,
    sourceId: null,
  }

  function createEntity(overrides: Record<string, any> = {}): IngredientNutrient_TE {
    return IngredientNutrient_TE.create({
      ...defaultCreateProps,
      tenantId: 'tenant-1',
      ...overrides,
    })
  }

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findByIngredientId: jest.fn(),
      findByNutrientId: jest.fn(),
      remove: jest.fn(),
      removeAllForIngredient: jest.fn(),
    }
    service = new IngredientNutrient_TEService(repository)
  })

  describe('create', () => {
    it('should resolve tenantId from ctx, create entity, and save', async () => {
      const entity = createEntity()
      repository.create.mockResolvedValue(entity)

      const result = await service.create(defaultCreateProps, tenantCtx)

      expect(result.tenantId).toBe('tenant-1')
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          _props: expect.objectContaining({ tenantId: 'tenant-1' }),
        }),
        tenantCtx,
      )
    })

    it('should throw InternalServerErrorException when ctx has no tenantId', async () => {
      await expect(
        service.create(defaultCreateProps, platformCtx),
      ).rejects.toThrow(InternalServerErrorException)
    })
  })

  describe('findByIngredientId', () => {
    it('should return list of entries', async () => {
      const list = [createEntity()]
      repository.findByIngredientId.mockResolvedValue(list)

      const result = await service.findByIngredientId('ingredient-1', tenantCtx)

      expect(repository.findByIngredientId).toHaveBeenCalledWith('ingredient-1', tenantCtx)
      expect(result).toHaveLength(1)
    })

    it('should return empty array when none found', async () => {
      repository.findByIngredientId.mockResolvedValue([])

      const result = await service.findByIngredientId('nonexistent', tenantCtx)

      expect(result).toHaveLength(0)
    })
  })

  describe('findByNutrientId', () => {
    it('should return list of entries for nutrient', async () => {
      const list = [createEntity()]
      repository.findByNutrientId.mockResolvedValue(list)

      const result = await service.findByNutrientId('nutrient-1', tenantCtx)

      expect(repository.findByNutrientId).toHaveBeenCalledWith('nutrient-1', tenantCtx)
      expect(result).toHaveLength(1)
    })
  })

  describe('remove', () => {
    it('should call repository.remove', async () => {
      repository.remove.mockResolvedValue(undefined)

      await service.remove('entry-1', tenantCtx)

      expect(repository.remove).toHaveBeenCalledWith('entry-1', tenantCtx)
    })

    it('should throw NotFoundException when Prisma P2025 error occurs', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: '5.0.0',
      })
      repository.remove.mockRejectedValue(prismaError)

      await expect(service.remove('nonexistent', tenantCtx)).rejects.toThrow(NotFoundException)
    })
  })

  describe('removeAllForIngredient', () => {
    it('should call repository.removeAllForIngredient', async () => {
      await service.removeAllForIngredient('ingredient-1', tenantCtx)

      expect(repository.removeAllForIngredient).toHaveBeenCalledWith('ingredient-1', tenantCtx)
    })
  })
})
