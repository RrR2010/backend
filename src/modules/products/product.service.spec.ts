import { InternalServerErrorException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { ProductService } from './product.service'
import { Product_TE } from './product.entity'
import { ProductNotFoundError, ProductAlreadyExistsError } from './product.errors'
import { Id } from '@shared/value-objects'
import { SystemState } from '@shared/behaviours/lockable'

describe('ProductService', () => {
  let service: ProductService
  let repository: any

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

  const defaultCreateProps = {
    internalName: 'Test Product',
    code: 'PROD-001',
    tenantId: 'tenant-1',
  }

  function createProduct(overrides: Record<string, any> = {}): Product_TE {
    return Product_TE.create({
      ...defaultCreateProps,
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
    service = new ProductService(repository)
  })

  // --------------- create ---------------

  describe('create', () => {
    it('should resolve tenantId from ctx, create entity, and save', async () => {
      const saved = createProduct()
      repository.save.mockResolvedValue(saved)

      const result = await service.create(
        { internalName: 'Test Product', code: 'PROD-001' },
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
        service.create(
          { internalName: 'Test Product', code: 'PROD-001' },
          platformCtx,
        ),
      ).rejects.toThrow(InternalServerErrorException)
    })

    it('should throw ProductAlreadyExistsError on P2002', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: '5.0' },
      )
      repository.save.mockRejectedValue(prismaError)

      await expect(
        service.create(
          { internalName: 'Test Product', code: 'PROD-001' },
          tenantCtx,
        ),
      ).rejects.toThrow(ProductAlreadyExistsError)
    })

    it('should rethrow non-P2002 errors from save', async () => {
      const genericError = new Error('DB connection lost')
      repository.save.mockRejectedValue(genericError)

      await expect(
        service.create(
          { internalName: 'Test Product', code: 'PROD-001' },
          tenantCtx,
        ),
      ).rejects.toThrow('DB connection lost')
    })
  })

  // --------------- findById ---------------

  describe('findById', () => {
    it('should return product when found', async () => {
      const product = createProduct()
      repository.findById.mockResolvedValue(product)

      const result = await service.findById(product.id.value, tenantCtx)

      expect(repository.findById).toHaveBeenCalledWith(product.id.value, tenantCtx)
      expect(result).toBe(product)
    })

    it('should throw ProductNotFoundError when not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.findById('nonexistent', tenantCtx)).rejects.toThrow(
        ProductNotFoundError,
      )
    })
  })

  // --------------- findAll ---------------

  describe('findAll', () => {
    it('should return list of products', async () => {
      const list = [createProduct()]
      repository.findAll.mockResolvedValue(list)

      const filter = { status: 'DRAFT' }
      const result = await service.findAll(filter, tenantCtx)

      expect(repository.findAll).toHaveBeenCalledWith(filter, tenantCtx)
      expect(result).toHaveLength(1)
    })
  })

  // --------------- update ---------------

  describe('update', () => {
    it('should find product, apply changes, and save', async () => {
      const product = createProduct({ internalName: 'Original' })
      repository.findById.mockResolvedValue(product)
      repository.save.mockResolvedValue(product)

      const result = await service.update(
        product.id.value,
        { internalName: 'Updated' },
        tenantCtx,
      )

      expect(repository.findById).toHaveBeenCalledWith(product.id.value, tenantCtx)
      expect(product.internalName).toBe('Updated')
      expect(repository.save).toHaveBeenCalled()
    })

    it('should throw ProductNotFoundError when product not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(
        service.update('nonexistent', { internalName: 'Updated' }, tenantCtx),
      ).rejects.toThrow(ProductNotFoundError)
    })

    it('should throw ProductAlreadyExistsError on P2002 during save', async () => {
      const product = createProduct()
      repository.findById.mockResolvedValue(product)

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: '5.0' },
      )
      repository.save.mockRejectedValue(prismaError)

      await expect(
        service.update(
          product.id.value,
          { code: 'DUPLICATE-CODE' },
          tenantCtx,
        ),
      ).rejects.toThrow(ProductAlreadyExistsError)
    })
  })

  // --------------- delete ---------------

  describe('delete', () => {
    it('should find product and call repo.delete', async () => {
      const product = createProduct()
      repository.findById.mockResolvedValue(product)
      repository.delete.mockResolvedValue(undefined)

      await service.delete(product.id.value, tenantCtx)

      expect(repository.findById).toHaveBeenCalledWith(product.id.value, tenantCtx)
      expect(repository.delete).toHaveBeenCalledWith(product.id.value, tenantCtx)
    })

    it('should throw ProductNotFoundError when product not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.delete('nonexistent', tenantCtx)).rejects.toThrow(
        ProductNotFoundError,
      )
    })
  })
})
