import { DeclarationFlag_PLService } from './declaration-flag-pl.service'
import { DeclarationFlag_PL } from './declaration-flag-pl.entity'
import { DeclarationFlag_PLNotFoundError } from './declaration-flag-pl.errors'
import { UserScope } from '@users/user.types'
import type { RequestContext } from '@authorization/authorization.types'

describe('DeclarationFlag_PLService', () => {
  let service: DeclarationFlag_PLService
  let repository: any

  const platformCtx: RequestContext = {
    userId: 'admin',
    scope: UserScope.PLATFORM,
    roles: ['ADMIN'],
    impersonatedTenantId: null
  }

  const defaultCreateProps = {
    code: 'TEST_FLAG',
    name: 'Test Flag',
    description: null,
    appliesTo: 'INGREDIENT' as const
  }

  function createEntity(overrides: Record<string, any> = {}): DeclarationFlag_PL {
    return DeclarationFlag_PL.create({
      ...defaultCreateProps,
      ...overrides
    })
  }

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn()
    }

    service = new DeclarationFlag_PLService(repository)
  })

  describe('create', () => {
    it('should create entity and save', async () => {
      const entity = createEntity()
      repository.save.mockResolvedValue(entity)

      const result = await service.create(defaultCreateProps, platformCtx)

      expect(result.code).toBe('TEST_FLAG')
      expect(repository.save).toHaveBeenCalledWith(
        expect.any(DeclarationFlag_PL),
        platformCtx
      )
    })
  })

  describe('findById', () => {
    it('should return entity when found', async () => {
      const entity = createEntity()
      repository.findById.mockResolvedValue(entity)

      const result = await service.findById(entity.id.value, platformCtx)

      expect(repository.findById).toHaveBeenCalledWith(entity.id.value, platformCtx)
      expect(result).toBe(entity)
    })

    it('should throw DeclarationFlag_PLNotFoundError when not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.findById('nonexistent', platformCtx)).rejects.toThrow(
        DeclarationFlag_PLNotFoundError
      )
    })
  })

  describe('findAll', () => {
    it('should call repository.findAll with empty filter and ctx', async () => {
      const entity = createEntity()
      repository.findAll.mockResolvedValue([entity])

      const result = await service.findAll(platformCtx)

      expect(repository.findAll).toHaveBeenCalledWith({}, platformCtx)
      expect(result).toHaveLength(1)
      expect(result[0]).toBe(entity)
    })
  })

  describe('delete', () => {
    it('should find entity, call delete, and save', async () => {
      const entity = createEntity()
      repository.findById.mockResolvedValue(entity)
      repository.save.mockResolvedValue(entity)

      await service.delete(entity.id.value, platformCtx)

      expect(repository.findById).toHaveBeenCalledWith(entity.id.value, platformCtx)
      expect(repository.save).toHaveBeenCalled()
    })

    it('should throw DeclarationFlag_PLNotFoundError when entity not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.delete('nonexistent', platformCtx)).rejects.toThrow(
        DeclarationFlag_PLNotFoundError
      )
    })
  })
})
