import { InternalServerErrorException } from '@nestjs/common'
import { ProductPanel_TEService } from './product-panel-te.service'
import { ProductPanel_TE } from './product-panel-te.entity'
import { ProductPanel_TENotFoundError } from './product-panel-te.errors'
import { SystemState } from '@shared/behaviours/lockable'
import { ProductPanelType } from '@prisma/client'
import { UserScope } from '@users/user.types'
import type { RequestContext } from '@authorization/authorization.types'

describe('ProductPanel_TEService', () => {
  let service: ProductPanel_TEService
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
    panelNumber: 1,
    type: ProductPanelType.NUTRITIONAL,
    geometricFormatTypeId: null,
    geometricFormatValues: null,
  }

  function createEntity(overrides: Record<string, any> = {}): ProductPanel_TE {
    return ProductPanel_TE.create({
      ...defaultCreateProps,
      tenantId: 'tenant-1',
      ...overrides,
    })
  }

  function rehydrateEntity(overrides: Record<string, any> = {}): ProductPanel_TE {
    const fresh = createEntity()
    return ProductPanel_TE.rehydrate({
      id: fresh.id,
      tenantId: fresh.tenantId,
      productId: fresh.productId,
      panelNumber: fresh.panelNumber,
      type: fresh.type,
      geometricFormatTypeId: fresh.geometricFormatTypeId,
      geometricFormatValues: fresh.geometricFormatValues,
      systemState: SystemState.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    })
  }

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByProduct: jest.fn(),
    }
    service = new ProductPanel_TEService(repository)
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

    it('should throw ProductPanel_TENotFoundError when not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.findById('nonexistent', tenantCtx)).rejects.toThrow(
        ProductPanel_TENotFoundError,
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
    it('should find entity, call delete(), and save', async () => {
      const entity = createEntity()
      repository.findById.mockResolvedValue(entity)
      repository.save.mockResolvedValue(entity)

      await service.delete(entity.id.value, tenantCtx)

      expect(repository.findById).toHaveBeenCalledWith(entity.id.value, tenantCtx)
      expect(repository.save).toHaveBeenCalled()
    })

    it('should throw ProductPanel_TENotFoundError when not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.delete('nonexistent', tenantCtx)).rejects.toThrow(
        ProductPanel_TENotFoundError,
      )
    })
  })

  describe('activate', () => {
    it('should find entity, activate, and save', async () => {
      const entity = rehydrateEntity({ systemState: SystemState.LOCKED })
      entity.unlock()
      repository.findById.mockResolvedValue(entity)
      repository.save.mockImplementation((e: any) => Promise.resolve(e))

      const result = await service.activate(entity.id.value, tenantCtx)

      expect(repository.save).toHaveBeenCalled()
      expect(result.systemState).toBe(SystemState.ACTIVE)
    })
  })

  describe('lock', () => {
    it('should find entity, lock, and save', async () => {
      const entity = createEntity()
      repository.findById.mockResolvedValue(entity)
      repository.save.mockImplementation((e: any) => Promise.resolve(e))

      const result = await service.lock(entity.id.value, tenantCtx)

      expect(repository.save).toHaveBeenCalled()
      expect(result.systemState).toBe(SystemState.LOCKED)
    })
  })

  describe('unlock', () => {
    it('should find entity, unlock, and save', async () => {
      const entity = rehydrateEntity({ systemState: SystemState.LOCKED })
      repository.findById.mockResolvedValue(entity)
      repository.save.mockImplementation((e: any) => Promise.resolve(e))

      const result = await service.unlock(entity.id.value, tenantCtx)

      expect(repository.save).toHaveBeenCalled()
      expect(result.systemState).toBe(SystemState.ACTIVE)
    })
  })
})
