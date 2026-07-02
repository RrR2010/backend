import { InternalServerErrorException } from '@nestjs/common'
import { ProductNutrientOverride_TEService } from './product-nutrient-override-te.service'
import { ProductNutrientOverride_TE } from './product-nutrient-override-te.entity'
import { ProductNutrientOverride_TENotFoundError } from './product-nutrient-override-te.errors'
import { UserScope } from '@users/user.types'
import type { RequestContext } from '@authorization/authorization.types'

describe('ProductNutrientOverride_TEService', () => {
  let service: ProductNutrientOverride_TEService
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
    productId: 'product-1',
    nutrientId: 'nutrient-1',
    overriddenValue: 15.5,
    notes: null,
  }

  function createEntity(overrides: Record<string, any> = {}): ProductNutrientOverride_TE {
    return ProductNutrientOverride_TE.create({
      ...defaultCreateProps,
      tenantId: 'tenant-1',
      ...overrides,
    })
  }

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByProduct: jest.fn(),
      delete: jest.fn(),
    }
    service = new ProductNutrientOverride_TEService(repository)
  })

  describe('create', () => {
    it('should resolve tenantId from ctx, create entity, and save', async () => {
      const entity = createEntity()
      repository.save.mockResolvedValue(entity)

      const result = await service.create(defaultCreateProps, tenantCtx)

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
        service.create(defaultCreateProps, platformCtx),
      ).rejects.toThrow(InternalServerErrorException)
    })
  })

  describe('findAll', () => {
    it('should return list of entries', async () => {
      const list = [createEntity()]
      repository.findAll.mockResolvedValue(list)

      const filter = { productId: 'product-1' }
      const result = await service.findAll(filter, tenantCtx)

      expect(repository.findAll).toHaveBeenCalledWith(filter, tenantCtx)
      expect(result).toHaveLength(1)
    })
  })

  describe('findById', () => {
    it('should return entity when found', async () => {
      const entity = createEntity()
      repository.findById.mockResolvedValue(entity)

      const result = await service.findById(entity.id.value, tenantCtx)

      expect(repository.findById).toHaveBeenCalledWith(entity.id.value, tenantCtx)
      expect(result).toBe(entity)
    })

    it('should throw ProductNutrientOverride_TENotFoundError when not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.findById('nonexistent', tenantCtx)).rejects.toThrow(
        ProductNutrientOverride_TENotFoundError,
      )
    })
  })

  describe('findByProduct', () => {
    it('should return list of entries for product', async () => {
      const list = [createEntity()]
      repository.findByProduct.mockResolvedValue(list)

      const result = await service.findByProduct('product-1', tenantCtx)

      expect(repository.findByProduct).toHaveBeenCalledWith('product-1', tenantCtx)
      expect(result).toHaveLength(1)
    })
  })

  describe('delete', () => {
    it('should find entity and call repository.delete', async () => {
      const entity = createEntity()
      repository.findById.mockResolvedValue(entity)
      repository.delete.mockResolvedValue(undefined)

      await service.delete(entity.id.value, tenantCtx)

      expect(repository.findById).toHaveBeenCalledWith(entity.id.value, tenantCtx)
      expect(repository.delete).toHaveBeenCalledWith(entity.id.value, tenantCtx)
    })

    it('should throw ProductNutrientOverride_TENotFoundError when not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.delete('nonexistent', tenantCtx)).rejects.toThrow(
        ProductNutrientOverride_TENotFoundError,
      )
    })
  })
})
