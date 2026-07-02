import { InternalServerErrorException } from '@nestjs/common'
import { IngredientFlag_TEService } from './ingredient-flag-te.service'
import { IngredientFlag_TE } from './ingredient-flag-te.entity'
import { IngredientFlag_TENotFoundError } from './ingredient-flag-te.errors'
import { SystemState } from '@shared/behaviours/lockable'
import { UserScope } from '@users/user.types'
import type { RequestContext } from '@authorization/authorization.types'

describe('IngredientFlag_TEService', () => {
  let service: IngredientFlag_TEService
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
    flagId: 'flag-1',
    flagValue: true,
    notes: null,
  }

  function createEntity(overrides: Record<string, any> = {}): IngredientFlag_TE {
    return IngredientFlag_TE.create({
      ...defaultCreateProps,
      tenantId: 'tenant-1',
      ...overrides,
    })
  }

  function rehydrateEntity(overrides: Record<string, any> = {}): IngredientFlag_TE {
    const fresh = createEntity()
    return IngredientFlag_TE.rehydrate({
      id: fresh.id,
      tenantId: fresh.tenantId,
      ingredientId: fresh.ingredientId,
      flagId: fresh.flagId,
      flagValue: fresh.flagValue,
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
    service = new IngredientFlag_TEService(repository)
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

  describe('findById', () => {
    it('should return entity when found', async () => {
      const entity = createEntity()
      repository.findById.mockResolvedValue(entity)

      const result = await service.findById(entity.id.value, tenantCtx)

      expect(repository.findById).toHaveBeenCalledWith(entity.id.value, tenantCtx)
      expect(result).toBe(entity)
    })

    it('should throw IngredientFlag_TENotFoundError when not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.findById('nonexistent', tenantCtx)).rejects.toThrow(
        IngredientFlag_TENotFoundError,
      )
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

  describe('delete', () => {
    it('should find entity, call delete(), and save', async () => {
      const entity = createEntity()
      repository.findById.mockResolvedValue(entity)
      repository.save.mockResolvedValue(entity)

      await service.delete(entity.id.value, tenantCtx)

      expect(repository.findById).toHaveBeenCalledWith(entity.id.value, tenantCtx)
      expect(repository.save).toHaveBeenCalled()
    })

    it('should throw IngredientFlag_TENotFoundError when not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.delete('nonexistent', tenantCtx)).rejects.toThrow(
        IngredientFlag_TENotFoundError,
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
