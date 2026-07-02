import { InternalServerErrorException } from '@nestjs/common'
import { IngredientCost_TEService } from './ingredient-cost-te.service'
import { IngredientCost_TE } from './ingredient-cost-te.entity'
import { IngredientCost_TENotFoundError } from './ingredient-cost-te.errors'
import { SystemState } from '@shared/behaviours/lockable'
import { UserScope } from '@users/user.types'
import type { RequestContext } from '@authorization/authorization.types'

describe('IngredientCost_TEService', () => {
  let service: IngredientCost_TEService
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
    unitPrice: 12.5,
    currencyCode: 'BRL',
    unitOfMeasureId: 'uom-1',
    effectiveDate: new Date('2025-01-01'),
    supplierId: null,
    notes: null,
  }

  function createEntity(overrides: Record<string, any> = {}): IngredientCost_TE {
    return IngredientCost_TE.create({
      ...defaultCreateProps,
      tenantId: 'tenant-1',
      ...overrides,
    })
  }

  function rehydrateEntity(overrides: Record<string, any> = {}): IngredientCost_TE {
    const fresh = createEntity()
    return IngredientCost_TE.rehydrate({
      id: fresh.id,
      tenantId: fresh.tenantId,
      ingredientId: fresh.ingredientId,
      unitPrice: fresh.unitPrice,
      currencyCode: fresh.currencyCode,
      unitOfMeasureId: fresh.unitOfMeasureId,
      effectiveDate: fresh.effectiveDate,
      supplierId: fresh.supplierId,
      notes: fresh.notes,
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
      findByIngredientId: jest.fn(),
    }
    service = new IngredientCost_TEService(repository)
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

      const filter = { ingredientId: 'ingredient-1' }
      const result = await service.findAll(filter, tenantCtx)

      expect(repository.findAll).toHaveBeenCalledWith(filter, tenantCtx)
      expect(result).toHaveLength(1)
    })
  })

  describe('findByIngredientId', () => {
    it('should return list of entries for ingredient', async () => {
      const list = [createEntity()]
      repository.findByIngredientId.mockResolvedValue(list)

      const result = await service.findByIngredientId('ingredient-1', tenantCtx)

      expect(repository.findByIngredientId).toHaveBeenCalledWith('ingredient-1', tenantCtx)
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

    it('should throw IngredientCost_TENotFoundError when not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.findById('nonexistent', tenantCtx)).rejects.toThrow(
        IngredientCost_TENotFoundError,
      )
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

    it('should throw IngredientCost_TENotFoundError when not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.delete('nonexistent', tenantCtx)).rejects.toThrow(
        IngredientCost_TENotFoundError,
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
