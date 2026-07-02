import { Allergen_PLService } from './allergen-pl.service'
import { Allergen_PL } from './allergen-pl.entity'
import { Allergen_PLNotFoundError } from './allergen-pl.errors'
import { UserScope } from '@users/user.types'
import type { RequestContext } from '@authorization/authorization.types'

describe('Allergen_PLService', () => {
  let service: Allergen_PLService
  let repository: any

  const platformCtx: RequestContext = {
    userId: 'admin',
    scope: UserScope.PLATFORM,
    roles: ['ADMIN'],
    impersonatedTenantId: null
  }

  const defaultCreateProps = {
    name: 'Test Allergen',
    category: null,
    regulatoryRef: null,
    sortOrder: 1
  }

  function createEntity(overrides: Record<string, any> = {}): Allergen_PL {
    return Allergen_PL.create({
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

    service = new Allergen_PLService(repository)
  })

  describe('create', () => {
    it('should create entity and save', async () => {
      const entity = createEntity()
      repository.save.mockResolvedValue(entity)

      const result = await service.create(defaultCreateProps, platformCtx)

      expect(result.name).toBe('Test Allergen')
      expect(repository.save).toHaveBeenCalledWith(
        expect.any(Allergen_PL),
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

    it('should throw Allergen_PLNotFoundError when not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.findById('nonexistent', platformCtx)).rejects.toThrow(
        Allergen_PLNotFoundError
      )
    })
  })

  describe('findAll', () => {
    it('should call repository.findAll with filter and ctx', async () => {
      const entity = createEntity()
      repository.findAll.mockResolvedValue([entity])

      const filter = { name: 'Test' }
      const result = await service.findAll(filter, platformCtx)

      expect(repository.findAll).toHaveBeenCalledWith(filter, platformCtx)
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

    it('should throw Allergen_PLNotFoundError when entity not found', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.delete('nonexistent', platformCtx)).rejects.toThrow(
        Allergen_PLNotFoundError
      )
    })
  })
})
